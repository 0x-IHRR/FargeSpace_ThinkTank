import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { PackageDisplayItem } from "@/lib/ui-models";
import { SourceBadge } from "./source-badge";
import { TopicPill } from "./topic-pill";

export function PackageHero({ item }: { item: PackageDisplayItem }) {
  return (
    <article className="package-hero">
      <div className="hero-copy">
        <div className="hero-meta-line">
          <span className="hero-featured">本期重点</span>
          <p className="package-date">{item.displayDate}</p>
        </div>
        <h2>
          <Link href={ROUTES.packageDetail(item.slug)}>{item.title}</Link>
        </h2>
        <p>{item.summary}</p>
        <div className="hero-pills">
          <TopicPill topic={item.topic} />
          <SourceBadge sourceType={item.sourceType} platform={item.sourcePlatform} />
        </div>
      </div>
      <div className="hero-footer">
        <Link className="hero-read-link" href={ROUTES.packageDetail(item.slug)}>
          打开资料包
        </Link>
      </div>
    </article>
  );
}
