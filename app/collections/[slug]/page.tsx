import { EmptyState } from "@/components/empty-state";
import { PackageCard } from "@/components/package-card";
import { getCollectionPageData } from "@/lib/content-data";
import { ROUTES } from "@/lib/routes";

type CollectionPageProps = {
  params: { slug: string };
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = params;
  const data = await getCollectionPageData(slug);

  return (
    <div className="showcase-stack collection-stack">
      <section className="showcase-section collection-head">
        <p className="route-path">{ROUTES.collectionDetail(slug)}</p>
        <h1>{data.collection.name}</h1>
        <p>{data.collection.description}</p>
        <p className="topic-count">当前结果：{data.items.length} 条（按合集内顺序）</p>
        {!data.knownCollection ? (
          <p className="topic-note">这个合集 slug 不在预设列表中，当前显示的是占位说明。</p>
        ) : null}
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>内容包列表</h2>
          <p>列表顺序由合集定义决定，不按时间自动重排。</p>
        </div>
        {data.items.length === 0 ? (
          <EmptyState
            title="合集暂无内容"
            description="这个合集还没有配置内容包，请稍后查看。"
          />
        ) : (
          <div className="package-grid">
            {data.items.map((item) => (
              <PackageCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
