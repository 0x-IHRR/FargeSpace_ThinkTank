import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
import {
  MEMBER_REFRESH_COOKIE_NAME,
  MEMBER_SESSION_COOKIE_NAME,
  getSessionStateFromCookieValue,
} from "@/lib/session";
import { isProtectedAppPath } from "@/lib/member-session-server";
import { isOpenPreviewMode } from "@/lib/preview-mode";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const nextPath = `${pathname}${search}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-fargespace-next-path", nextPath);

  if (isOpenPreviewMode()) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!isProtectedAppPath(pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const sessionCookie = request.cookies.get(MEMBER_SESSION_COOKIE_NAME)?.value;
  const refreshCookie = request.cookies.get(MEMBER_REFRESH_COOKIE_NAME)?.value;
  const sessionState = getSessionStateFromCookieValue(sessionCookie);
  if (sessionState.kind === "authenticated" && refreshCookie) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const loginUrl = new URL(MEMBER_LOGIN_ROUTE, request.url);
  loginUrl.searchParams.set("next", nextPath);
  if (sessionState.kind === "expired") {
    loginUrl.searchParams.set("reason", "expired");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(MEMBER_SESSION_COOKIE_NAME);
    response.cookies.delete(MEMBER_REFRESH_COOKIE_NAME);
    return response;
  }
  if (sessionState.kind === "authenticated" && !refreshCookie) {
    loginUrl.searchParams.set("reason", "expired");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(MEMBER_SESSION_COOKIE_NAME);
    return response;
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
