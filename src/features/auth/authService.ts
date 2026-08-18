import apiClient from "@/api/client";
import axios from "axios";
import { ENDPOINTS } from "@/api/endpoints";
import { mapUser } from "@/api/mappers";
import { extractTokens } from "@/api/normalize";
import {
  clearTokens,
  getRefreshToken,
  getTokens,
  storeTokens,
} from "@/lib/tokenStorage";
import type {
  AuthTokens,
  CompleteProfilePayload,
  LoginPayload,
  RegisterPayload,
  User,
  VerifyOtpPayload,
} from "@/types";

async function persistSession(data: unknown): Promise<{
  tokens: AuthTokens;
  user: User;
}> {
  const extracted = extractTokens(data);
  if (!extracted.accessToken) throw new Error("No access token returned");
  storeTokens(extracted.accessToken, extracted.refreshToken);
  return {
    tokens: {
      accessToken: extracted.accessToken,
      refreshToken: extracted.refreshToken,
    },
    user: mapUser(extracted.user),
  };
}

export async function registerAccount(payload: RegisterPayload) {
  await apiClient.post(ENDPOINTS.AUTH.REGISTER, payload);
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const { data } = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, payload);
  return persistSession(data);
}

export async function resendOtp(
  email: string,
  purpose: "EMAIL_VERIFY" | "PASSWORD_RESET" = "EMAIL_VERIFY",
) {
  await apiClient.post(ENDPOINTS.AUTH.RESEND_OTP, { email, purpose });
}

export async function loginWithEmail(payload: LoginPayload) {
  const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
  return persistSession(data);
}

export async function forgotPassword(email: string) {
  await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
}

export async function resetPassword(payload: {
  email: string;
  code: string;
  password: string;
}) {
  const { data } = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  return persistSession(data);
}

export async function signInWithGoogleIdToken(idToken: string) {
  const { data } = await apiClient.post(ENDPOINTS.AUTH.GOOGLE, {
    idToken,
  });
  return persistSession(data);
}

export async function restoreSession(): Promise<User | null> {
  try {
    const tokens = getTokens();
    if (!tokens) return null;
    const { data } = await apiClient.get(ENDPOINTS.USERS.ME, { timeout: 8000 });
    return mapUser(data?.user ?? data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      clearTokens();
    }
    return null;
  }
}

export async function logout() {
  try {
    const refreshToken = getRefreshToken();
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT, refreshToken ? { refreshToken } : {});
  } catch {
    // ignore
  } finally {
    clearTokens();
  }
}

export async function completeProfile(payload: CompleteProfilePayload) {
  const { data } = await apiClient.patch(
    ENDPOINTS.USERS.COMPLETE_PROFILE,
    payload,
  );
  return mapUser(data?.user ?? data);
}

export async function updateAvatar(avatarUrl: string) {
  const { data } = await apiClient.patch(ENDPOINTS.USERS.AVATAR, { url: avatarUrl });
  return mapUser(data?.user ?? data);
}
