import "server-only";

import { cookies } from "next/headers";
import { authenticateMemberRefreshToken } from "@/lib/directus-member-auth";
import {
  ANONYMOUS_SESSION_STATE,
  DEFAULT_SESSION_HOURS,
  MEMBER_REFRESH_COOKIE_NAME,
  MEMBER_SESSION_COOKIE_NAME,
  type MemberSession,
  type SessionState,
  getSessionStateFromCookieValue,
} from "@/lib/session";

function buildExpiryDate(expiresInMs: number | null) {
  const ttlMs =
    expiresInMs && Number.isFinite(expiresInMs)
      ? expiresInMs
      : DEFAULT_SESSION_HOURS * 60 * 60 * 1000;
  return new Date(Date.now() + ttlMs);
}

function buildSessionFromAuthResult(
  member: {
    userId: string;
    role: MemberSession["role"];
    displayName: string;
    activeMemberTierCode: string;
    expiresInMs: number | null;
  }
): MemberSession {
  return {
    userId: member.userId,
    role: member.role,
    displayName: member.displayName,
    activeMemberTierCode: member.activeMemberTierCode,
    sessionExpiry: buildExpiryDate(member.expiresInMs).toISOString(),
  };
}

export async function getCurrentMemberSessionState(): Promise<SessionState> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(MEMBER_SESSION_COOKIE_NAME)?.value;
  const refreshCookie = cookieStore.get(MEMBER_REFRESH_COOKIE_NAME)?.value;

  const cookieState = getSessionStateFromCookieValue(sessionCookie);
  if (cookieState.kind === "anonymous") {
    return ANONYMOUS_SESSION_STATE;
  }

  if (!refreshCookie) {
    return { kind: "expired", session: cookieState.session };
  }

  const refreshed = await authenticateMemberRefreshToken(refreshCookie);
  if (!refreshed.ok) {
    return { kind: "expired", session: cookieState.session };
  }

  return {
    kind: "authenticated",
    session: buildSessionFromAuthResult(refreshed.member),
  };
}

export function isProtectedAppPath(pathname: string) {
  if (pathname === "/" || pathname === "/search") {
    return true;
  }

  return ["/topics", "/collections", "/packages"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
