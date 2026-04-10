#!/usr/bin/env node

import process from "node:process";
import { spawn } from "node:child_process";
import {
  createItem,
  deleteItem,
  loginAdmin,
  request,
} from "./lib/phase5_directus.mjs";

const APP_PORT = 3101;
const APP_BASE_URL = `http://127.0.0.1:${APP_PORT}`;
const PROTECTED_PATH = "/packages/openai-agent-builder-guide-digest";
const MEMBER_SESSION_COOKIE_NAME = "fargespace_member_session";
const MEMBER_REFRESH_COOKIE_NAME = "fargespace_member_refresh";

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function encodeSessionCookie(session) {
  return encodeURIComponent(JSON.stringify(session));
}

function buildCookieHeader(session, refreshToken) {
  const cookieParts = [
    `${MEMBER_SESSION_COOKIE_NAME}=${encodeSessionCookie(session)}`,
  ];

  if (refreshToken) {
    cookieParts.push(`${MEMBER_REFRESH_COOKIE_NAME}=${refreshToken}`);
  }

  return cookieParts.join("; ");
}

function toDisplayName(profile) {
  const name = [profile.first_name, profile.last_name]
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(" ")
    .trim();

  if (name) {
    return name;
  }

  const localPart = profile.email?.split("@")[0]?.trim();
  return localPart || "FargeSpace Member";
}

function mapRoleNameToMemberRole(role) {
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

function resolveTierCode(tier) {
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

function evaluateMemberProfile(profile, refreshToken = null, expiresInMs = 15 * 60 * 1000) {
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
      refreshToken,
      expiresInMs,
    },
  };
}

async function fetchRoleByName(token, name) {
  const { payload } = await request(
    `/roles?limit=1&filter[name][_eq]=${encodeURIComponent(name)}&fields=id,name`,
    { token }
  );
  return payload.data?.[0] ?? null;
}

async function fetchTierByCode(token, code) {
  const { payload } = await request(
    `/items/member_tiers?limit=1&filter[code][_eq]=${encodeURIComponent(
      code
    )}&fields=id,code,status`,
    { token }
  );
  return payload.data?.[0] ?? null;
}

async function createUser(token, payload) {
  const { payload: created } = await request("/users", {
    method: "POST",
    token,
    body: payload,
  });
  return created.data;
}

async function deleteUser(token, id) {
  await request(`/users/${id}`, {
    method: "DELETE",
    token,
    allowFailure: true,
  });
}

async function createRole(token, name) {
  const { payload } = await request("/roles", {
    method: "POST",
    token,
    body: {
      name,
      app_access: false,
      admin_access: false,
      ip_access: [],
      enforce_tfa: false,
    },
  });
  return payload.data;
}

async function deleteRole(token, id) {
  await request(`/roles/${id}`, {
    method: "DELETE",
    token,
    allowFailure: true,
  });
}

async function loginUser(email, password) {
  const { response, payload } = await request("/auth/login", {
    method: "POST",
    body: { email, password },
    allowFailure: true,
  });

  return {
    ok: response.ok,
    status: response.status,
    accessToken: payload?.data?.access_token ?? null,
    refreshToken: payload?.data?.refresh_token ?? null,
    expiresInMs: payload?.data?.expires ?? null,
  };
}

async function fetchCurrentProfile(accessToken) {
  const meResponse = await request(
    "/users/me?fields=id,email,status,first_name,last_name,role.id,role.name,member_profile_status,member_tier_id.id,member_tier_id.code,member_tier_id.status",
    {
      token: accessToken,
      allowFailure: true,
    }
  );

  if (
    meResponse.response.ok &&
    meResponse.payload?.data &&
    typeof meResponse.payload.data.status === "string" &&
    meResponse.payload.data.role
  ) {
    return meResponse.payload.data;
  }

  const identityResponse = await request("/users/me?fields=id", {
    token: accessToken,
    allowFailure: true,
  });
  const userId = identityResponse.payload?.data?.id ?? null;
  if (!identityResponse.response.ok || !userId) {
    return null;
  }

  const { response, payload } = await request(
    `/users/${userId}?fields=id,email,status,first_name,last_name,role.id,role.name,member_profile_status,member_tier_id.id,member_tier_id.code,member_tier_id.status`,
    {
      token: process.env.DIRECTUS_TOKEN,
      allowFailure: true,
    }
  );

  if (!response.ok) {
    return null;
  }

  return payload?.data ?? null;
}

async function authenticateMember(email, password) {
  if (!email || !password) {
    return { ok: false, code: "missing_fields" };
  }

  const loginResult = await loginUser(email, password);
  if (!loginResult.ok || !loginResult.accessToken) {
    if (loginResult.status === 401 || loginResult.status === 403) {
      return { ok: false, code: "invalid_credentials" };
    }
    return { ok: false, code: "auth_unavailable" };
  }

  const profile = await fetchCurrentProfile(loginResult.accessToken);
  return evaluateMemberProfile(profile, loginResult.refreshToken, loginResult.expiresInMs);
}

function buildSessionFromAuth(member) {
  const expiresAt = new Date(Date.now() + (member.expiresInMs || 15 * 60 * 1000)).toISOString();
  return {
    userId: member.userId,
    role: member.role,
    displayName: member.displayName,
    activeMemberTierCode: member.activeMemberTierCode,
    sessionExpiry: expiresAt,
  };
}

function buildExpiredSessionFromAuth(member) {
  return {
    userId: member.userId,
    role: member.role,
    displayName: member.displayName,
    activeMemberTierCode: member.activeMemberTierCode,
    sessionExpiry: new Date(Date.now() - 60 * 1000).toISOString(),
  };
}

async function waitForServer(url, timeoutMs = 20000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status >= 200 && response.status < 400) {
        return;
      }
    } catch {
      // wait
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("local app server did not become ready");
}

async function fetchProtectedPath(cookieHeader) {
  const response = await fetch(`${APP_BASE_URL}${PROTECTED_PATH}`, {
    headers: {
      Cookie: cookieHeader,
    },
    redirect: "manual",
  });

  return response;
}

async function startLocalApp() {
  const child = spawn(
    "./node_modules/.bin/next",
    ["start", "--hostname", "127.0.0.1", "--port", String(APP_PORT)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DIRECTUS_URL: process.env.DIRECTUS_URL,
        DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,
        NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL ?? process.env.DIRECTUS_URL,
        NEXT_PUBLIC_APP_URL: APP_BASE_URL,
      },
      stdio: "ignore",
    }
  );

  try {
    await waitForServer(`${APP_BASE_URL}/login`);
    return child;
  } catch (error) {
    child.kill("SIGTERM");
    throw error;
  }
}

async function main() {
  assertCondition(Boolean(process.env.DIRECTUS_URL), "missing DIRECTUS_URL");
  assertCondition(Boolean(process.env.DIRECTUS_TOKEN), "missing DIRECTUS_TOKEN");

  const token = await loginAdmin();
  const memberRole = await fetchRoleByName(token, "Member");
  const standardTier = await fetchTierByCode(token, "standard_member");
  assertCondition(Boolean(memberRole?.id), "missing Directus role: Member");
  assertCondition(Boolean(standardTier?.id), "missing member tier: standard_member");

  const tempSuffix = Date.now();
  const unsupportedRole = await createRole(token, `NoFrontend-${tempSuffix}`);
  const tempResources = {
    userIds: [],
    roleId: unsupportedRole.id,
  };

  let localServer;

  try {
    const password = `Phase13Auth-${tempSuffix}!`;
    const validEmail = `phase13-valid-auth-${tempSuffix}@example.com`;
    const unsupportedEmail = `phase13-unsupported-auth-${tempSuffix}@example.com`;

    const validUser = await createUser(token, {
      email: validEmail,
      password,
      first_name: "Auth",
      last_name: "Valid",
      status: "active",
      role: memberRole.id,
      member_profile_status: "active",
      member_tier_id: standardTier.id,
    });
    tempResources.userIds.push(validUser.id);

    const unsupportedUser = await createUser(token, {
      email: unsupportedEmail,
      password,
      first_name: "Auth",
      last_name: "Blocked",
      status: "active",
      role: unsupportedRole.id,
      member_profile_status: "active",
      member_tier_id: standardTier.id,
    });
    tempResources.userIds.push(unsupportedUser.id);

    const validLogin = await authenticateMember(validEmail, password);
    assertCondition(validLogin.ok, "valid member should log in successfully");

    const wrongPasswordLogin = await authenticateMember(validEmail, `${password}-wrong`);
    assertCondition(
      !wrongPasswordLogin.ok && wrongPasswordLogin.code === "invalid_credentials",
      "wrong password should be rejected"
    );

    const unsupportedRoleLogin = await authenticateMember(unsupportedEmail, password);
    assertCondition(
      !unsupportedRoleLogin.ok && unsupportedRoleLogin.code === "unsupported_role",
      "unsupported role should be rejected"
    );

    localServer = await startLocalApp();

    const currentMember = validLogin.member;
    const liveSession = buildSessionFromAuth(currentMember);
    const liveCookieHeader = buildCookieHeader(liveSession, currentMember.refreshToken);

    const protectedResponse = await fetchProtectedPath(liveCookieHeader);
    assertCondition(protectedResponse.status === 200, "valid member should open protected page");

    const expiredSession = buildExpiredSessionFromAuth(currentMember);
    const expiredCookieHeader = buildCookieHeader(expiredSession, currentMember.refreshToken);
    const expiredResponse = await fetchProtectedPath(expiredCookieHeader);
    assertCondition(
      expiredResponse.status >= 300 &&
        expiredResponse.status < 400 &&
        expiredResponse.headers.get("location")?.includes("/login") &&
        expiredResponse.headers.get("location")?.includes("reason=expired"),
      "expired session should redirect to login"
    );

    await request("/auth/logout", {
      method: "POST",
      body: {
        refresh_token: currentMember.refreshToken,
        mode: "json",
      },
    });

    const loggedOutResponse = await fetchProtectedPath(liveCookieHeader);
    assertCondition(
      loggedOutResponse.status >= 300 &&
        loggedOutResponse.status < 400 &&
        loggedOutResponse.headers.get("location")?.includes("/login") &&
        loggedOutResponse.headers.get("location")?.includes("reason=expired"),
      "logged out session should not access protected page"
    );

    console.log("phase13 auth flow verified");
  } finally {
    if (localServer) {
      localServer.kill("SIGTERM");
    }
    for (const userId of tempResources.userIds) {
      await deleteUser(token, userId);
    }
    if (tempResources.roleId) {
      await deleteRole(token, tempResources.roleId);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
