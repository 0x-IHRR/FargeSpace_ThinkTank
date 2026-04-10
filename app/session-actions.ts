"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateMemberCredentials,
  logoutMemberRefreshToken,
  requestMemberPasswordReset,
  resetMemberPassword,
  type MemberLoginErrorCode,
  type PasswordResetConfirmErrorCode,
  type PasswordResetRequestErrorCode,
} from "@/lib/directus-member-auth";
import {
  getMemberPasswordResetUrl,
  MEMBER_FORGOT_PASSWORD_ROUTE,
  MEMBER_LOGIN_ROUTE,
  MEMBER_RESET_PASSWORD_ROUTE,
} from "@/lib/login-entry";
import {
  DEFAULT_SESSION_HOURS,
  MEMBER_REFRESH_COOKIE_NAME,
  MEMBER_SESSION_COOKIE_NAME,
  REMEMBER_SESSION_DAYS,
  encodeMemberSessionCookie,
  sanitizeNextPath,
} from "@/lib/session";

function redirectWithError(nextPath: string, code: MemberLoginErrorCode): never {
  redirect(
    `${MEMBER_LOGIN_ROUTE}?next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent(code)}`
  );
}

function redirectForgotPassword(code?: PasswordResetRequestErrorCode, status?: string): never {
  const params = new URLSearchParams();
  if (code) params.set("error", code);
  if (status) params.set("status", status);
  const query = params.toString();
  redirect(query ? `${MEMBER_FORGOT_PASSWORD_ROUTE}?${query}` : MEMBER_FORGOT_PASSWORD_ROUTE);
}

function redirectResetPassword(token: string, code?: PasswordResetConfirmErrorCode): never {
  const params = new URLSearchParams();
  if (token) params.set("token", token);
  if (code) params.set("error", code);
  const query = params.toString();
  redirect(query ? `${MEMBER_RESET_PASSWORD_ROUTE}?${query}` : MEMBER_RESET_PASSWORD_ROUTE);
}

export async function loginMember(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const remember = formData.get("remember") === "on";
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? "/"));

  if (!email || !password) {
    redirectWithError(nextPath, "missing_fields");
  }

  const authResult = await authenticateMemberCredentials(email, password);
  if (!authResult.ok) {
    redirectWithError(nextPath, authResult.code);
  }

  const now = Date.now();
  const ttlMs = remember
    ? REMEMBER_SESSION_DAYS * 24 * 60 * 60 * 1000
    : DEFAULT_SESSION_HOURS * 60 * 60 * 1000;
  const expiryDate = new Date(now + ttlMs);

  const session = {
    userId: authResult.member.userId,
    role: authResult.member.role,
    displayName: authResult.member.displayName,
    activeMemberTierCode: authResult.member.activeMemberTierCode,
    sessionExpiry: authResult.member.expiresInMs
      ? new Date(Date.now() + authResult.member.expiresInMs).toISOString()
      : expiryDate.toISOString(),
  };

  cookies().set(MEMBER_SESSION_COOKIE_NAME, encodeMemberSessionCookie(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiryDate,
  });

  if (authResult.member.refreshToken) {
    cookies().set(MEMBER_REFRESH_COOKIE_NAME, authResult.member.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiryDate,
    });
  } else {
    cookies().delete(MEMBER_REFRESH_COOKIE_NAME);
  }

  redirect(nextPath);
}

export async function logoutMember() {
  const refreshToken = cookies().get(MEMBER_REFRESH_COOKIE_NAME)?.value ?? null;
  await logoutMemberRefreshToken(refreshToken);
  cookies().delete(MEMBER_SESSION_COOKIE_NAME);
  cookies().delete(MEMBER_REFRESH_COOKIE_NAME);
  redirect(`${MEMBER_LOGIN_ROUTE}?status=signed_out`);
}

export async function requestMemberPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const resetUrl = getMemberPasswordResetUrl();

  const result = await requestMemberPasswordReset(email, resetUrl);
  if (!result.ok) {
    redirectForgotPassword(result.code);
  }

  redirectForgotPassword(undefined, "sent");
}

export async function resetMemberPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!token) {
    redirectResetPassword("", "missing_token");
  }

  if (!password || !confirmPassword) {
    redirectResetPassword(token, "missing_password");
  }

  if (password !== confirmPassword) {
    redirectResetPassword(token, "password_mismatch");
  }

  const result = await resetMemberPassword(token, password);
  if (!result.ok) {
    redirectResetPassword(token, result.code);
  }

  redirect(`${MEMBER_LOGIN_ROUTE}?status=reset_success`);
}
