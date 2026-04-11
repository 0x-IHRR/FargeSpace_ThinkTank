#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";

const envFilePath = process.argv[2] ?? ".env.staging.example";

const requiredGroups = [
  {
    name: "Vercel frontend",
    keys: [
      "DIRECTUS_URL",
      "DIRECTUS_TOKEN",
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_DIRECTUS_URL",
      "NEXT_PUBLIC_ASSET_BASE_URL",
    ],
  },
  {
    name: "Railway Directus",
    keys: [
      "KEY",
      "SECRET",
      "PUBLIC_URL",
      "ADMIN_EMAIL",
      "ADMIN_PASSWORD",
      "DB_CLIENT",
      "DB_HOST",
      "DB_PORT",
      "DB_DATABASE",
      "DB_USER",
      "DB_PASSWORD",
      "CORS_ENABLED",
      "CORS_ORIGIN",
      "STORAGE_LOCATIONS",
      "STORAGE_LOCAL_DRIVER",
      "STORAGE_LOCAL_ROOT",
    ],
  },
];

const optionalGroups = [
  {
    name: "Manual password reset fallback",
    keys: [
      "PASSWORD_RESET_URL_ALLOW_LIST",
      "EMAIL_TRANSPORT",
      "EMAIL_FROM",
      "EMAIL_SMTP_HOST",
      "EMAIL_SMTP_PORT",
      "EMAIL_SMTP_USER",
      "EMAIL_SMTP_PASSWORD",
    ],
  },
];

function parseEnvFile(path) {
  const content = fs.readFileSync(path, "utf8");
  const entries = new Map();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    entries.set(key, value);
  }

  return entries;
}

function collectMissing(entries, keys) {
  return keys.filter((key) => !entries.has(key));
}

function assertNoLegacyDirectusNames(entries) {
  const legacyKeys = [
    "DIRECTUS_KEY",
    "DIRECTUS_SECRET",
    "DIRECTUS_ADMIN_EMAIL",
    "DIRECTUS_ADMIN_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
  ];
  const presentLegacyKeys = legacyKeys.filter((key) => entries.has(key));
  if (presentLegacyKeys.length > 0) {
    throw new Error(
      `staging env still contains local-only names: ${presentLegacyKeys.join(", ")}`
    );
  }
}

function main() {
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`env file not found: ${envFilePath}`);
  }

  const entries = parseEnvFile(envFilePath);
  assertNoLegacyDirectusNames(entries);

  const errors = [];
  for (const group of requiredGroups) {
    const missing = collectMissing(entries, group.keys);
    if (missing.length > 0) {
      errors.push(`${group.name} missing: ${missing.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  console.log("phase15 T1501 env checklist passed");
  console.log(`checked_file: ${envFilePath}`);
  for (const group of [...requiredGroups, ...optionalGroups]) {
    console.log(`${group.name}: ${group.keys.join(", ")}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
