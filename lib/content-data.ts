import { cache } from "react";
import {
  HOME_COLLECTIONS,
  HOME_FEATURED,
  HOME_FILTER_ENTRY,
  HOME_LATEST,
  HOME_TOPICS,
  SEARCH_FILTER_OPTIONS,
  TOPIC_DETAILS,
  TOPIC_FILTER_OPTIONS,
  getCollectionPageData as getMockCollectionPageData,
  getPackageDetailData as getMockPackageDetailData,
  getSearchPageData as getMockSearchPageData,
  getTopicPageData as getMockTopicPageData,
} from "./mock-content";
import type {
  AssetType,
  CollectionDisplayItem,
  PackageDetailData,
  PackageDisplayItem,
  SourceType,
  TopicDisplayItem,
} from "./ui-models";

type TopicFilterInput = {
  packageType?: PackageDisplayItem["packageType"] | null;
  assetType?: AssetType | null;
};

type SearchFilters = {
  q?: string;
  topic?: string;
  packageType?: PackageDisplayItem["packageType"] | null;
  sourceType?: SourceType | null;
  assetType?: AssetType | null;
  publishedFrom?: string;
  publishedTo?: string;
};

type DirectusCollectionRecord = {
  slug: string;
  name: string;
  description?: string | null;
  sort_order?: number | null;
};

type DirectusTopicRecord = DirectusCollectionRecord;

type DirectusPackageRecord = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  package_type: PackageDisplayItem["packageType"];
  sort_date?: string | null;
  publish_start_at?: string | null;
  is_featured?: boolean | null;
  raw_source_visible?: boolean | null;
  primary_topic_id?: {
    slug: string;
    name: string;
  } | null;
};

type DirectusAssetRecord = {
  package_id?: { id: string; slug: string } | null;
  asset_type: AssetType;
  title: string;
  language?: "zh" | "en" | "other" | null;
  sort_order?: number | null;
  is_primary?: boolean | null;
  body_markdown?: string | null;
  external_url?: string | null;
  status?: string | null;
};

type DirectusSourceLinkRecord = {
  package_id?: { id: string; slug: string } | null;
  source_id?: {
    title: string;
    source_type: SourceType;
    platform: string;
    source_url: string;
    language?: "zh" | "en" | "other" | null;
    published_at?: string | null;
  } | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
};

type DirectusTopicLinkRecord = {
  package_id?: { id: string; slug: string } | null;
  topic_id?: { slug: string; name: string } | null;
  sort_order?: number | null;
};

type DirectusCollectionLinkRecord = {
  package_id?: { id: string; slug: string } | null;
  collection_id?: { slug: string; name: string } | null;
  sort_order?: number | null;
};

type CatalogPackage = {
  display: PackageDisplayItem;
  detail: PackageDetailData;
};

type Catalog = {
  packages: CatalogPackage[];
  topics: DirectusTopicRecord[];
  collections: DirectusCollectionRecord[];
};

const directusBaseUrl =
  process.env.DIRECTUS_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, "") ??
  null;
const directusToken = process.env.DIRECTUS_TOKEN ?? null;

function hasDirectusConfig() {
  return Boolean(directusBaseUrl && directusToken);
}

async function directusRequest<T>(path: string) {
  if (!directusBaseUrl || !directusToken) {
    throw new Error("missing Directus runtime config");
  }

  const response = await fetch(`${directusBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${directusToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Directus request failed: ${response.status} ${path} ${text}`);
  }

  const payload = await response.json();
  return payload.data as T;
}

function displayDateOf(item: DirectusPackageRecord) {
  return (item.sort_date ?? item.publish_start_at ?? "").slice(0, 10);
}

function sortDateDesc<T extends { display: { displayDate: string } }>(items: T[]) {
  return [...items].sort((a, b) =>
    a.display.displayDate < b.display.displayDate ? 1 : -1
  );
}

function normalizeDateInput(value: string | undefined) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function includesKeyword(item: PackageDisplayItem, keyword: string) {
  const haystack = `${item.title} ${item.summary} ${item.sourcePlatform}`.toLowerCase();
  return haystack.includes(keyword.toLowerCase());
}

const getDirectusCatalog = cache(async (): Promise<Catalog> => {
  const [
    packages,
    assetLinks,
    sourceLinks,
    topicLinks,
    collectionLinks,
    topics,
    collections,
  ] = await Promise.all([
    directusRequest<DirectusPackageRecord[]>(
      "/items/packages?limit=-1&sort=-sort_date&fields=id,slug,title,summary,package_type,sort_date,publish_start_at,is_featured,raw_source_visible,primary_topic_id.slug,primary_topic_id.name&filter[workflow_state][_eq]=published"
    ),
    directusRequest<DirectusAssetRecord[]>(
      "/items/processed_assets?limit=-1&sort=sort_order&fields=package_id.id,package_id.slug,asset_type,title,language,sort_order,is_primary,body_markdown,external_url,status"
    ),
    directusRequest<DirectusSourceLinkRecord[]>(
      "/items/package_sources?limit=-1&sort=sort_order&fields=package_id.id,package_id.slug,source_id.title,source_id.source_type,source_id.platform,source_id.source_url,source_id.language,source_id.published_at,is_primary,sort_order"
    ),
    directusRequest<DirectusTopicLinkRecord[]>(
      "/items/package_topics?limit=-1&sort=sort_order&fields=package_id.id,package_id.slug,topic_id.slug,topic_id.name,sort_order"
    ),
    directusRequest<DirectusCollectionLinkRecord[]>(
      "/items/package_collections?limit=-1&sort=sort_order&fields=package_id.id,package_id.slug,collection_id.slug,collection_id.name,sort_order"
    ),
    directusRequest<DirectusTopicRecord[]>(
      "/items/topics?limit=-1&sort=sort_order&fields=slug,name,description,sort_order&filter[status][_eq]=active"
    ),
    directusRequest<DirectusCollectionRecord[]>(
      "/items/curated_collections?limit=-1&sort=sort_order&fields=slug,name,description,sort_order&filter[status][_eq]=active"
    ),
  ]);

  const publishedPackageIds = new Set(packages.map((item) => item.id));
  const assetsByPackage = new Map<string, PackageDetailData["assets"]>();
  const sourcesByPackage = new Map<string, PackageDetailData["sources"]>();
  const topicsByPackage = new Map<string, PackageDetailData["topics"]>();
  const collectionsByPackage = new Map<string, PackageDetailData["collections"]>();

  for (const asset of assetLinks) {
    const packageId = asset.package_id?.id;
    if (!packageId || !publishedPackageIds.has(packageId) || asset.status !== "active") continue;
    const list = assetsByPackage.get(packageId) ?? [];
    list.push({
      assetType: asset.asset_type,
      title: asset.title,
      language: asset.language ?? "other",
      sortOrder: asset.sort_order ?? 0,
      isPrimary: asset.is_primary ?? false,
      bodyMarkdown: asset.body_markdown ?? undefined,
      externalUrl: asset.external_url ?? undefined,
    });
    assetsByPackage.set(packageId, list);
  }

  for (const link of sourceLinks) {
    const packageId = link.package_id?.id;
    const source = link.source_id;
    if (!packageId || !publishedPackageIds.has(packageId) || !source) continue;
    const list = sourcesByPackage.get(packageId) ?? [];
    list.push({
      title: source.title,
      sourceType: source.source_type,
      platform: source.platform,
      sourceUrl: source.source_url,
      language: source.language ?? "other",
      publishedAt: source.published_at?.slice(0, 10),
      isPrimary: link.is_primary ?? false,
      sortOrder: link.sort_order ?? 0,
    });
    sourcesByPackage.set(packageId, list);
  }

  for (const link of topicLinks) {
    const packageId = link.package_id?.id;
    const topic = link.topic_id;
    if (!packageId || !publishedPackageIds.has(packageId) || !topic) continue;
    const list = topicsByPackage.get(packageId) ?? [];
    if (!list.some((item) => item.slug === topic.slug)) {
      list.push({ slug: topic.slug, name: topic.name });
      topicsByPackage.set(packageId, list);
    }
  }

  for (const link of collectionLinks) {
    const packageId = link.package_id?.id;
    const collection = link.collection_id;
    if (!packageId || !publishedPackageIds.has(packageId) || !collection) continue;
    const list = collectionsByPackage.get(packageId) ?? [];
    if (!list.some((item) => item.slug === collection.slug)) {
      list.push({ slug: collection.slug, name: collection.name });
      collectionsByPackage.set(packageId, list);
    }
  }

  const catalogPackages = packages.map((item) => {
    const packageAssets = (assetsByPackage.get(item.id) ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    const packageSources = (sourcesByPackage.get(item.id) ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    const packageTopics = topicsByPackage.get(item.id) ?? [];
    const packageCollections = collectionsByPackage.get(item.id) ?? [];
    const primarySource = packageSources.find((source) => source.isPrimary) ?? packageSources[0];
    const primaryTopic = item.primary_topic_id
      ? { slug: item.primary_topic_id.slug, name: item.primary_topic_id.name }
      : packageTopics[0] ?? { slug: "unknown", name: "Unknown" };

    return {
      display: {
        slug: item.slug,
        title: item.title,
        summary: item.summary?.trim() || "该内容包暂未补充摘要。",
        packageType: item.package_type,
        displayDate: displayDateOf(item),
        topic: primaryTopic,
        availableAssetTypes: packageAssets.map((asset) => asset.assetType),
        sourceType: primarySource?.sourceType ?? "website",
        sourcePlatform: primarySource?.platform ?? "Directus",
        featured: item.is_featured ?? false,
      },
      detail: {
        slug: item.slug,
        title: item.title,
        summary: item.summary?.trim() || "该内容包暂未补充摘要。",
        packageType: item.package_type,
        displayDate: displayDateOf(item),
        primaryTopic,
        topics: packageTopics,
        collections: packageCollections,
        rawSourceVisible: item.raw_source_visible ?? false,
        assets: packageAssets,
        sources: packageSources,
      },
    };
  });

  return {
    packages: sortDateDesc(catalogPackages),
    topics,
    collections,
  };
});

async function withCatalogFallback<T>(loader: (catalog: Catalog) => T, fallback: () => T) {
  if (!hasDirectusConfig()) return fallback();

  try {
    const catalog = await getDirectusCatalog();
    return loader(catalog);
  } catch (error) {
    console.error("Directus catalog fallback triggered", error);
    return fallback();
  }
}

export { HOME_FILTER_ENTRY, SEARCH_FILTER_OPTIONS, TOPIC_DETAILS, TOPIC_FILTER_OPTIONS };

export async function getHomePageData(): Promise<{
  featured: PackageDisplayItem | null;
  latest: PackageDisplayItem[];
  topics: TopicDisplayItem[];
  collections: CollectionDisplayItem[];
}> {
  return withCatalogFallback(
    (catalog) => ({
      featured:
        catalog.packages.find((item) => item.display.featured)?.display ??
        catalog.packages[0]?.display ??
        null,
      latest: catalog.packages.slice(0, 6).map((item) => item.display),
      topics: catalog.topics.map((item) => ({ slug: item.slug, name: item.name })),
      collections: catalog.collections.map((item) => ({ slug: item.slug, name: item.name })),
    }),
    () => {
      return {
        featured: HOME_FEATURED,
        latest: HOME_LATEST,
        topics: HOME_TOPICS,
        collections: HOME_COLLECTIONS,
      };
    }
  );
}

export async function getTopicPageData(slug: string, filters: TopicFilterInput = {}) {
  return withCatalogFallback(
    (catalog) => {
      const topicMeta = catalog.topics.find((item) => item.slug === slug);
      const topic = {
        slug,
        name: topicMeta?.name ?? slug,
        description:
          topicMeta?.description ??
          "该主题还在整理中，稍后会补充更完整的主题说明。",
      };

      const items = catalog.packages
        .filter((item) => item.display.topic.slug === slug)
        .filter((item) => {
          if (filters.packageType && item.display.packageType !== filters.packageType) return false;
          if (
            filters.assetType &&
            !item.display.availableAssetTypes.includes(filters.assetType)
          ) {
            return false;
          }
          return true;
        })
        .map((item) => item.display);

      return {
        topic,
        items,
        knownTopic: Boolean(topicMeta),
      };
    },
    () => {
      const data = getMockTopicPageData(slug, filters);
      return { ...data, knownTopic: Boolean(TOPIC_DETAILS[slug]) };
    }
  );
}

export async function getCollectionPageData(slug: string) {
  return withCatalogFallback(
    (catalog) => {
      const collectionMeta = catalog.collections.find((item) => item.slug === slug);
      const items = catalog.packages
        .filter((item) => item.detail.collections.some((collection) => collection.slug === slug))
        .map((item) => item.display);

      return {
        collection: {
          slug,
          name: collectionMeta?.name ?? slug,
          description:
            collectionMeta?.description ??
            "该合集还在整理中，稍后会补充更完整的合集说明。",
        },
        items,
        knownCollection: Boolean(collectionMeta),
      };
    },
    () => getMockCollectionPageData(slug)
  );
}

export async function getSearchPageData(filters: SearchFilters = {}) {
  return withCatalogFallback(
    (catalog) => {
      const q = filters.q?.trim() ?? "";
      const publishedFrom = normalizeDateInput(filters.publishedFrom);
      const publishedTo = normalizeDateInput(filters.publishedTo);

      const items = catalog.packages
        .map((item) => item.display)
        .filter((item) => {
          if (q && !includesKeyword(item, q)) return false;
          if (filters.topic && filters.topic !== "all" && item.topic.slug !== filters.topic) {
            return false;
          }
          if (filters.packageType && item.packageType !== filters.packageType) return false;
          if (filters.sourceType && item.sourceType !== filters.sourceType) return false;
          if (
            filters.assetType &&
            !item.availableAssetTypes.includes(filters.assetType)
          ) {
            return false;
          }
          if (publishedFrom && item.displayDate < publishedFrom) return false;
          if (publishedTo && item.displayDate > publishedTo) return false;
          return true;
        });

      return { items, total: items.length };
    },
    () => getMockSearchPageData(filters)
  );
}

export async function getPackageDetailData(slug: string) {
  return withCatalogFallback(
    (catalog) => {
      const found = catalog.packages.find((item) => item.detail.slug === slug);
      return {
        detail: found?.detail ?? null,
      };
    },
    () => getMockPackageDetailData(slug)
  );
}
