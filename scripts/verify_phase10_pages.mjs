#!/usr/bin/env node

import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { spawn } from "node:child_process";

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3010";
const port = Number(new URL(baseUrl).port || "3010");
const host = new URL(baseUrl).hostname;

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildCookieHeader({ expired = false } = {}) {
  const now = Date.now();
  const expiry = new Date(now + (expired ? -30 : 6) * 60 * 60 * 1000).toISOString();
  const session = {
    userId: "phase10-check-user",
    role: "member",
    displayName: "Phase10 Member",
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

async function main() {
  const server = spawn("npm", ["run", "start", "--", "--hostname", host, "--port", String(port)], {
    stdio: "ignore",
    env: process.env,
  });

  try {
    await waitUntilServerReady();

    const anonymousRedirect = await fetchPage("/", { manualRedirect: true });
    assertCondition(
      anonymousRedirect.response.status >= 300 && anonymousRedirect.response.status < 400,
      "anonymous visit to / should redirect to /login"
    );
    const anonymousLocation = anonymousRedirect.response.headers.get("location") ?? "";
    assertCondition(
      anonymousLocation.includes("/login"),
      "anonymous redirect target should include /login"
    );

    const expiredRedirect = await fetchPage("/search", {
      cookie: buildCookieHeader({ expired: true }),
      manualRedirect: true,
    });
    const expiredLocation = expiredRedirect.response.headers.get("location") ?? "";
    assertCondition(
      expiredLocation.includes("reason=expired"),
      "expired session should redirect with reason=expired"
    );

    const loginPage = await fetchPage("/login");
    assertCondition(loginPage.response.ok, "login page should load");
    assertCondition(loginPage.text.includes("会员登录"), "login page missing title");
    assertCondition(loginPage.text.includes("Directus 后台入口"), "login page missing admin entry");

    const authCookie = buildCookieHeader();
    const checks = [
      { path: "/", title: "首页", marker: "最新内容" },
      { path: "/topics/agents", title: "主题页", marker: "内容包列表" },
      { path: "/collections/agentic-ai-watch", title: "合集页", marker: "内容包列表" },
      { path: "/search?topic=agents", title: "搜索页", marker: "当前命中" },
      {
        path: "/packages/openai-agent-builder-guide-digest",
        title: "内容包详情页",
        marker: "加工资产区",
      },
    ];

    for (const item of checks) {
      const page = await fetchPage(item.path, { cookie: authCookie });
      assertCondition(page.response.ok, `${item.title} status not ok: ${page.response.status}`);
      assertCondition(
        page.text.includes(item.marker),
        `${item.title} missing marker: ${item.marker}`
      );
    }

    const loginRedirectWithAuth = await fetchPage("/login?next=%2Fsearch", {
      cookie: authCookie,
      manualRedirect: true,
    });
    assertCondition(
      loginRedirectWithAuth.response.status >= 300 &&
        loginRedirectWithAuth.response.status < 400,
      "authenticated visit to /login should redirect"
    );
    const authLoginLocation =
      loginRedirectWithAuth.response.headers.get("location") ?? "";
    assertCondition(
      authLoginLocation.endsWith("/search"),
      "authenticated /login redirect target should be /search"
    );

    console.log("phase10 T1001 page check passed");
    console.log(
      "checked_routes: /, /topics/agents, /collections/agentic-ai-watch, /search, /packages/openai-agent-builder-guide-digest, /login"
    );
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
