import Link from "next/link";
import { redirect } from "next/navigation";
import { requestMemberPasswordResetAction } from "@/app/session-actions";
import { MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
import { getCurrentMemberSessionState } from "@/lib/member-session-server";

type ForgotPasswordPageProps = {
  searchParams?: {
    error?: string;
    status?: string;
  };
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const sessionState = await getCurrentMemberSessionState();
  if (sessionState.kind === "authenticated") {
    redirect("/");
  }

  const messageByErrorCode: Record<string, string> = {
    missing_email: "请先填写会员邮箱。",
    reset_url_not_allowed: "当前测试环境还没有放行前台重置链接，请先联系管理员完成环境配置。",
    reset_unavailable: "当前暂时无法发起重置密码，请稍后再试或联系管理员。",
  };

  const messageByStatusCode: Record<string, string> = {
    sent: "如果该邮箱对应有效会员账号，系统会发送一封重置密码邮件。",
  };

  const errorMessage = searchParams?.error
    ? messageByErrorCode[searchParams.error] ?? "发起重置失败，请稍后再试。"
    : null;
  const statusMessage = searchParams?.status ? messageByStatusCode[searchParams.status] ?? null : null;

  return (
    <div className="showcase-stack login-stack">
      <section className="showcase-section">
        <div className="section-head">
          <h1>忘记密码</h1>
          <p>输入会员邮箱后，系统会发送重置密码邮件。</p>
          {statusMessage ? <p className="login-success">{statusMessage}</p> : null}
          {errorMessage ? <p className="login-alert">{errorMessage}</p> : null}
        </div>
      </section>

      <section className="showcase-section login-layout login-layout-single">
        <article className="login-panel">
          <h2>发送重置邮件</h2>
          <p>仅对已配置的有效会员账号发送重置链接。</p>
          <form className="login-form" action={requestMemberPasswordResetAction}>
            <label htmlFor="forgot-email">会员邮箱</label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@company.com"
              required
            />

            <button type="submit" className="state-btn">
              发送重置链接
            </button>
          </form>
          <div className="login-link-row">
            <Link href={MEMBER_LOGIN_ROUTE}>返回登录</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
