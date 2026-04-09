#!/usr/bin/env node

import process from "node:process";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { readFile } from "node:fs/promises";

const baseUrl = process.env.APP_URL_MOBILE_CHECK ?? "http://127.0.0.1:3011";
const url = new URL(baseUrl);
const host = url.hostname;
const port = Number(url.port || "3011");

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildCookieHeader() {
  const expiry = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  const session = {
    userId: "phase10-mobile-check",
    role: "member",
    displayName: "Phase10 Mobile",
    activeMemberTierCode: "standard_member",
    sessionExpiry: expiry,
  };
  return `fargespace_member_session=${encodeURIComponent(JSON.stringify(session))}`;
}

async function fetchPage(path, { cookie, manualRedirect = false } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: cookie ? { cookie } : undefined,
    redirect: manualRedirect ? "manual" : "follow",
  });
  const text = await response.text();
  return { response, text };
}

async function waitUntilServerReady(maxRetries = 40) {
  for (let i = 0; i < maxRetries; i += 1) {
    try {
      const { response } = await fetchPage("/login");
      if (response.ok) return;
    } catch {
      // Ignore and retry.
    }
    await sleep(500);
  }
  throw new Error("Next server did not become ready in time");
}

function assertMobileCss(cssText) {
  const mustExist = [
    /@media\s*\(max-width:\s*840px\)/,
    /\.package-grid\s*\{\s*grid-template-columns:\s*1fr;\s*\}/s,
    /\.search-filter-form\s*\{\s*grid-template-columns:\s*1fr;\s*\}/s,
    /\.topic-collection-grid\s*\{\s*grid-template-columns:\s*1fr;\s*\}/s,
    /\.login-layout\s*\{\s*grid-template-columns:\s*1fr;\s*\}/s,
    /\.source-detail-item a\s*\{[^}]*word-break:\s*break-all;/s,
  ];

  for (const pattern of mustExist) {
    assertCondition(pattern.test(cssText), `mobile css missing pattern: ${pattern}`);
  }
}

async function main() {
  const cssText = await readFile("app/globals.css", "utf8");
  assertMobileCss(cssText);

  const server = spawn(
    "npm",
    ["run", "start", "--", "--hostname", host, "--port", String(port)],
    {
      stdio: "ignore",
      env: process.env,
    }
  );

  try {
    await waitUntilServerReady();

    const authCookie = buildCookieHeader();
    const pages = [
      {
        path: "/",
        title: "首页",
        markers: ["package-grid", "最新内容"],
      },
      {
        path: "/search?topic=agents",
        title: "搜索页",
        markers: ["search-filter-form", "应用筛选", "清空筛选"],
      },
      {
        path: "/packages/openai-agent-builder-guide-digest",
        title: "详情页",
        markers: ["package-detail-stack", "加工资产区", "来源区", "主题与合集信息"],
      },
    ];

    for (const page of pages) {
      const res = await fetchPage(page.path, { cookie: authCookie });
      assertCondition(res.response.ok, `${page.title} status not ok: ${res.response.status}`);
      for (const marker of page.markers) {
        assertCondition(
          res.text.includes(marker),
          `${page.title} missing marker: ${marker}`
        );
      }
    }

    console.log("phase10 T1005 mobile check passed");
    console.log(
      "checked_mobile: card layout rule, search filter layout rule, package detail reading flow rule"
    );
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
