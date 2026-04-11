import Link from "next/link";
import { redirect } from "next/navigation";
import { MEMBER_LOGIN_ROUTE } from "@/lib/login-entry";
import { getCurrentMemberSessionState } from "@/lib/member-session-server";

export default async function ForgotPasswordPage() {
  const sessionState = await getCurrentMemberSessionState();
  if (sessionState.kind === "authenticated") {
    redirect("/");
  }

  return (
    <div className="showcase-stack login-stack">
      <section className="showcase-section login-hero-section login-help-section">
        <div className="login-hero-copy">
          <p className="section-kicker">Password help</p>
          <h1>密码需要人工重置。</h1>
          <p>当前阶段不开放自动邮件重置，避免测试环境误发邮件或造成入口混乱。</p>
        </div>
        <article className="login-panel login-panel-primary">
          <p className="section-kicker">Manual reset</p>
          <h2>请联系管理员重置密码</h2>
          <p>如果你忘记了会员密码，请直接联系管理员手动重置。</p>
          <p className="login-note">
            后续需要自动邮件流程时，再单独接入邮件服务。
          </p>
          <div className="login-link-row">
            <Link href={MEMBER_LOGIN_ROUTE}>返回登录</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
