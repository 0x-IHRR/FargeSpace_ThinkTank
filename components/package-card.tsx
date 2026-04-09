import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { PackageDisplayItem } from "@/lib/ui-models";
import { AssetBadge } from "./asset-badge";
import { SourceBadge } from "./source-badge";
import { TopicPill } from "./topic-pill";

export function PackageCard({ item }: { item: PackageDisplayItem }) {
  return (
    <article className="package-card">
      <div className="package-card-head">
        <p className="package-date">{item.displayDate}</p>
        <TopicPill topic={item.topic} />
      </div>
      <h3>
        <Link href={ROUTES.packageDetail(item.slug)}>{item.title}</Link>
      </h3>
      <p>{item.summary}</p>
      <div className="package-card-foot">
        <SourceBadge sourceType={item.sourceType} platform={item.sourcePlatform} />
        <div className="asset-row">
          {item.availableAssetTypes.map((type) => (
            <AssetBadge key={`${item.slug}-${type}`} type={type} />
          ))}
        </div>
      </div>
    </article>
  );
}
