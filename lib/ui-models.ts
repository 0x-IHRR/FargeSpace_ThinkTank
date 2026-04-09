export type AssetType = "brief" | "audio" | "slides" | "video";
export type SourceType = "article" | "video" | "podcast" | "paper" | "website";

export type PackageDisplayItem = {
  slug: string;
  title: string;
  summary: string;
  packageType: "recap" | "deep_dive" | "watchlist" | "toolkit" | "interview";
  displayDate: string;
  topic: {
    slug: string;
    name: string;
  };
  availableAssetTypes: AssetType[];
  sourceType: SourceType;
  sourcePlatform: string;
  featured?: boolean;
};

export type TopicDisplayItem = {
  slug: string;
  name: string;
};

export type CollectionDisplayItem = {
  slug: string;
  name: string;
};

export type PackageAssetDetail = {
  assetType: AssetType;
  title: string;
  language: "zh" | "en" | "other";
  sortOrder: number;
  isPrimary: boolean;
  bodyMarkdown?: string;
  externalUrl?: string;
  durationSeconds?: number;
};

export type PackageSourceDetail = {
  title: string;
  sourceType: SourceType;
  platform: string;
  sourceUrl: string;
  language: "zh" | "en" | "other";
  publishedAt?: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type PackageDetailData = {
  slug: string;
  title: string;
  summary: string;
  packageType: PackageDisplayItem["packageType"];
  displayDate: string;
  primaryTopic: TopicDisplayItem;
  topics: TopicDisplayItem[];
  collections: CollectionDisplayItem[];
  rawSourceVisible: boolean;
  assets: PackageAssetDetail[];
  sources: PackageSourceDetail[];
};
