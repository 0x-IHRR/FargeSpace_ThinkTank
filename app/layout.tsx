import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import "./globals.css";
import { logoutMember } from "@/app/session-actions";
import { getDirectusAdminLoginUrl, MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
import { getCurrentMemberSessionState, isProtectedAppPath } from "@/lib/member-session-server";
import { ROUTES } from "@/lib/routes";
import {
  formatSessionStatus,
} from "@/lib/session";

export const metadata: Metadata = {
  title: "FargeSpace Think Tank",
  description: "人工筛选与整理后的 AI 深度资料库",
};

const NAV_ITEMS = [
  { label: "Issue", href: ROUTES.home },
  { label: "Topics", href: ROUTES.topicDetail("agents") },
  { label: "Sets", href: ROUTES.collectionDetail("agentic-ai-watch") },
  { label: "Package", href: ROUTES.packageDetail("openai-agent-builder-guide-digest") },
  { label: "Search", href: ROUTES.search },
] as const;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear();
  const directusAdminLoginUrl = getDirectusAdminLoginUrl();
  const requestHeaders = headers();
  const currentPath = requestHeaders.get("x-fargespace-next-path") ?? "/";
  const sessionState = await getCurrentMemberSessionState();

  if (sessionState.kind === "expired" && isProtectedAppPath(currentPath)) {
    redirect(`${MEMBER_LOGIN_ROUTE}?next=${encodeURIComponent(currentPath)}&reason=expired`);
  }

  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="site-width header-inner">
            <Link className="brand-block" href={ROUTES.home} aria-label="返回首页">
              <span className="brand-mark" aria-hidden="true">FS</span>
              <span>
                <span className="brand-kicker">Member Intelligence Desk</span>
                <span className="brand-title">FargeSpace</span>
                <span className="brand-subtitle">AI Signal Library</span>
              </span>
            </Link>
            <div className="header-right">
              <nav className="site-nav" aria-label="全站导航">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <section className="login-status" aria-label="登录状态区">
                <div className="status-copy">
                  <p className="status-label">当前状态</p>
                  <p className="status-value">{formatSessionStatus(sessionState)}</p>
                </div>
                <div className="status-actions">
                  {sessionState.kind === "authenticated" ? (
                    <form action={logoutMember}>
                      <button type="submit" className="state-btn">
                        退出登录
                      </button>
                    </form>
                  ) : (
                    <Link href={MEMBER_LOGIN_ROUTE}>会员登录</Link>
                  )}
                  {directusAdminLoginUrl ? (
                    <a href={directusAdminLoginUrl} target="_blank" rel="noreferrer">
                      后台入口
                    </a>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </header>
        <main className="site-width page-container">{children}</main>
        <footer className="site-footer">
          <div className="site-width footer-inner">
            <div>
              <p className="footer-title">FargeSpace Think Tank</p>
              <p>精选 AI 资料、来源与加工内容的会员资料库。</p>
            </div>
            <p className="footer-meta">Member desk · {year}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
