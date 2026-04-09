import { RouteShell } from "@/components/route-shell";
import { ROUTES } from "@/lib/routes";

export default function HomePage() {
  return (
    <RouteShell
      title="首页路由已就绪"
      path={ROUTES.home}
      description="这是前台路由骨架阶段的首页占位。后续 T801 会在这里接入精选内容、最新内容、主题入口和合集入口。"
    />
  );
}
