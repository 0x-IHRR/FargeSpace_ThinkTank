import { RouteShell } from "@/components/route-shell";
import { ROUTES } from "@/lib/routes";

export default function LoginPage() {
  return (
    <RouteShell
      title="登录页路由已就绪"
      path={ROUTES.login}
      description="这是登录页占位。后续 T806/T901 会补会员登录流程和 Directus 后台入口。"
    />
  );
}
