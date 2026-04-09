import { getDirectusAdminLoginUrl } from "@/lib/login-entry";

type LoginPageProps = {
  searchParams?: {
    next?: string;
    reason?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const directusAdminLoginUrl = getDirectusAdminLoginUrl();
  const nextPath = searchParams?.next ?? "/";
  const isExpiredReason = searchParams?.reason === "expired";

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
        </div>
      </section>

      <section className="showcase-section login-layout">
        <article className="login-panel">
          <h2>会员入口</h2>
          <p>使用会员邮箱和密码登录。</p>
          <form className="login-form">
            <label htmlFor="member-email">邮箱</label>
            <input
              id="member-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@company.com"
            />

            <label htmlFor="member-password">密码</label>
            <input
              id="member-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="输入密码"
            />

            <label className="login-checkbox">
              <input type="checkbox" name="remember" />
              记住登录状态
            </label>

            <button type="button" className="state-btn">
              登录
            </button>
          </form>
          <p className="login-note">路由保护已接入，下一步会进入登出与过期处理。</p>
        </article>

        <article className="login-panel login-panel-alt">
          <h2>Directus 后台入口</h2>
          <p>内容编辑与发布请走后台入口。</p>
          <a href={directusAdminLoginUrl} target="_blank" rel="noreferrer" className="state-link">
            打开 Directus Admin
          </a>
          <p className="login-meta">后台地址：{directusAdminLoginUrl}</p>
        </article>
      </section>
    </div>
  );
}
