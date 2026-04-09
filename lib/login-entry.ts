import { ROUTES } from "./routes";

export const MEMBER_LOGIN_ROUTE = ROUTES.login;

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
