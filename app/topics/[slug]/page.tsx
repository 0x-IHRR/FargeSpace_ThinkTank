import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PackageCard } from "@/components/package-card";
import { ROUTES } from "@/lib/routes";
import {
  TOPIC_FILTER_OPTIONS,
  TOPIC_DETAILS,
  getTopicPageData,
} from "@/lib/mock-content";
import type { AssetType, PackageDisplayItem } from "@/lib/ui-models";

type TopicPageProps = {
  params: { slug: string };
  searchParams?: {
    package_type?: string;
    asset_type?: string;
  };
};

function isPackageType(value: string): value is PackageDisplayItem["packageType"] {
  return ["recap", "deep_dive", "watchlist", "toolkit", "interview"].includes(
    value
  );
}

function isAssetType(value: string): value is AssetType {
  return ["brief", "audio", "slides", "video"].includes(value);
}

function toTopicHref(
  slug: string,
  filters: { packageType?: string; assetType?: string }
) {
  const params = new URLSearchParams();
  if (filters.packageType && filters.packageType !== "all") {
    params.set("package_type", filters.packageType);
  }
  if (filters.assetType && filters.assetType !== "all") {
    params.set("asset_type", filters.assetType);
  }
  const query = params.toString();
  return query.length > 0 ? `${ROUTES.topicDetail(slug)}?${query}` : ROUTES.topicDetail(slug);
}

export default function TopicPage({ params, searchParams }: TopicPageProps) {
  const { slug } = params;
  const packageTypeRaw = searchParams?.package_type ?? "all";
  const assetTypeRaw = searchParams?.asset_type ?? "all";

  const packageType = isPackageType(packageTypeRaw) ? packageTypeRaw : undefined;
  const assetType = isAssetType(assetTypeRaw) ? assetTypeRaw : undefined;

  const data = getTopicPageData(slug, { packageType, assetType });
  const knownTopic = Boolean(TOPIC_DETAILS[slug]);

  return (
    <div className="showcase-stack topic-stack">
      <section className="showcase-section topic-head">
        <p className="route-path">{ROUTES.topicDetail(slug)}</p>
        <h1>{data.topic.name}</h1>
        <p>{data.topic.description}</p>
        <p className="topic-count">当前结果：{data.items.length} 条</p>
        {!knownTopic ? (
          <p className="topic-note">这个主题 slug 不在预设列表中，当前显示的是占位说明。</p>
        ) : null}
      </section>

      <section className="showcase-section topic-filter-wrap">
        <div className="section-head">
          <h2>筛选</h2>
          <p>按内容包类型和可消费形式过滤当前主题下的内容。</p>
        </div>
        <div className="filter-group">
          <h3>内容包类型</h3>
          <div className="filter-chip-row">
            {TOPIC_FILTER_OPTIONS.packageType.map((option) => {
              const active = packageTypeRaw === option.value;
              return (
                <Link
                  key={option.value}
                  className={`filter-chip ${active ? "active" : ""}`}
                  href={toTopicHref(slug, {
                    packageType: option.value,
                    assetType: assetTypeRaw,
                  })}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="filter-group">
          <h3>内容形式</h3>
          <div className="filter-chip-row">
            {TOPIC_FILTER_OPTIONS.assetType.map((option) => {
              const active = assetTypeRaw === option.value;
              return (
                <Link
                  key={option.value}
                  className={`filter-chip ${active ? "active" : ""}`}
                  href={toTopicHref(slug, {
                    packageType: packageTypeRaw,
                    assetType: option.value,
                  })}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>内容包列表</h2>
          <p>当前主题下按时间倒序显示内容包。</p>
        </div>
        {data.items.length === 0 ? (
          <EmptyState
            title="当前筛选无结果"
            description="请切换筛选条件，或返回该主题的全部内容。"
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
