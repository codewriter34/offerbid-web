const ACCESS_KEY = "offerbid_access_token";
const REFRESH_KEY = "offerbid_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getTokens() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken) return null;
  return { accessToken, refreshToken: refreshToken ?? "" };
}
