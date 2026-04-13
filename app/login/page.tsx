import Link from "next/link";
import { redirect } from "next/navigation";
import { loginMember } from "@/app/session-actions";
import { getDirectusAdminLoginUrl, MEMBER_FORGOT_PASSWORD_ROUTE } from "@/lib/login-entry";
import { getCurrentMemberSessionState } from "@/lib/member-session-server";
import { isOpenPreviewMode } from "@/lib/preview-mode";
import { ROUTES } from "@/lib/routes";
import { sanitizeNextPath } from "@/lib/session";

type LoginPageProps = {
  searchParams?: {
    next?: string;
    reason?: string;
    error?: string;
    status?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const directusAdminLoginUrl = getDirectusAdminLoginUrl();
  const openPreviewMode = isOpenPreviewMode();
  const nextPath = sanitizeNextPath(searchParams?.next ?? "/");
  const isExpiredReason = searchParams?.reason === "expired";
  const errorMessageByCode: Record<string, string> = {
    missing_fields: "请填写邮箱和密码后再登录。",
    invalid_credentials: "邮箱或密码错误，请重新输入。",
    inactive_account: "当前账号不可用，请联系管理员确认账号状态。",
    member_inactive: "当前会员资格不可用，请联系管理员确认会员状态。",
    invalid_member_tier: "当前账号还没有有效会员层级，请联系管理员补齐会员层级。",
    unsupported_role: "当前账号没有前台访问权限。",
    profile_unavailable: "当前账号资料不完整，请联系管理员补齐会员资料。",
    auth_unavailable: "登录服务暂时不可用，请稍后再试。",
  };
  const errorMessage = searchParams?.error
    ? errorMessageByCode[searchParams.error] ?? "登录失败，请稍后再试。"
    : null;
  const statusMessageByCode: Record<string, string> = {
    signed_out: "当前账号已退出登录。",
    reset_success: "密码已重置完成，请使用新密码重新登录。",
  };
  const statusMessage = searchParams?.status
    ? statusMessageByCode[searchParams.status] ?? null
    : null;
  const sessionState = await getCurrentMemberSessionState();

  if (!openPreviewMode && sessionState.kind === "authenticated") {
    redirect(nextPath);
  }

  return (
    <div className="showcase-stack login-stack">
      <section className="showcase-section login-hero-section">
        <div className="login-hero-copy">
          <p className="section-kicker">Member access</p>
          <h1>进入 FargeSpace 会员资料库。</h1>
          <p>
            {openPreviewMode
              ? "当前先开放前端页面，方便完整检查产品结构和 UI。"
              : "登录后可访问精选内容包、主题页、合集页和搜索工作台。"}
          </p>
          {isExpiredReason ? (
            <p className="login-alert">当前会话已过期，请重新登录。</p>
          ) : null}
          {statusMessage ? <p className="login-success">{statusMessage}</p> : null}
          {errorMessage ? <p className="login-alert">{errorMessage}</p> : null}
        </div>
        <div className="login-hero-meta" aria-label="登录说明">
          <p>登录后返回</p>
          <strong>{nextPath}</strong>
          <span>
            {openPreviewMode
              ? "会员权限暂时后置，当前可以直接浏览前端页面。"
              : "仅后台已配置的有效会员账号可访问前台资料库。"}
          </span>
        </div>
      </section>

      <section className="showcase-section login-layout login-access-layout">
        <article className="login-panel login-panel-primary">
          <p className="section-kicker">Member sign in</p>
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
          <div className="login-link-row">
            <Link href={MEMBER_FORGOT_PASSWORD_ROUTE}>忘记密码</Link>
          </div>
        </article>

        {openPreviewMode ? (
          <article className="login-panel login-panel-alt">
            <p className="section-kicker">Open preview</p>
            <h2>先直接浏览产品页面</h2>
            <p>当前先不强制会员登录，便于继续精修首页、主题、合集、搜索和详情页。</p>
            <div className="login-link-row">
              <Link href={ROUTES.home}>查看首页</Link>
              <Link href={ROUTES.search}>进入搜索页</Link>
            </div>
          </article>
        ) : (
          <article className="login-panel login-panel-alt">
            <p className="section-kicker">Editorial admin</p>
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
        )}
      </section>
    </div>
  );
}
