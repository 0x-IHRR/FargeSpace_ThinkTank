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
      <section className="showcase-section">
        <div className="section-head">
          <h1>忘记密码</h1>
          <p>当前阶段不开放自动重置密码，请联系管理员处理。</p>
        </div>
      </section>

      <section className="showcase-section login-layout login-layout-single">
        <article className="login-panel">
          <h2>请联系管理员重置密码</h2>
          <p>如果你忘记了会员密码，请直接联系管理员手动重置。</p>
          <p className="login-note">
            当前测试环境先采用人工重置，后续再接入自动邮件重置。
          </p>
          <div className="login-link-row">
            <Link href={MEMBER_LOGIN_ROUTE}>返回登录</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
