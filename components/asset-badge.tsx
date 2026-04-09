import type { AssetType } from "@/lib/ui-models";

const LABELS: Record<AssetType, string> = {
  brief: "摘要",
  audio: "音频",
  slides: "幻灯片",
  video: "视频",
};

export function AssetBadge({ type }: { type: AssetType }) {
  return (
    <span className={`asset-badge asset-${type}`}>
      <span className="asset-dot" />
      {LABELS[type]}
    </span>
  );
}
