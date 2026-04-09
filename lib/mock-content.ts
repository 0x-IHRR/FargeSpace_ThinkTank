import { ROUTES } from "./routes";
import type {
  CollectionDisplayItem,
  PackageDisplayItem,
  TopicDisplayItem,
} from "./ui-models";

export const HOME_FEATURED: PackageDisplayItem = {
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

export const HOME_LATEST: PackageDisplayItem[] = [
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
  {
    slug: "anthropic-agent-capabilities-api-update",
    title: "Anthropic API Agent 能力更新：MCP 与文件能力梳理",
    summary: "对接场景、能力边界和接入方式统一整理，适合开发团队快速对照。",
    packageType: "toolkit",
    displayDate: "2025-05-23",
    topic: { slug: "agents", name: "Agents" },
    availableAssetTypes: ["brief", "slides", "audio"],
    sourceType: "article",
    sourcePlatform: "Anthropic",
  },
  {
    slug: "ai-ascent-2025-video-playlist-digest",
    title: "AI Ascent 2025 视频合集整理：模型、Agent 与基础设施",
    summary: "一份能快速补齐峰会信息面的精选清单，按主题整理观看顺序。",
    packageType: "watchlist",
    displayDate: "2025-05-09",
    topic: { slug: "business", name: "Business" },
    availableAssetTypes: ["brief", "audio", "slides", "video"],
    sourceType: "video",
    sourcePlatform: "YouTube",
  },
  {
    slug: "sam-altman-core-ai-subscription-podcast-digest",
    title: "Sam Altman 访谈整理：AI 订阅层、Agent 协议与产品机会",
    summary: "围绕产品形态、订阅模型和生态位置给出可讨论的框架视角。",
    packageType: "interview",
    displayDate: "2025-08-03",
    topic: { slug: "business", name: "Business" },
    availableAssetTypes: ["brief", "audio", "video"],
    sourceType: "podcast",
    sourcePlatform: "Sequoia Capital",
  },
];

export const HOME_TOPICS: TopicDisplayItem[] = [
  { slug: "agents", name: "Agents" },
  { slug: "models", name: "Models" },
  { slug: "tooling", name: "Tooling" },
  { slug: "research", name: "Research" },
  { slug: "coding", name: "Coding" },
  { slug: "voice_ai", name: "Voice AI" },
];

export const HOME_COLLECTIONS: CollectionDisplayItem[] = [
  { slug: "agentic-ai-watch", name: "Agentic AI Watch" },
  { slug: "research-paper-selection", name: "研究与论文精选" },
  { slug: "developer-tooling-tracker", name: "开发者工具追踪" },
  { slug: "ai-summit-video-selection", name: "AI 峰会视频精选" },
];

export const HOME_FILTER_ENTRY = [
  {
    title: "看 Agent",
    description: "只看 Agent 相关内容",
    href: `${ROUTES.search}?topic=agents`,
  },
  {
    title: "看深度解读",
    description: "只看 deep_dive 内容包",
    href: `${ROUTES.search}?package_type=deep_dive`,
  },
  {
    title: "看论文",
    description: "来源类型筛到 paper",
    href: `${ROUTES.search}?source_type=paper`,
  },
  {
    title: "看视频可消费内容",
    description: "筛选有 video 资产的内容包",
    href: `${ROUTES.search}?asset_type=video`,
  },
  {
    title: "看本月",
    description: "快速查看本月窗口内容",
    href: `${ROUTES.search}?published_from=2025-05-01&published_to=2025-05-31`,
  },
  {
    title: "进入完整搜索",
    description: "组合筛选全部条件",
    href: ROUTES.search,
  },
] as const;
