import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
import {
  MEMBER_SESSION_COOKIE_NAME,
  getSessionStateFromCookieValue,
} from "@/lib/session";

const PROTECTED_PREFIXES = ["/topics", "/collections", "/packages"] as const;

function isProtectedPath(pathname: string) {
  if (pathname === "/" || pathname === "/search") {
    return true;
  }
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(MEMBER_SESSION_COOKIE_NAME)?.value;
  const sessionState = getSessionStateFromCookieValue(sessionCookie);
  if (sessionState.kind === "authenticated") {
    return NextResponse.next();
  }

  const loginUrl = new URL(MEMBER_LOGIN_ROUTE, request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  if (sessionState.kind === "expired") {
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
