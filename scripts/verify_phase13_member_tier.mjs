#!/usr/bin/env node

import { createItem, deleteItem, loginAdmin, request } from "./lib/phase5_directus.mjs";

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

function evaluateMemberProfile(profile) {
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
    },
  };
}

async function fetchMemberRoleId(token) {
  const { payload } = await request("/roles?filter[name][_eq]=Member&fields=id,name", {
    token,
  });
  const role = payload.data?.[0] ?? null;
  assertCondition(Boolean(role?.id), "missing Directus role: Member");
  return role.id;
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

async function main() {
  const token = await loginAdmin();
  const memberRoleId = await fetchMemberRoleId(token);
  const standardTier = await fetchTierByCode(token, "standard_member");
  assertCondition(Boolean(standardTier?.id), "missing member tier: standard_member");

  const tempSuffix = Date.now();
  const tempInactiveTier = await createItem(token, "member_tiers", {
    code: `temp_inactive_tier_${tempSuffix}`,
    name: `Temp Inactive Tier ${tempSuffix}`,
    status: "inactive",
    rank: 999,
  });

  const tempResources = {
    tierId: tempInactiveTier.id,
    userIds: [],
  };

  try {
    const password = `Phase13Tier-${tempSuffix}!`;
    const cases = [
      {
        label: "valid",
        expectedOk: true,
        expectedCode: null,
        payload: {
          email: `phase13-valid-${tempSuffix}@example.com`,
          password,
          first_name: "Tier",
          last_name: "Valid",
          status: "active",
          role: memberRoleId,
          member_profile_status: "active",
          member_tier_id: standardTier.id,
        },
      },
      {
        label: "missing_tier",
        expectedOk: false,
        expectedCode: "invalid_member_tier",
        payload: {
          email: `phase13-missing-tier-${tempSuffix}@example.com`,
          password,
          first_name: "Tier",
          last_name: "Missing",
          status: "active",
          role: memberRoleId,
          member_profile_status: "active",
          member_tier_id: null,
        },
      },
      {
        label: "inactive_tier",
        expectedOk: false,
        expectedCode: "invalid_member_tier",
        payload: {
          email: `phase13-inactive-tier-${tempSuffix}@example.com`,
          password,
          first_name: "Tier",
          last_name: "Inactive",
          status: "active",
          role: memberRoleId,
          member_profile_status: "active",
          member_tier_id: tempInactiveTier.id,
        },
      },
    ];

    for (const entry of cases) {
      const createdUser = await createUser(token, entry.payload);
      tempResources.userIds.push(createdUser.id);

      const loginResult = await loginUser(entry.payload.email, password);
      assertCondition(loginResult.ok, `${entry.label}: Directus login failed`);
      assertCondition(Boolean(loginResult.accessToken), `${entry.label}: missing access token`);

      const profile = await fetchCurrentProfile(loginResult.accessToken);
      const evaluated = evaluateMemberProfile(profile);

      if (entry.expectedOk) {
        assertCondition(evaluated.ok, `${entry.label}: expected member access to pass`);
      } else {
        assertCondition(!evaluated.ok, `${entry.label}: expected member access to fail`);
        assertCondition(
          evaluated.code === entry.expectedCode,
          `${entry.label}: expected ${entry.expectedCode}, got ${evaluated.code}`
        );
      }
    }

    console.log("phase13 member tier verified");
  } finally {
    for (const userId of tempResources.userIds) {
      await deleteUser(token, userId);
    }
    if (tempResources.tierId) {
      await deleteItem(token, "member_tiers", tempResources.tierId);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
