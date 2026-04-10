import { redirect } from "next/navigation";
import { loginMember } from "@/app/session-actions";
import { getDirectusAdminLoginUrl } from "@/lib/login-entry";
import { getCurrentMemberSessionState } from "@/lib/member-session-server";
import { sanitizeNextPath } from "@/lib/session";

type LoginPageProps = {
  searchParams?: {
    next?: string;
    reason?: string;
    error?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const directusAdminLoginUrl = getDirectusAdminLoginUrl();
  const nextPath = sanitizeNextPath(searchParams?.next ?? "/");
  const isExpiredReason = searchParams?.reason === "expired";
  const errorMessageByCode: Record<string, string> = {
    missing_fields: "请填写邮箱和密码后再登录。",
    invalid_credentials: "邮箱或密码错误，请重新输入。",
    inactive_account: "当前账号不可用，请联系管理员确认账号状态。",
    member_inactive: "当前会员资格不可用，请联系管理员确认会员状态。",
    unsupported_role: "当前账号没有前台访问权限。",
    profile_unavailable: "当前账号资料不完整，请联系管理员补齐会员资料。",
    auth_unavailable: "登录服务暂时不可用，请稍后再试。",
  };
  const errorMessage = searchParams?.error
    ? errorMessageByCode[searchParams.error] ?? "登录失败，请稍后再试。"
    : null;
  const sessionState = await getCurrentMemberSessionState();

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
          {errorMessage ? <p className="login-alert">{errorMessage}</p> : null}
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
          <p className="login-note">当前登录页已接入真实账号认证，只有后台已配置的有效会员账号可登录。</p>
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
