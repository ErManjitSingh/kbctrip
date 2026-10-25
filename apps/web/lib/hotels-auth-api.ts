/**
 * Guest auth — KBC booking /guest/* (no Unotrips).
 */

import { ApiError, type ApiEnvelope } from "@/lib/api";
import {
  guestLogin as kbcGuestLogin,
  guestRegister as kbcGuestRegister,
  getGuestMe,
} from "@/lib/booking-api";

export type { ApiEnvelope };
export { ApiError, ApiError as HotelsAuthError };

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  partner_id?: string | null;
  kyc_status?: string | null;
  partner_status?: string | null;
  phone_verified?: boolean;
  email_verified?: boolean;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

function guestSessionToAuthResponse(session: {
  accessToken: string;
  guest: { id: string; email: string; name: string; phone: string | null };
}): AuthResponse {
  const now = new Date().toISOString();
  return {
    user: {
      id: session.guest.id,
      email: session.guest.email,
      name: session.guest.name,
      phone: session.guest.phone,
      avatar: null,
      role: "guest",
      is_verified: true,
      is_active: true,
      created_at: now,
      updated_at: now,
      phone_verified: Boolean(session.guest.phone),
      email_verified: true,
    },
    tokens: {
      access_token: session.accessToken,
      refresh_token: session.accessToken,
      expires_in: 60 * 60 * 24 * 7,
    },
  };
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "guest" | "partner";
}): Promise<AuthResponse> {
  const phone = payload.phone?.replace(/\D/g, "").slice(-10);
  try {
    const session = await kbcGuestRegister({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: phone || undefined,
    });
    return guestSessionToAuthResponse(session);
  } catch (err) {
    throw new ApiError(err instanceof Error ? err.message : "Registration failed.", 400);
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const session = await kbcGuestLogin({ email, password });
    return guestSessionToAuthResponse(session);
  } catch (err) {
    throw new ApiError(err instanceof Error ? err.message : "Login failed.", 401);
  }
}

export async function refreshAuthTokens(refreshToken: string): Promise<AuthTokens> {
  // KBC guest tokens are long-lived; treat refresh as identity check.
  const profile = await getGuestMe(refreshToken);
  if (!profile) throw new ApiError("Session expired.", 401);
  return {
    access_token: refreshToken,
    refresh_token: refreshToken,
    expires_in: 60 * 60 * 24 * 7,
  };
}

export async function fetchAuthMe(accessToken: string): Promise<AuthUser> {
  const profile = await getGuestMe(accessToken);
  if (!profile) throw new ApiError("Session expired. Please sign in again.", 401);
  const now = new Date().toISOString();
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: null,
    role: "guest",
    is_verified: true,
    is_active: true,
    created_at: now,
    updated_at: now,
    phone_verified: Boolean(profile.phone),
    email_verified: true,
  };
}

export async function logoutUser(_accessToken: string): Promise<void> {
  /* client clears session storage */
}

export async function guestSendOtp(_phone: string): Promise<{ message: string }> {
  throw new ApiError("Phone OTP is not available yet. Sign in with email on /login.", 501);
}

export async function guestVerifyOtp(_phone: string, _otp: string): Promise<AuthResponse> {
  throw new ApiError("Phone OTP is not available yet. Sign in with email on /login.", 501);
}

export async function loginOtpSend(_phone: string): Promise<{ message: string }> {
  throw new ApiError("Phone OTP is not available yet. Sign in with email on /login.", 501);
}

export async function loginOtpVerify(
  _phone: string,
  _otp: string,
  _name?: string,
): Promise<AuthResponse> {
  throw new ApiError("Phone OTP is not available yet. Sign in with email on /login.", 501);
}

export async function forgotPasswordOtpSend(_payload: {
  phone?: string;
  email?: string;
}): Promise<{ message: string }> {
  throw new ApiError("Password reset is not available yet. Sign in with email on /login.", 501);
}

export async function forgotPasswordOtpVerify(_payload: {
  otp: string;
  phone?: string;
  email?: string;
}): Promise<{ reset_token: string; message?: string }> {
  throw new ApiError("Password reset is not available yet. Sign in with email on /login.", 501);
}

export async function resetPassword(_token: string, _password: string): Promise<{ message: string }> {
  throw new ApiError("Password reset is not available yet. Sign in with email on /login.", 501);
}

/** @deprecated kept for callers that normalize Unotrips-shaped payloads */
export async function normalizeAuthPayload(data: unknown, _phone?: string): Promise<AuthResponse> {
  if (!data || typeof data !== "object") {
    throw new ApiError("Unexpected auth response from server.", 500);
  }
  const record = data as Record<string, unknown>;
  if (record.accessToken && record.guest) {
    return guestSessionToAuthResponse(
      record as { accessToken: string; guest: { id: string; email: string; name: string; phone: string | null } },
    );
  }
  throw new ApiError("Unexpected auth response from server.", 500);
}
