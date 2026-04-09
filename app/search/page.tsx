import { RouteShell } from "@/components/route-shell";
import { ROUTES } from "@/lib/routes";

export default function SearchPage() {
  return (
    <RouteShell
      title="搜索页路由已就绪"
      path={ROUTES.search}
      description="这是搜索页占位。后续 T804 会补 URL 筛选、结果统计和清空筛选。"
    />
  );
}
