import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { PackageDisplayItem } from "@/lib/ui-models";
import { AssetBadge } from "./asset-badge";
import { SourceBadge } from "./source-badge";
import { TopicPill } from "./topic-pill";

export function PackageCard({
  item,
  variant = "grid",
}: {
  item: PackageDisplayItem;
  variant?: "grid" | "line";
}) {
  return (
    <article className={`package-card package-card-${variant}`}>
      <div className="package-card-main">
        <h3>
          <Link href={ROUTES.packageDetail(item.slug)}>{item.title}</Link>
        </h3>
        <p>{item.summary}</p>
      </div>
      <div className="package-card-meta">
        <div className="package-card-head">
          <p className="package-date">{item.displayDate}</p>
          <TopicPill topic={item.topic} />
        </div>
        <div className="package-card-foot">
          <SourceBadge sourceType={item.sourceType} platform={item.sourcePlatform} />
          <div className="asset-row">
            {item.availableAssetTypes.map((type) => (
              <AssetBadge key={`${item.slug}-${type}`} type={type} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
