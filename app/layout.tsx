import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";
import { logoutMember } from "@/app/session-actions";
import { getDirectusAdminLoginUrl, MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
import { ROUTE_EXAMPLES } from "@/lib/routes";
import {
  MEMBER_SESSION_COOKIE_NAME,
  formatSessionStatus,
  getSessionStateFromCookieValue,
} from "@/lib/session";

export const metadata: Metadata = {
  title: "FargeSpace Think Tank",
  description: "AI 资料平台前台路由骨架",
};

const LABELS = [
  "首页",
  "主题页示例",
  "合集页示例",
  "内容包页示例",
  "搜索页",
  "登录页",
] as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear();
  const directusAdminLoginUrl = getDirectusAdminLoginUrl();
  const sessionCookie = cookies().get(MEMBER_SESSION_COOKIE_NAME)?.value;
  const sessionState = getSessionStateFromCookieValue(sessionCookie);

  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="site-width header-inner">
            <div className="brand-block">
              <p className="brand-kicker">FargeSpace Member Hub</p>
              <p className="brand-title">Think Tank</p>
              <p className="brand-subtitle">人工筛选与整理后的 AI 深度资料库</p>
            </div>
            <div className="header-right">
              <nav className="site-nav" aria-label="全站导航">
                {ROUTE_EXAMPLES.map((route, index) => (
                  <Link key={route} href={route}>
                    {LABELS[index]}
                  </Link>
                ))}
              </nav>
              <section className="login-status" aria-label="登录状态区">
                <div>
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
            <p>FargeSpace Think Tank</p>
            <p>会员内容库 · 路由与共享壳基础已就绪 · {year}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
