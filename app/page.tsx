import { CollectionPill } from "@/components/collection-pill";
import { PackageCard } from "@/components/package-card";
import { PackageHero } from "@/components/package-hero";
import { SourceBadge } from "@/components/source-badge";
import { AssetBadge } from "@/components/asset-badge";
import { TopicPill } from "@/components/topic-pill";
import type {
  CollectionDisplayItem,
  PackageDisplayItem,
  TopicDisplayItem,
} from "@/lib/ui-models";

export default function HomePage() {
  const featured: PackageDisplayItem = {
    slug: "openai-agent-builder-guide-digest",
    title: "OpenAI Agent Builder 指南整理：工作流节点与发布机制",
    summary:
      "聚焦 Agent Builder 的核心节点、动作编排与发布路径，适合作为团队统一的 Agent 工作流参考底稿。",
    packageType: "toolkit",
    displayDate: "2025-05-03",
    topic: {
      slug: "agents",
      name: "Agents",
    },
    availableAssetTypes: ["brief", "slides", "audio"],
    sourceType: "website",
    sourcePlatform: "OpenAI Docs",
    featured: true,
  };

  const latest: PackageDisplayItem[] = [
    {
      slug: "gemini-2-5-pro-web-apps-update",
      title: "Gemini 2.5 Pro 更新：Web 应用与 Agent 工作流能力",
      summary: "围绕模型更新里的开发者能力，拆解适合团队复用的实践路径。",
      packageType: "toolkit",
      displayDate: "2025-05-07",
      topic: { slug: "coding", name: "Coding" },
      availableAssetTypes: ["brief", "slides", "audio"],
      sourceType: "article",
      sourcePlatform: "Google",
    },
    {
      slug: "deepseek-r1-paper-digest",
      title: "DeepSeek-R1 论文整理：强化学习如何激发表现型推理",
      summary: "整理论文里的关键训练思路与评测重点，便于快速进入讨论。",
      packageType: "deep_dive",
      displayDate: "2025-01-23",
      topic: { slug: "research", name: "Research" },
      availableAssetTypes: ["brief", "slides", "audio"],
      sourceType: "paper",
      sourcePlatform: "arXiv",
    },
    {
      slug: "voice-ai-healthcare-podcast-digest",
      title: "Voice AI 在医疗中的落地：语音代理如何替代重复劳动",
      summary: "从医疗场景切入，提炼 Voice Agent 在流程替代中的关键模式。",
      packageType: "interview",
      displayDate: "2025-02-12",
      topic: { slug: "voice_ai", name: "Voice AI" },
      availableAssetTypes: ["brief", "audio", "video"],
      sourceType: "podcast",
      sourcePlatform: "a16z",
    },
  ];

  const topics: TopicDisplayItem[] = [
    { slug: "agents", name: "Agents" },
    { slug: "models", name: "Models" },
    { slug: "tooling", name: "Tooling" },
    { slug: "research", name: "Research" },
  ];

  const collections: CollectionDisplayItem[] = [
    { slug: "agentic-ai-watch", name: "Agentic AI Watch" },
    { slug: "research-paper-selection", name: "研究与论文精选" },
    { slug: "developer-tooling-tracker", name: "开发者工具追踪" },
  ];

  return (
    <div className="showcase-stack">
      <PackageHero item={featured} />

      <section className="showcase-section">
        <div className="section-head">
          <h2>共享卡片组件</h2>
          <p>用于首页、主题页、合集页、搜索页的内容列表展示。</p>
        </div>
        <div className="package-grid">
          {latest.map((item) => (
            <PackageCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="section-head">
          <h2>标签组件</h2>
          <p>主题、合集、来源、资产四类标签统一复用。</p>
        </div>
        <div className="pill-row">
          {topics.map((topic) => (
            <TopicPill key={topic.slug} topic={topic} />
          ))}
        </div>
        <div className="pill-row">
          {collections.map((collection) => (
            <CollectionPill key={collection.slug} collection={collection} />
          ))}
        </div>
        <div className="pill-row">
          <SourceBadge sourceType="article" platform="OpenAI" />
          <SourceBadge sourceType="podcast" platform="Sequoia Capital" />
          <SourceBadge sourceType="paper" platform="arXiv" />
        </div>
        <div className="pill-row">
          <AssetBadge type="brief" />
          <AssetBadge type="audio" />
          <AssetBadge type="slides" />
          <AssetBadge type="video" />
        </div>
      </section>
    </div>
  );
}
