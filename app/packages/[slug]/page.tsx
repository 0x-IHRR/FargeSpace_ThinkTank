import Link from "next/link";
import { AssetBadge } from "@/components/asset-badge";
import { CollectionPill } from "@/components/collection-pill";
import { NotFoundState } from "@/components/not-found-state";
import { SourceBadge } from "@/components/source-badge";
import { TopicPill } from "@/components/topic-pill";
import { ROUTES } from "@/lib/routes";
import { getPackageDetailData } from "@/lib/mock-content";

type PackagePageProps = {
  params: { slug: string };
};

export default function PackagePage({ params }: PackagePageProps) {
  const { slug } = params;
  const data = getPackageDetailData(slug);

  if (!data.detail) {
    return (
      <div className="showcase-stack">
        <section className="showcase-section">
          <NotFoundState
            actions={
              <Link className="state-link" href={ROUTES.search}>
                返回搜索页
              </Link>
            }
          />
        </section>
      </div>
    );
  }

  const detail = data.detail;

  return (
    <div className="showcase-stack package-detail-stack">
      <section className="showcase-section package-detail-head">
        <p className="route-path">{ROUTES.packageDetail(slug)}</p>
        <h1>{detail.title}</h1>
        <p className="package-summary">{detail.summary}</p>
        <div className="pill-row">
          <TopicPill topic={detail.primaryTopic} />
          <p className="package-date">{detail.displayDate}</p>
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>加工资产区</h2>
          <p>按顺序展示会员可消费内容。</p>
        </div>
        <div className="asset-detail-list">
          {detail.assets.map((asset) => (
            <article key={`${detail.slug}-${asset.assetType}`} className="asset-detail-item">
              <div className="asset-detail-head">
                <AssetBadge type={asset.assetType} />
                <p className="package-date">排序 {asset.sortOrder}</p>
              </div>
              <h3>{asset.title}</h3>
              <p className="asset-language">语言：{asset.language}</p>
              {asset.bodyMarkdown ? (
                <p className="asset-body-preview">{asset.bodyMarkdown}</p>
              ) : null}
              {asset.externalUrl ? (
                <a className="state-link" href={asset.externalUrl} target="_blank" rel="noreferrer">
                  打开外部资源
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>来源区</h2>
          <p>显示内容包引用的原始来源。</p>
        </div>
        <div className="source-detail-list">
          {detail.sources.map((source) => (
            <article key={`${source.sourceUrl}-${source.sortOrder}`} className="source-detail-item">
              <h3>{source.title}</h3>
              <div className="pill-row">
                <SourceBadge sourceType={source.sourceType} platform={source.platform} />
                <p className="package-date">{source.publishedAt}</p>
              </div>
              <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                {source.sourceUrl}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>主题与合集信息</h2>
          <p>用于页面内导航和跨页跳转。</p>
        </div>
        <div className="topic-collection-grid">
          <div>
            <h3>主题</h3>
            <div className="pill-row">
              {detail.topics.map((topic) => (
                <TopicPill key={`${detail.slug}-${topic.slug}`} topic={topic} />
              ))}
            </div>
          </div>
          <div>
            <h3>合集</h3>
            <div className="pill-row">
              {detail.collections.length === 0 ? (
                <p className="topic-note">当前内容未归入合集。</p>
              ) : (
                detail.collections.map((collection) => (
                  <CollectionPill
                    key={`${detail.slug}-${collection.slug}`}
                    collection={collection}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
