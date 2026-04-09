import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { ExpiredState } from "@/components/expired-state";
import { LoadingState } from "@/components/loading-state";
import { NotFoundState } from "@/components/not-found-state";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { ROUTES } from "@/lib/routes";

export default function SearchPage() {
  return (
    <div className="showcase-stack">
      <section className="showcase-section">
        <div className="section-head">
          <h1>共享状态组件已就绪</h1>
          <p>
            T704 已补齐 6 类状态：loading、empty、error、expired、unauthorized、not
            found。
          </p>
        </div>
      </section>

      <section className="state-grid">
        <LoadingState />
        <EmptyState />
        <ErrorState
          actions={<button className="state-btn">重试</button>}
        />
        <ExpiredState
          actions={
            <Link className="state-link" href={ROUTES.home}>
              返回首页
            </Link>
          }
        />
        <UnauthorizedState
          actions={
            <Link className="state-link" href={ROUTES.login}>
              前往登录
            </Link>
          }
        />
        <NotFoundState
          actions={
            <Link className="state-link" href={ROUTES.search}>
              重新搜索
            </Link>
          }
        />
      </section>
    </div>
  );
}
