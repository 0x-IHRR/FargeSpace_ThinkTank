import "server-only";

import { cookies } from "next/headers";
import {
  ANONYMOUS_SESSION_STATE,
  MEMBER_REFRESH_COOKIE_NAME,
  MEMBER_SESSION_COOKIE_NAME,
  type SessionState,
  getSessionStateFromCookieValue,
} from "@/lib/session";

export async function getCurrentMemberSessionState(): Promise<SessionState> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(MEMBER_SESSION_COOKIE_NAME)?.value;
  const refreshCookie = cookieStore.get(MEMBER_REFRESH_COOKIE_NAME)?.value;

  const cookieState = getSessionStateFromCookieValue(sessionCookie);
  if (cookieState.kind === "anonymous") {
    return ANONYMOUS_SESSION_STATE;
  }

  if (cookieState.kind === "authenticated" && refreshCookie) {
    return cookieState;
  }

  if (!refreshCookie) {
    return { kind: "expired", session: cookieState.session };
  }

  return { kind: "expired", session: cookieState.session };
}

export function isProtectedAppPath(pathname: string) {
  if (pathname === "/" || pathname === "/search") {
    return true;
  }

  return ["/topics", "/collections", "/packages"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
