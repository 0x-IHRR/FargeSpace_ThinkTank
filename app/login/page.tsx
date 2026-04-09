export default function LoginPage() {
  const directusBase =
    process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, "") ?? "http://localhost:8055";
  const directusAdminLoginUrl = `${directusBase}/admin/login`;

  return (
    <div className="showcase-stack login-stack">
      <section className="showcase-section">
        <div className="section-head">
          <h1>会员登录</h1>
          <p>登录后可访问会员内容包与专题页。</p>
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
          <p className="login-note">当前版本先完成登录页模块，账号会话在 Phase 9 接入。</p>
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
