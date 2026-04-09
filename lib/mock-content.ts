import { ROUTES } from "./routes";
import type {
  AssetType,
  CollectionDisplayItem,
  PackageDisplayItem,
  SourceType,
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

const EXTRA_PACKAGES: PackageDisplayItem[] = [
  {
    slug: "openai-agent-builder-guide-digest",
    title: "OpenAI Agent Builder 指南整理：工作流节点与发布机制",
    summary: "面向团队复用的 Agent 设计路径，整理成可快速落地的结构。",
    packageType: "toolkit",
    displayDate: "2025-05-03",
    topic: { slug: "agents", name: "Agents" },
    availableAssetTypes: ["brief", "slides", "audio"],
    sourceType: "website",
    sourcePlatform: "OpenAI Docs",
    featured: true,
  },
  {
    slug: "operator-browser-agent-recap",
    title: "Operator 回顾：浏览器代理如何进入真实任务",
    summary: "从真实任务流出发，梳理浏览器代理在业务流程中的落地点。",
    packageType: "recap",
    displayDate: "2025-01-24",
    topic: { slug: "agents", name: "Agents" },
    availableAssetTypes: ["brief", "audio", "slides"],
    sourceType: "article",
    sourcePlatform: "OpenAI",
  },
  {
    slug: "agent-skills-mechanism-breakdown",
    title: "Agent Skills 机制解读：AI 工作流如何模块化",
    summary: "聚焦技能化抽象，给出编排复用和扩展边界的拆解框架。",
    packageType: "deep_dive",
    displayDate: "2025-10-17",
    topic: { slug: "agents", name: "Agents" },
    availableAssetTypes: ["brief", "audio", "slides"],
    sourceType: "article",
    sourcePlatform: "Anthropic",
  },
  {
    slug: "gpt-4-1-launch-recap",
    title: "GPT-4.1 发布回顾：长上下文与编码能力",
    summary: "围绕能力边界、适用场景和工程落地做一页式对照。",
    packageType: "recap",
    displayDate: "2025-04-15",
    topic: { slug: "models", name: "Models" },
    availableAssetTypes: ["brief", "audio", "slides"],
    sourceType: "article",
    sourcePlatform: "OpenAI",
  },
  {
    slug: "gemini-2-5-launch-recap",
    title: "Gemini 2.5 首发解读：推理模型与长上下文",
    summary: "从模型能力与竞品位势两条线并行整理核心变化。",
    packageType: "recap",
    displayDate: "2025-03-26",
    topic: { slug: "models", name: "Models" },
    availableAssetTypes: ["brief", "audio", "slides"],
    sourceType: "article",
    sourcePlatform: "Google",
  },
  {
    slug: "deep-dive-claude-3-7-economic-index",
    title: "Claude 3.7 使用洞察：AI 如何进入真实工作场景",
    summary: "围绕真实生产使用行为，整理 AI 渗透路径和组织启发。",
    packageType: "deep_dive",
    displayDate: "2025-03-28",
    topic: { slug: "research", name: "Research" },
    availableAssetTypes: ["brief", "audio", "slides"],
    sourceType: "article",
    sourcePlatform: "Anthropic",
  },
];

export const TOPIC_DETAILS: Record<
  string,
  { name: string; description: string }
> = {
  agents: {
    name: "Agents",
    description: "覆盖 Agent 设计、工作流编排、工具调用和真实任务落地案例。",
  },
  models: {
    name: "Models",
    description: "聚焦模型发布、能力演进和关键差异对比。",
  },
  reasoning: {
    name: "Reasoning",
    description: "围绕推理能力、方法路线和评测表现的持续追踪。",
  },
  tooling: {
    name: "Tooling",
    description: "整理与开发效率相关的工具链、SDK 和连接能力。",
  },
  workflow: {
    name: "Workflow",
    description: "关注流程自动化与协作场景中的可复用方案。",
  },
  research: {
    name: "Research",
    description: "筛选论文和研究结果，提炼可读、可讨论的核心结论。",
  },
  coding: {
    name: "Coding",
    description: "围绕代码生成、调试辅助与工程实践整理方法。",
  },
  business: {
    name: "Business",
    description: "追踪 AI 产品化、商业模式和生态演变。",
  },
  voice_ai: {
    name: "Voice AI",
    description: "聚焦语音交互、语音代理与行业落地案例。",
  },
};

export const TOPIC_FILTER_OPTIONS = {
  packageType: [
    { label: "全部类型", value: "all" },
    { label: "回顾", value: "recap" },
    { label: "深度解读", value: "deep_dive" },
    { label: "清单", value: "watchlist" },
    { label: "工具实践", value: "toolkit" },
    { label: "访谈", value: "interview" },
  ] as const,
  assetType: [
    { label: "全部形式", value: "all" },
    { label: "摘要", value: "brief" },
    { label: "音频", value: "audio" },
    { label: "幻灯片", value: "slides" },
    { label: "视频", value: "video" },
  ] as const,
};

type TopicFilterInput = {
  packageType?: PackageDisplayItem["packageType"] | null;
  assetType?: AssetType | null;
};

const TOPIC_PACKAGE_POOL: PackageDisplayItem[] = [...HOME_LATEST, ...EXTRA_PACKAGES];

function sortPackagesByDateDesc(items: PackageDisplayItem[]) {
  return [...items].sort((a, b) => (a.displayDate < b.displayDate ? 1 : -1));
}

export function getTopicPageData(slug: string, filters: TopicFilterInput = {}) {
  const topicMeta = TOPIC_DETAILS[slug];
  const topic = {
    slug,
    name: topicMeta?.name ?? slug,
    description:
      topicMeta?.description ?? "该主题还在整理中，稍后会补充更完整的主题说明。",
  };

  const items = sortPackagesByDateDesc(
    TOPIC_PACKAGE_POOL.filter((item) => item.topic.slug === slug)
  ).filter((item) => {
    if (filters.packageType && item.packageType !== filters.packageType) {
      return false;
    }
    if (
      filters.assetType &&
      !item.availableAssetTypes.includes(filters.assetType)
    ) {
      return false;
    }
    return true;
  });

  return {
    topic,
    items,
  };
}

const COLLECTION_DETAILS: Record<
  string,
  { name: string; description: string }
> = {
  "agentic-ai-watch": {
    name: "Agentic AI Watch",
    description: "持续追踪 Agent 设计、工作流编排与落地能力演进。",
  },
  "research-paper-selection": {
    name: "研究与论文精选",
    description: "聚焦高价值论文与研究内容，沉淀可复用的阅读线索。",
  },
  "developer-tooling-tracker": {
    name: "开发者工具追踪",
    description: "围绕 SDK、工具链与连接能力做持续更新与比对。",
  },
  "ai-summit-video-selection": {
    name: "AI 峰会视频精选",
    description: "按主题整理峰会与访谈视频，便于快速补齐信息面。",
  },
  "model-release-observer": {
    name: "模型发布观察",
    description: "整理重点模型发布与能力变化，持续维护可对照时间线。",
  },
  "ai-product-and-ecosystem": {
    name: "AI 产品与生态",
    description: "关注产品策略、生态合作与平台动作的结构化变化。",
  },
  "ai-usage-and-trends": {
    name: "AI 使用与趋势",
    description: "围绕使用行为与行业变化，提炼趋势级判断素材。",
  },
  "ai-industry-applications": {
    name: "AI 行业应用",
    description: "聚焦医疗、企业服务等行业落地案例与方法。",
  },
};

const COLLECTION_PACKAGE_ORDER: Record<string, string[]> = {
  "agentic-ai-watch": [
    "agent-skills-mechanism-breakdown",
    "openai-agent-builder-guide-digest",
    "operator-browser-agent-recap",
    "anthropic-agent-capabilities-api-update",
  ],
  "research-paper-selection": [
    "deepseek-r1-paper-digest",
    "deep-dive-claude-3-7-economic-index",
  ],
  "developer-tooling-tracker": [
    "gemini-2-5-pro-web-apps-update",
    "openai-agent-builder-guide-digest",
    "anthropic-agent-capabilities-api-update",
  ],
  "ai-summit-video-selection": ["ai-ascent-2025-video-playlist-digest"],
  "model-release-observer": [
    "gpt-4-1-launch-recap",
    "gemini-2-5-launch-recap",
  ],
  "ai-product-and-ecosystem": [
    "sam-altman-core-ai-subscription-podcast-digest",
  ],
  "ai-usage-and-trends": ["deep-dive-claude-3-7-economic-index"],
  "ai-industry-applications": ["voice-ai-healthcare-podcast-digest"],
};

const PACKAGE_INDEX_BY_SLUG: Record<string, PackageDisplayItem> = Object.fromEntries(
  [...HOME_LATEST, ...EXTRA_PACKAGES].map((item) => [item.slug, item])
);

const ALL_PACKAGES: PackageDisplayItem[] = Object.values(PACKAGE_INDEX_BY_SLUG);

export function getCollectionPageData(slug: string) {
  const collectionMeta = COLLECTION_DETAILS[slug];
  const collection = {
    slug,
    name: collectionMeta?.name ?? slug,
    description:
      collectionMeta?.description ?? "该合集还在整理中，稍后会补充更完整的合集说明。",
  };

  const orderedSlugs = COLLECTION_PACKAGE_ORDER[slug] ?? [];
  const items = orderedSlugs
    .map((itemSlug) => PACKAGE_INDEX_BY_SLUG[itemSlug])
    .filter((item): item is PackageDisplayItem => Boolean(item));

  return {
    collection,
    items,
    knownCollection: Boolean(collectionMeta),
  };
}

export const SEARCH_FILTER_OPTIONS = {
  topic: [
    { label: "全部主题", value: "all" },
    ...Object.entries(TOPIC_DETAILS).map(([slug, meta]) => ({
      label: meta.name,
      value: slug,
    })),
  ] as const,
  packageType: [
    { label: "全部类型", value: "all" },
    { label: "回顾", value: "recap" },
    { label: "深度解读", value: "deep_dive" },
    { label: "清单", value: "watchlist" },
    { label: "工具实践", value: "toolkit" },
    { label: "访谈", value: "interview" },
  ] as const,
  sourceType: [
    { label: "全部来源", value: "all" },
    { label: "文章", value: "article" },
    { label: "视频", value: "video" },
    { label: "播客", value: "podcast" },
    { label: "论文", value: "paper" },
    { label: "网站文档", value: "website" },
  ] as const,
  assetType: [
    { label: "全部形式", value: "all" },
    { label: "摘要", value: "brief" },
    { label: "音频", value: "audio" },
    { label: "幻灯片", value: "slides" },
    { label: "视频", value: "video" },
  ] as const,
};

type SearchFilters = {
  q?: string;
  topic?: string;
  packageType?: PackageDisplayItem["packageType"] | null;
  sourceType?: SourceType | null;
  assetType?: AssetType | null;
  publishedFrom?: string;
  publishedTo?: string;
};

function normalizeDateInput(value: string | undefined) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function includesKeyword(item: PackageDisplayItem, keyword: string) {
  const haystack = `${item.title} ${item.summary} ${item.sourcePlatform}`.toLowerCase();
  return haystack.includes(keyword.toLowerCase());
}

export function getSearchPageData(filters: SearchFilters = {}) {
  const q = filters.q?.trim() ?? "";
  const publishedFrom = normalizeDateInput(filters.publishedFrom);
  const publishedTo = normalizeDateInput(filters.publishedTo);

  const items = sortPackagesByDateDesc(ALL_PACKAGES).filter((item) => {
    if (q && !includesKeyword(item, q)) return false;
    if (filters.topic && filters.topic !== "all" && item.topic.slug !== filters.topic) {
      return false;
    }
    if (filters.packageType && item.packageType !== filters.packageType) {
      return false;
    }
    if (filters.sourceType && item.sourceType !== filters.sourceType) {
      return false;
    }
    if (filters.assetType && !item.availableAssetTypes.includes(filters.assetType)) {
      return false;
    }
    if (publishedFrom && item.displayDate < publishedFrom) {
      return false;
    }
    if (publishedTo && item.displayDate > publishedTo) {
      return false;
    }
    return true;
  });

  return {
    items,
    total: items.length,
  };
}
