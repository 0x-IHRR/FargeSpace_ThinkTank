import { EmptyState } from "@/components/empty-state";
import { PackageCard } from "@/components/package-card";
import { ROUTES } from "@/lib/routes";
import { SEARCH_FILTER_OPTIONS, getSearchPageData } from "@/lib/mock-content";
import type { AssetType, PackageDisplayItem, SourceType } from "@/lib/ui-models";

type SearchPageProps = {
  searchParams?: {
    q?: string;
    topic?: string;
    package_type?: string;
    source_type?: string;
    asset_type?: string;
    published_from?: string;
    published_to?: string;
  };
};

function isPackageType(value: string): value is PackageDisplayItem["packageType"] {
  return ["recap", "deep_dive", "watchlist", "toolkit", "interview"].includes(value);
}

function isSourceType(value: string): value is SourceType {
  return ["article", "video", "podcast", "paper", "website"].includes(value);
}

function isAssetType(value: string): value is AssetType {
  return ["brief", "audio", "slides", "video"].includes(value);
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams?.q?.trim() ?? "";
  const topic = searchParams?.topic ?? "all";

  const packageType = searchParams?.package_type;
  const sourceType = searchParams?.source_type;
  const assetType = searchParams?.asset_type;

  const safePackageType =
    packageType && isPackageType(packageType) ? packageType : undefined;
  const safeSourceType = sourceType && isSourceType(sourceType) ? sourceType : undefined;
  const safeAssetType = assetType && isAssetType(assetType) ? assetType : undefined;

  const publishedFrom = searchParams?.published_from ?? "";
  const publishedTo = searchParams?.published_to ?? "";

  const data = getSearchPageData({
    q,
    topic,
    packageType: safePackageType,
    sourceType: safeSourceType,
    assetType: safeAssetType,
    publishedFrom,
    publishedTo,
  });

  return (
    <div className="showcase-stack search-stack">
      <section className="showcase-section">
        <div className="section-head">
          <h1>搜索</h1>
          <p>通过 URL 参数组合筛选条件，快速定位需要的内容包。</p>
        </div>
        <form className="search-filter-form" action={ROUTES.search} method="get">
          <div className="search-field">
            <label htmlFor="q">关键词</label>
            <input id="q" name="q" defaultValue={q} placeholder="输入标题或摘要关键词" />
          </div>

          <div className="search-field">
            <label htmlFor="topic">主题</label>
            <select id="topic" name="topic" defaultValue={topic}>
              {SEARCH_FILTER_OPTIONS.topic.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="package_type">内容包类型</label>
            <select id="package_type" name="package_type" defaultValue={packageType ?? "all"}>
              {SEARCH_FILTER_OPTIONS.packageType.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="source_type">来源类型</label>
            <select id="source_type" name="source_type" defaultValue={sourceType ?? "all"}>
              {SEARCH_FILTER_OPTIONS.sourceType.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="asset_type">内容形式</label>
            <select id="asset_type" name="asset_type" defaultValue={assetType ?? "all"}>
              {SEARCH_FILTER_OPTIONS.assetType.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="published_from">发布时间（起）</label>
            <input
              id="published_from"
              type="date"
              name="published_from"
              defaultValue={publishedFrom}
            />
          </div>

          <div className="search-field">
            <label htmlFor="published_to">发布时间（止）</label>
            <input
              id="published_to"
              type="date"
              name="published_to"
              defaultValue={publishedTo}
            />
          </div>

          <div className="search-actions">
            <button type="submit" className="state-btn">
              应用筛选
            </button>
            <a className="state-link" href={ROUTES.search}>
              清空筛选
            </a>
          </div>
        </form>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>结果</h2>
          <p>当前命中 {data.total} 条内容。</p>
        </div>
        {data.items.length === 0 ? (
          <EmptyState
            title="无匹配结果"
            description="请调整筛选条件或关键词后重试。"
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
