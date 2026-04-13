import Link from "next/link";
import { CollectionPill } from "@/components/collection-pill";
import { PackageCard } from "@/components/package-card";
import { PackageHero } from "@/components/package-hero";
import { TopicPill } from "@/components/topic-pill";
import { HOME_FILTER_ENTRY, getHomePageData } from "@/lib/content-data";
import { ROUTES } from "@/lib/routes";

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="showcase-stack home-stack">
      <section className="showcase-section home-hero-wrap">
        <div className="home-hero-copy">
          <p className="section-kicker">本期资料</p>
          <h1>一份更安静的 AI 信号入口。</h1>
          <p>
            人工筛选海外深度内容，把文章、视频、播客和文档整理成可直接浏览的会员资料包。
          </p>
          <div className="home-hero-actions">
            {data.featured ? (
              <Link className="primary-link" href={ROUTES.packageDetail(data.featured.slug)}>
                进入本期资料包
              </Link>
            ) : null}
            <Link className="secondary-link" href={ROUTES.search}>
              浏览全部资料
            </Link>
          </div>
        </div>
        {data.featured ? <PackageHero item={data.featured} /> : null}
      </section>

      <section className="showcase-section home-latest-section home-split-section">
        <div className="section-head section-head-row">
          <div>
            <p className="section-kicker">最新入库</p>
            <h2>最新整理</h2>
            <p>按发布时间进入最近加入资料库的内容包。</p>
          </div>
          <Link className="section-quiet-link" href={ROUTES.search}>
            查看全部
          </Link>
        </div>
        <div className="home-latest-list">
          {data.latest.map((item) => (
            <PackageCard key={item.slug} item={item} variant="line" />
          ))}
        </div>
      </section>

      <section className="showcase-section home-index-section home-split-section">
        <div className="home-index-grid">
          <div className="home-index-group">
            <p className="section-kicker">主题书架</p>
            <h2>主题入口</h2>
            <p>按研究方向进入对应内容。</p>
            <div className="pill-row">
              {data.topics.map((topic) => (
                <TopicPill key={topic.slug} topic={topic} />
              ))}
            </div>
          </div>
          <div className="home-index-group">
            <p className="section-kicker">精选合集</p>
            <h2>合集入口</h2>
            <p>按策展线索快速浏览内容包。</p>
            <div className="pill-row">
              {data.collections.map((collection) => (
                <CollectionPill key={collection.slug} collection={collection} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-section home-search-section home-split-section">
        <div className="home-search-copy">
          <p className="section-kicker">检索入口</p>
          <h2>需要更快找到资料时，从这里开始。</h2>
          <p>保留几个常用入口，也可以进入完整搜索组合更多条件。</p>
          <Link className="primary-link" href={ROUTES.search}>
            进入完整搜索
          </Link>
        </div>
        <div className="quick-filter-list">
          {HOME_FILTER_ENTRY.map((item) => (
            <Link key={item.title} className="quick-filter-item" href={item.href}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
