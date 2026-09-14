import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG, ENDPOINTS } from "./endpoints";
import { extractTokens } from "./normalize";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  storeTokens,
} from "@/lib/tokenStorage";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    skipAuthHeader?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryNetwork(error: AxiosError) {
  if (!error.config) return false;
  const status = error.response?.status;
  if (status && status < 500 && status !== 408 && status !== 429) return false;
  // Network / timeout / cold start
  return (
    !error.response ||
    error.code === "ECONNABORTED" ||
    error.code === "ERR_NETWORK" ||
    (status != null && status >= 500)
  );
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.skipAuthHeader) {
    delete config.headers.Authorization;
    return config;
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _networkRetryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Cold-start / flaky network retries (Render free tier)
    if (shouldRetryNetwork(error) && error.response?.status !== 401) {
      const count = originalRequest._networkRetryCount ?? 0;
      if (count < 3) {
        originalRequest._networkRetryCount = count + 1;
        await sleep(1200 * (count + 1));
        return apiClient(originalRequest);
      }
    }

    if (
      originalRequest.skipAuthRefresh ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      if (getAccessToken()) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("offerbid:session-cleared"));
        }
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken: refreshTokenValue },
        { timeout: API_CONFIG.TIMEOUT },
      );

      const tokens = extractTokens(data);
      storeTokens(tokens.accessToken, tokens.refreshToken);
      processQueue(null, tokens.accessToken);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("offerbid:session-cleared"));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function apiGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export default apiClient;
