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
