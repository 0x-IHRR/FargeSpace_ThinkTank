"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
import {
  DEFAULT_MEMBER_TIER_CODE,
  DEFAULT_SESSION_HOURS,
  MEMBER_SESSION_COOKIE_NAME,
  REMEMBER_SESSION_DAYS,
  encodeMemberSessionCookie,
  sanitizeNextPath,
} from "@/lib/session";

function toDisplayName(email: string) {
  const localPart = email.split("@")[0]?.trim();
  if (!localPart) {
    return "FargeSpace Member";
  }
  return localPart;
}

export async function loginMember(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const remember = formData.get("remember") === "on";
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? "/"));

  if (!email || !password) {
    redirect(`${MEMBER_LOGIN_ROUTE}?next=${encodeURIComponent(nextPath)}&error=missing_fields`);
  }

  const now = Date.now();
  const ttlMs = remember
    ? REMEMBER_SESSION_DAYS * 24 * 60 * 60 * 1000
    : DEFAULT_SESSION_HOURS * 60 * 60 * 1000;
  const expiryDate = new Date(now + ttlMs);

  const session = {
    userId: crypto.randomUUID(),
    role: "member" as const,
    displayName: toDisplayName(email),
    activeMemberTierCode: DEFAULT_MEMBER_TIER_CODE,
    sessionExpiry: expiryDate.toISOString(),
  };

  cookies().set(MEMBER_SESSION_COOKIE_NAME, encodeMemberSessionCookie(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiryDate,
  });

  redirect(nextPath);
}

export async function logoutMember() {
  cookies().delete(MEMBER_SESSION_COOKIE_NAME);
  redirect(MEMBER_LOGIN_ROUTE);
}
