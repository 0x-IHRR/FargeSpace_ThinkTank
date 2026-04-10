"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateMemberCredentials, type MemberLoginErrorCode } from "@/lib/directus-member-auth";
import { MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
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
    sessionExpiry: expiryDate.toISOString(),
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
  cookies().delete(MEMBER_SESSION_COOKIE_NAME);
  cookies().delete(MEMBER_REFRESH_COOKIE_NAME);
  redirect(MEMBER_LOGIN_ROUTE);
}
