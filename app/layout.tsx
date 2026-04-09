import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ROUTE_EXAMPLES } from "@/lib/routes";

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
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <div>
              <p className="brand-kicker">FargeSpace</p>
              <p className="brand-title">Think Tank</p>
            </div>
            <nav className="site-nav" aria-label="全站导航">
              {ROUTE_EXAMPLES.map((route, index) => (
                <Link key={route} href={route}>
                  {LABELS[index]}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="page-container">{children}</main>
      </body>
    </html>
  );
}
