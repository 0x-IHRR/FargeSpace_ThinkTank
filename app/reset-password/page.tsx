import Link from "next/link";
import { resetMemberPasswordAction } from "@/app/session-actions";
import { MEMBER_FORGOT_PASSWORD_ROUTE, MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";

type ResetPasswordPageProps = {
  searchParams?: {
    token?: string;
    error?: string;
  };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams?.token?.trim() ?? "";
  const messageByErrorCode: Record<string, string> = {
    missing_token: "当前重置链接无效，请重新申请重置密码邮件。",
    missing_password: "请填写并确认新密码。",
    password_mismatch: "两次输入的新密码不一致，请重新输入。",
    invalid_token: "当前重置链接已失效，请重新申请新的重置邮件。",
    reset_unavailable: "当前暂时无法完成密码重置，请稍后再试。",
  };

  const errorMessage = searchParams?.error
    ? messageByErrorCode[searchParams.error] ?? "密码重置失败，请稍后再试。"
    : null;

  return (
    <div className="showcase-stack login-stack">
      <section className="showcase-section">
        <div className="section-head">
          <h1>重置密码</h1>
          <p>设置新密码后，可直接返回会员登录页重新登录。</p>
          {errorMessage ? <p className="login-alert">{errorMessage}</p> : null}
        </div>
      </section>

      <section className="showcase-section login-layout login-layout-single">
        <article className="login-panel">
          <h2>设置新密码</h2>
          {token ? (
            <form className="login-form" action={resetMemberPasswordAction}>
              <label htmlFor="new-password">新密码</label>
              <input
                id="new-password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="输入新密码"
                required
              />

              <label htmlFor="confirm-password">确认新密码</label>
              <input
                id="confirm-password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="再次输入新密码"
                required
              />

              <input type="hidden" name="token" value={token} />

              <button type="submit" className="state-btn">
                确认重置
              </button>
            </form>
          ) : (
            <p className="login-note">当前没有可用重置令牌，请从“忘记密码”重新申请。</p>
          )}

          <div className="login-link-row">
            <Link href={MEMBER_FORGOT_PASSWORD_ROUTE}>重新申请重置邮件</Link>
            <Link href={MEMBER_LOGIN_ROUTE}>返回登录</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
