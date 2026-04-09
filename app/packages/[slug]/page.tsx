import { RouteShell } from "@/components/route-shell";
import { ROUTES } from "@/lib/routes";

type PackagePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PackagePage({ params }: PackagePageProps) {
  const { slug } = await params;
  return (
    <RouteShell
      title={`内容包页路由已就绪：${slug}`}
      path={ROUTES.packageDetail(slug)}
      description="这是内容包详情页占位。后续 T805 会补标题、摘要、加工资产区和来源区。"
    />
  );
}
