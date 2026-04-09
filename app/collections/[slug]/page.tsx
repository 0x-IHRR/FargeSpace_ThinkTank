import { RouteShell } from "@/components/route-shell";
import { ROUTES } from "@/lib/routes";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  return (
    <RouteShell
      title={`合集页路由已就绪：${slug}`}
      path={ROUTES.collectionDetail(slug)}
      description="这是合集页占位。后续 T803 会补合集说明和有序内容包列表。"
    />
  );
}
