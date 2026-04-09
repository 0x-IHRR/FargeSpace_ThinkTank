import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginMember } from "@/app/session-actions";
import { getDirectusAdminLoginUrl } from "@/lib/login-entry";
import {
  MEMBER_SESSION_COOKIE_NAME,
  getSessionStateFromCookieValue,
  sanitizeNextPath,
} from "@/lib/session";

type LoginPageProps = {
  searchParams?: {
    next?: string;
    reason?: string;
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const directusAdminLoginUrl = getDirectusAdminLoginUrl();
  const nextPath = sanitizeNextPath(searchParams?.next ?? "/");
  const isExpiredReason = searchParams?.reason === "expired";
  const hasMissingFieldsError = searchParams?.error === "missing_fields";
  const sessionCookie = cookies().get(MEMBER_SESSION_COOKIE_NAME)?.value;
  const sessionState = getSessionStateFromCookieValue(sessionCookie);

  if (sessionState.kind === "authenticated") {
    redirect(nextPath);
  }

  return (
    <div className="showcase-stack login-stack">
      <section className="showcase-section">
        <div className="section-head">
          <h1>会员登录</h1>
          <p>登录后可访问会员内容包与专题页。</p>
          <p className="login-next">登录后将返回：{nextPath}</p>
          {isExpiredReason ? (
            <p className="login-alert">当前会话已过期，请重新登录。</p>
          ) : null}
          {hasMissingFieldsError ? (
            <p className="login-alert">请填写邮箱和密码后再登录。</p>
          ) : null}
        </div>
      </section>

      <section className="showcase-section login-layout">
        <article className="login-panel">
          <h2>会员入口</h2>
          <p>使用会员邮箱和密码登录。</p>
          <form className="login-form" action={loginMember}>
            <label htmlFor="member-email">邮箱</label>
            <input
              id="member-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@company.com"
              required
            />

            <label htmlFor="member-password">密码</label>
            <input
              id="member-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="输入密码"
              required
            />

            <input type="hidden" name="next" value={nextPath} />

            <label className="login-checkbox">
              <input type="checkbox" name="remember" />
              记住登录状态
            </label>

            <button type="submit" className="state-btn">
              登录
            </button>
          </form>
          <p className="login-note">当前登录页用于前台验收，正式会员体系将在后台联通后接入。</p>
        </article>

        <article className="login-panel login-panel-alt">
          <h2>Directus 后台入口</h2>
          <p>内容编辑与发布请走后台入口。</p>
          {directusAdminLoginUrl ? (
            <>
              <a
                href={directusAdminLoginUrl}
                target="_blank"
                rel="noreferrer"
                className="state-link"
              >
                打开 Directus Admin
              </a>
              <p className="login-meta">后台地址：{directusAdminLoginUrl}</p>
            </>
          ) : (
            <p className="login-meta">后台测试环境尚未配置，当前预览站仅供前台验收。</p>
          )}
        </article>
      </section>
    </div>
  );
}
