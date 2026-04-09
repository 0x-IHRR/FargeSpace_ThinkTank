import type { SourceType } from "@/lib/ui-models";

const SOURCE_LABELS: Record<SourceType, string> = {
  article: "文章",
  video: "视频",
  podcast: "播客",
  paper: "论文",
  website: "网站文档",
};

export function SourceBadge({
  sourceType,
  platform,
}: {
  sourceType: SourceType;
  platform: string;
}) {
  return (
    <span className="source-badge">
      <span className="source-type">{SOURCE_LABELS[sourceType]}</span>
      <span className="source-splitter" />
      <span className="source-platform">{platform}</span>
    </span>
  );
}
