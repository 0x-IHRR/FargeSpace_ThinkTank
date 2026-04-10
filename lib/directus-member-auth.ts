import type { MemberRole } from "@/lib/session";

const directusBaseUrl =
  process.env.DIRECTUS_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, "") ??
  "http://localhost:8055";

const directusStaticToken = process.env.DIRECTUS_TOKEN ?? null;

type DirectusRole =
  | string
  | null
  | {
      id?: string | null;
      name?: string | null;
    };

type DirectusTier =
  | string
  | null
  | {
      id?: string | null;
      code?: string | null;
      status?: string | null;
    };

type DirectusUserProfile = {
  id: string;
  email: string;
  status: string | null;
  first_name: string | null;
  last_name: string | null;
  role: DirectusRole;
  member_profile_status: string | null;
  member_tier_id: DirectusTier;
};

type DirectusLoginSuccess = {
  access_token: string;
  refresh_token?: string | null;
  expires?: number | null;
};

export type MemberLoginErrorCode =
  | "missing_fields"
  | "invalid_credentials"
  | "auth_unavailable"
  | "inactive_account"
  | "unsupported_role"
  | "member_inactive"
  | "profile_unavailable"
  | "invalid_member_tier";

export type PasswordResetRequestErrorCode =
  | "missing_email"
  | "reset_unavailable"
  | "reset_url_not_allowed";
export type PasswordResetConfirmErrorCode =
  | "missing_token"
  | "missing_password"
  | "password_mismatch"
  | "invalid_token"
  | "reset_unavailable";

export type AuthenticatedMember = {
  userId: string;
  role: MemberRole;
  displayName: string;
  activeMemberTierCode: string;
  refreshToken: string | null;
  expiresInMs: number | null;
};

type AuthenticatedMemberResult =
  | { ok: true; member: AuthenticatedMember }
  | { ok: false; code: MemberLoginErrorCode };

function buildDirectusUrl(path: string) {
  return `${directusBaseUrl}${path}`;
}

async function directusRequest<T>(
  path: string,
  {
    method = "GET",
    accessToken,
    staticToken,
    body,
  }: {
    method?: "GET" | "POST";
    accessToken?: string | null;
    staticToken?: string | null;
    body?: Record<string, unknown>;
  } = {}
): Promise<{ ok: boolean; status: number; data: T | null; rawText: string }> {
  const headers: Record<string, string> = {};
  const authToken = accessToken ?? staticToken ?? null;
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildDirectusUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const rawText = await response.text();
  const parsed = rawText ? JSON.parse(rawText) : null;

  return {
    ok: response.ok,
    status: response.status,
    data: parsed?.data ?? null,
    rawText,
  };
}

function toDisplayName(profile: Pick<DirectusUserProfile, "first_name" | "last_name" | "email">) {
  const name = [profile.first_name, profile.last_name]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(" ")
    .trim();

  if (name) {
    return name;
  }

  const localPart = profile.email.split("@")[0]?.trim();
  if (localPart) {
    return localPart;
  }

  return "FargeSpace Member";
}

function mapRoleNameToMemberRole(role: DirectusRole): MemberRole | null {
  const roleName = typeof role === "string" ? role : role?.name ?? null;

  switch (roleName) {
    case "Member":
      return "member";
    case "Editor":
      return "editor";
    case "Administrator":
      return "admin";
    default:
      return null;
  }
}

function resolveTierCode(tier: DirectusTier): string | null {
  if (
    tier &&
    typeof tier === "object" &&
    typeof tier.code === "string" &&
    tier.code.trim() &&
    (tier.status == null || tier.status === "active")
  ) {
    return tier.code;
  }
  return null;
}

async function loginWithDirectus(email: string, password: string) {
  let response;
  try {
    response = await directusRequest<DirectusLoginSuccess>("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    });
  } catch {
    return { ok: false as const, code: "auth_unavailable" as const };
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return { ok: false as const, code: "invalid_credentials" as const };
    }
    return { ok: false as const, code: "auth_unavailable" as const };
  }

  if (!response.data?.access_token) {
    return { ok: false as const, code: "auth_unavailable" as const };
  }

  return {
    ok: true as const,
    payload: response.data,
  };
}

async function fetchCurrentMemberProfile(accessToken: string) {
  try {
    const meResponse = await directusRequest<DirectusUserProfile>(
      "/users/me?fields=id,email,status,first_name,last_name,role.id,role.name,member_profile_status,member_tier_id.id,member_tier_id.code,member_tier_id.status",
      {
        accessToken,
      }
    );

    if (
      meResponse.ok &&
      meResponse.data &&
      typeof meResponse.data.status === "string" &&
      meResponse.data.role
    ) {
      return meResponse.data;
    }

    const meIdentityResponse = await directusRequest<Pick<DirectusUserProfile, "id">>(
      "/users/me?fields=id",
      {
        accessToken,
      }
    );

    if (!meIdentityResponse.ok || !meIdentityResponse.data?.id || !directusStaticToken) {
      return null;
    }

    const userResponse = await directusRequest<DirectusUserProfile>(
      `/users/${meIdentityResponse.data.id}?fields=id,email,status,first_name,last_name,role.id,role.name,member_profile_status,member_tier_id.id,member_tier_id.code,member_tier_id.status`,
      {
        staticToken: directusStaticToken,
      }
    );

    if (userResponse.ok && userResponse.data) {
      return userResponse.data;
    }
  } catch {
    return null;
  }

  return null;
}

export async function authenticateMemberCredentials(
  email: string,
  password: string
): Promise<AuthenticatedMemberResult> {
  if (!email || !password) {
    return { ok: false, code: "missing_fields" };
  }

  const loginResult = await loginWithDirectus(email, password);
  if (!loginResult.ok) {
    return loginResult;
  }

  const profile = await fetchCurrentMemberProfile(loginResult.payload.access_token);

  if (!profile) {
    return { ok: false, code: "profile_unavailable" };
  }

  if (profile.status !== "active") {
    return { ok: false, code: "inactive_account" };
  }

  if (profile.member_profile_status && profile.member_profile_status !== "active") {
    return { ok: false, code: "member_inactive" };
  }

  const role = mapRoleNameToMemberRole(profile.role);
  if (!role) {
    return { ok: false, code: "unsupported_role" };
  }

  const activeMemberTierCode = resolveTierCode(profile.member_tier_id);
  if (!activeMemberTierCode) {
    return { ok: false, code: "invalid_member_tier" };
  }

  return {
    ok: true,
    member: {
      userId: profile.id,
      role,
      displayName: toDisplayName(profile),
      activeMemberTierCode,
      refreshToken: loginResult.payload.refresh_token ?? null,
      expiresInMs:
        typeof loginResult.payload.expires === "number"
          ? loginResult.payload.expires
          : null,
    },
  };
}

export async function authenticateMemberRefreshToken(
  refreshToken: string
): Promise<AuthenticatedMemberResult> {
  if (!refreshToken) {
    return { ok: false, code: "auth_unavailable" };
  }

  let response;
  try {
    response = await directusRequest<DirectusLoginSuccess>("/auth/refresh", {
      method: "POST",
      body: {
        refresh_token: refreshToken,
        mode: "json",
      },
    });
  } catch {
    return { ok: false, code: "auth_unavailable" };
  }

  if (!response.ok || !response.data?.access_token) {
    return { ok: false, code: "invalid_credentials" };
  }

  const profile = await fetchCurrentMemberProfile(response.data.access_token);
  if (!profile) {
    return { ok: false, code: "profile_unavailable" };
  }

  if (profile.status !== "active") {
    return { ok: false, code: "inactive_account" };
  }

  if (profile.member_profile_status && profile.member_profile_status !== "active") {
    return { ok: false, code: "member_inactive" };
  }

  const role = mapRoleNameToMemberRole(profile.role);
  if (!role) {
    return { ok: false, code: "unsupported_role" };
  }

  const activeMemberTierCode = resolveTierCode(profile.member_tier_id);
  if (!activeMemberTierCode) {
    return { ok: false, code: "invalid_member_tier" };
  }

  return {
    ok: true,
    member: {
      userId: profile.id,
      role,
      displayName: toDisplayName(profile),
      activeMemberTierCode,
      refreshToken: response.data.refresh_token ?? refreshToken,
      expiresInMs:
        typeof response.data.expires === "number" ? response.data.expires : null,
    },
  };
}

export async function logoutMemberRefreshToken(refreshToken: string | null | undefined) {
  if (!refreshToken) {
    return;
  }

  try {
    await directusRequest("/auth/logout", {
      method: "POST",
      body: {
        refresh_token: refreshToken,
        mode: "json",
      },
    });
  } catch {
    return;
  }
}

export async function requestMemberPasswordReset(
  email: string,
  resetUrl: string | null
): Promise<{ ok: true } | { ok: false; code: PasswordResetRequestErrorCode }> {
  if (!email) {
    return { ok: false, code: "missing_email" };
  }

  try {
    const response = await directusRequest("/auth/password/request", {
      method: "POST",
      body: {
        email,
        ...(resetUrl ? { reset_url: resetUrl } : {}),
      },
    });

    if (!response.ok) {
      if (
        response.status === 400 &&
        response.rawText.includes("can't be used to reset passwords")
      ) {
        return { ok: false, code: "reset_url_not_allowed" };
      }
      return { ok: false, code: "reset_unavailable" };
    }

    return { ok: true };
  } catch {
    return { ok: false, code: "reset_unavailable" };
  }
}

export async function resetMemberPassword(
  token: string,
  password: string
): Promise<{ ok: true } | { ok: false; code: PasswordResetConfirmErrorCode }> {
  if (!token) {
    return { ok: false, code: "missing_token" };
  }

  if (!password) {
    return { ok: false, code: "missing_password" };
  }

  try {
    const response = await directusRequest("/auth/password/reset", {
      method: "POST",
      body: {
        token,
        password,
      },
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        return { ok: false, code: "invalid_token" };
      }
      return { ok: false, code: "reset_unavailable" };
    }

    return { ok: true };
  } catch {
    return { ok: false, code: "reset_unavailable" };
  }
}
