import { ROUTES } from "./routes";

const DEFAULT_DIRECTUS_BASE_URL = "http://localhost:8055";

export const MEMBER_LOGIN_ROUTE = ROUTES.login;

export function getDirectusAdminLoginUrl() {
  const directusBase =
    process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, "") ?? DEFAULT_DIRECTUS_BASE_URL;
  return `${directusBase}/admin/login`;
}
