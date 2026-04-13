import Link from "next/link";
import { AssetBadge } from "@/components/asset-badge";
import { CollectionPill } from "@/components/collection-pill";
import { NotFoundState } from "@/components/not-found-state";
import { SourceBadge } from "@/components/source-badge";
import { TopicPill } from "@/components/topic-pill";
import { getPackageDetailData } from "@/lib/content-data";
import { ROUTES } from "@/lib/routes";
import type { PackageDetailData } from "@/lib/ui-models";

type PackagePageProps = {
  params: { slug: string };
};

const PACKAGE_TYPE_LABELS = {
  recap: "快讯回顾",
  deep_dive: "深度解读",
  watchlist: "观察清单",
  toolkit: "工具包",
  interview: "访谈",
} satisfies Record<PackageDetailData["packageType"], string>;

function splitDisplayTitle(title: string) {
  const match = title.match(/^(.+?[：:])\s*(.+)$/);

  if (!match) {
    return { lead: title, tail: "" };
  }

  return { lead: match[1], tail: match[2] };
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { slug } = params;
  const data = await getPackageDetailData(slug);

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
  const displayTitle = splitDisplayTitle(detail.title);

  return (
    <div className="showcase-stack package-detail-stack">
      <section className="showcase-section package-detail-hero">
        <div className="package-detail-copy">
          <p className="section-kicker">会员资料包 / {detail.displayDate}</p>
          <h1>
            <span>{displayTitle.lead}</span>
            {displayTitle.tail ? <span className="title-tail">{displayTitle.tail}</span> : null}
          </h1>
          <p className="package-summary">{detail.summary}</p>
          <div className="pill-row">
            <TopicPill topic={detail.primaryTopic} />
          </div>
        </div>
        <aside className="package-detail-meta" aria-label="内容包信息">
          <p>内容包状态</p>
          <strong>{PACKAGE_TYPE_LABELS[detail.packageType]}</strong>
          <span>{detail.assets.length} 个加工资产</span>
          <span>{detail.sources.length} 个原始来源</span>
          <span>{detail.rawSourceVisible ? "来源对会员可见" : "来源仅作内部引用"}</span>
        </aside>
      </section>

      <div className="package-reading-layout">
        <section className="showcase-section package-reading-section">
          <div className="section-head section-head-row">
            <div>
              <p className="section-kicker">加工内容</p>
              <h2>加工资产</h2>
              <p>按阅读顺序展示会员可消费内容。</p>
            </div>
            <span className="section-count">{detail.assets.length} 项</span>
          </div>
          <div className="asset-detail-list">
            {detail.assets.map((asset) => (
              <article
                key={`${detail.slug}-${asset.assetType}-${asset.sortOrder}`}
                className="asset-detail-item"
              >
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

        <aside className="package-side-rail">
          <section className="package-side-panel">
            <div className="section-head">
              <p className="section-kicker">来源</p>
              <h2>来源</h2>
              <p>内容包引用的原始来源。</p>
            </div>
            <div className="source-detail-list">
              {detail.sources.map((source) => (
                <article key={`${source.sourceUrl}-${source.sortOrder}`} className="source-detail-item">
                  <h3>{source.title}</h3>
                  <div className="pill-row">
                    <SourceBadge sourceType={source.sourceType} platform={source.platform} />
                    {source.publishedAt ? (
                      <p className="package-date">{source.publishedAt}</p>
                    ) : null}
                  </div>
                  <a className="state-link" href={source.sourceUrl} target="_blank" rel="noreferrer">
                    打开原始来源
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="package-side-panel">
            <div className="section-head">
              <p className="section-kicker">继续浏览</p>
              <h2>主题与合集</h2>
              <p>用于继续浏览相关资料。</p>
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
        </aside>
      </div>
    </div>
  );
}
