import { RouteShell } from "@/components/route-shell";
import { ROUTES } from "@/lib/routes";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  return (
    <RouteShell
      title={`主题页路由已就绪：${slug}`}
      path={ROUTES.topicDetail(slug)}
      description="这是主题页占位。后续 T802 会补主题说明、筛选区和该主题下的内容包列表。"
    />
  );
}
