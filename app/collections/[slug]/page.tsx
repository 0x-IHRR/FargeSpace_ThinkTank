import { EmptyState } from "@/components/empty-state";
import { PackageCard } from "@/components/package-card";
import { getCollectionPageData } from "@/lib/content-data";

type CollectionPageProps = {
  params: { slug: string };
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = params;
  const data = await getCollectionPageData(slug);

  return (
    <div className="showcase-stack collection-stack">
      <section className="showcase-section browse-hero collection-head">
        <div className="browse-hero-copy">
          <p className="section-kicker">精选合集</p>
          <h1>{data.collection.name}</h1>
          <p>{data.collection.description}</p>
          {!data.knownCollection ? (
            <p className="topic-note">这个合集 slug 不在预设列表中，当前显示的是占位说明。</p>
          ) : null}
        </div>
        <aside className="browse-meta" aria-label="合集信息">
          <p>当前结果</p>
          <strong>{data.items.length} 条</strong>
          <span>按合集内顺序</span>
          <span>{data.knownCollection ? "合集页" : "临时合集页"}</span>
        </aside>
      </section>

      <section className="showcase-section browse-results-section">
        <div className="section-head section-head-row">
          <div>
            <p className="section-kicker">内容包</p>
            <h2>内容包列表</h2>
            <p>列表顺序由合集定义决定，不按时间自动重排。</p>
          </div>
          <span className="section-count">{data.items.length} 项</span>
        </div>
        {data.items.length === 0 ? (
          <EmptyState
            title="合集暂无内容"
            description="这个合集还没有配置内容包，请稍后查看。"
          />
        ) : (
          <div className="home-latest-list">
            {data.items.map((item) => (
              <PackageCard key={item.slug} item={item} variant="line" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
