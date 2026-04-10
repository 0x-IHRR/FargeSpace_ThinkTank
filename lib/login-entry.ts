import { ROUTES } from "./routes";

export const MEMBER_LOGIN_ROUTE = ROUTES.login;
export const MEMBER_FORGOT_PASSWORD_ROUTE = ROUTES.forgotPassword;
export const MEMBER_RESET_PASSWORD_ROUTE = ROUTES.resetPassword;

export function getDirectusAdminLoginUrl() {
  const directusBase = process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, "");

  if (directusBase) {
    return `${directusBase}/admin/login`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:8055/admin/login";
  }

  return null;
}

export function getMemberPasswordResetUrl() {
  const appBase =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    process.env.APP_URL?.replace(/\/$/, "") ??
    null;

  if (!appBase) {
    return null;
  }

  return `${appBase}${MEMBER_RESET_PASSWORD_ROUTE}`;
}
