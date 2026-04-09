import Link from "next/link";
import { CollectionPill } from "@/components/collection-pill";
import { PackageCard } from "@/components/package-card";
import { PackageHero } from "@/components/package-hero";
import { TopicPill } from "@/components/topic-pill";
import {
  HOME_COLLECTIONS,
  HOME_FEATURED,
  HOME_FILTER_ENTRY,
  HOME_LATEST,
  HOME_TOPICS,
} from "@/lib/mock-content";
import { ROUTES } from "@/lib/routes";

export default function HomePage() {
  return (
    <div className="showcase-stack home-stack">
      <section className="showcase-section home-hero-wrap">
        <div className="section-head">
          <h1>FargeSpace Think Tank</h1>
          <p>精选海外 AI 深度内容，统一整理成可直接浏览的会员资料包。</p>
        </div>
        <PackageHero item={HOME_FEATURED} />
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>最新内容</h2>
          <p>按发布时间排序的最新内容包。</p>
        </div>
        <div className="package-grid">
          {HOME_LATEST.map((item) => (
            <PackageCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>主题入口</h2>
          <p>从主题进入对应内容集合。</p>
        </div>
        <div className="pill-row">
          {HOME_TOPICS.map((topic) => (
            <TopicPill key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>合集入口</h2>
          <p>按策展合集快速浏览内容包。</p>
        </div>
        <div className="pill-row">
          {HOME_COLLECTIONS.map((collection) => (
            <CollectionPill key={collection.slug} collection={collection} />
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>基础筛选入口</h2>
          <p>常用筛选条件的一键入口。</p>
        </div>
        <div className="quick-filter-grid">
          {HOME_FILTER_ENTRY.map((item) => (
            <Link key={item.title} className="quick-filter-item" href={item.href}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
        <div className="section-inline-link">
          <Link href={ROUTES.search}>查看完整搜索页</Link>
        </div>
      </section>
    </div>
  );
}
