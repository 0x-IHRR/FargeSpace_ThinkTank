import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const REQUIRED_COLUMNS = [
  "seed_id",
  "source_title",
  "source_type",
  "platform",
  "source_url",
  "source_language",
  "source_published_at",
  "package_title",
  "package_slug",
  "package_type",
  "publication_cycle",
  "primary_topic",
  "additional_topics",
  "collection_name",
  "brief_required",
  "audio_optional",
  "slides_optional",
  "video_optional",
  "raw_source_visible",
  "publish_start_at",
  "notes",
];

export const ALLOWED = {
  sourceType: new Set(["article", "video", "podcast", "paper", "website"]),
  sourceLanguage: new Set(["en", "zh", "other"]),
  packageType: new Set(["recap", "deep_dive", "watchlist", "toolkit", "interview"]),
  publicationCycle: new Set(["weekly", "monthly", "special"]),
  topicSlug: new Set([
    "agents",
    "models",
    "reasoning",
    "tooling",
    "workflow",
    "research",
    "coding",
    "business",
    "voice_ai",
  ]),
  additionalTopicToken: new Set([
    "agents",
    "models",
    "reasoning",
    "tooling",
    "workflow",
    "research",
    "coding",
    "business",
    "voice_ai",
    "strategy",
    "media",
    "economy",
    "healthcare",
    "integration",
    "infrastructure",
    "platform",
    "product",
  ]),
};

export const COLLECTION_NAME_TO_SLUG = {
  模型发布观察: "model-release-observer",
  "Agentic AI Watch": "agentic-ai-watch",
  "AI 产品与生态": "ai-product-and-ecosystem",
  开发者工具追踪: "developer-tooling-tracker",
  "AI 使用与趋势": "ai-usage-and-trends",
  研究与论文精选: "research-paper-selection",
  "AI 行业应用": "ai-industry-applications",
  "AI 峰会视频精选": "ai-summit-video-selection",
};

function parseCsvRow(line) {
  const values = [];
  let buffer = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        buffer += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(buffer);
      buffer = "";
      continue;
    }

    buffer += char;
  }

  values.push(buffer);
  return values;
}

function parseCsv(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { header: [], rows: [] };
  }

  const header = parseCsvRow(lines[0]).map((value) => value.trim());
  const rows = lines.slice(1).map((line) => parseCsvRow(line));
  return { header, rows };
}

function toBoolean(raw, { required = false } = {}) {
  const value = `${raw ?? ""}`.trim().toLowerCase();
  if (!value && !required) return null;
  if (value === "yes" || value === "true") return true;
  if (value === "no" || value === "false") return false;
  return undefined;
}

function toIsoDatetime(raw) {
  const value = `${raw ?? ""}`.trim();
  if (!value) return null;

  if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(value)) {
    return undefined;
  }

  if (value.length === 10) {
    return `${value}T00:00:00Z`;
  }

  return `${value.replace(" ", "T")}Z`;
}

function parseAdditionalTopics(raw) {
  const value = `${raw ?? ""}`.trim();
  if (!value) return [];
  return value
    .split(";")
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0);
}

function deriveUseCase(primaryTopic, additionalTopics) {
  const tags = new Set(additionalTopics);
  if (tags.has("strategy")) return "strategy";
  if (tags.has("tooling") || primaryTopic === "tooling") return "tooling";
  if (tags.has("workflow") || primaryTopic === "workflow") return "workflow";
  if (tags.has("research") || primaryTopic === "research") return "research";
  return "awareness";
}

function deriveDifficulty(packageType) {
  if (packageType === "deep_dive") return "advanced";
  if (packageType === "toolkit") return "intermediate";
  return "beginner";
}

function deriveSignalLevel({ packageType, sourceType }) {
  if (sourceType === "paper" || packageType === "deep_dive") return "high_signal";
  if (packageType === "watchlist") return "reference";
  return "reference";
}

function deriveAdditionalTopicSlugs(primaryTopic, tokens) {
  const result = [];
  for (const token of tokens) {
    if (!ALLOWED.topicSlug.has(token)) continue;
    if (token === primaryTopic) continue;
    if (result.includes(token)) continue;
    result.push(token);
  }
  return result;
}

function createBriefMarkdown(record) {
  const lines = [
    `# ${record.packageTitle}`,
    "",
    `原始来源：${record.sourceTitle}`,
    `来源链接：${record.sourceUrl}`,
    "",
    "## 种子摘要",
    "这是一条导入阶段生成的占位摘要，后续由编辑补充正式内容。",
  ];
  if (record.notes) {
    lines.push("", `备注：${record.notes}`);
  }
  return lines.join("\n");
}

function normalizeRow(raw, rowIndex) {
  const rowTag = `row ${rowIndex + 2}`;

  const seedId = raw.seed_id?.trim();
  const sourceTitle = raw.source_title?.trim();
  const sourceType = raw.source_type?.trim().toLowerCase();
  const platform = raw.platform?.trim();
  const sourceUrl = raw.source_url?.trim();
  const sourceLanguage = raw.source_language?.trim().toLowerCase();
  const sourcePublishedAt = toIsoDatetime(raw.source_published_at);
  const packageTitle = raw.package_title?.trim();
  const packageSlug = raw.package_slug?.trim();
  const packageType = raw.package_type?.trim().toLowerCase();
  const publicationCycle = raw.publication_cycle?.trim().toLowerCase();
  const primaryTopic = raw.primary_topic?.trim().toLowerCase();
  const additionalTopics = parseAdditionalTopics(raw.additional_topics);
  const collectionName = raw.collection_name?.trim();
  const collectionSlug = COLLECTION_NAME_TO_SLUG[collectionName];
  const briefRequired = toBoolean(raw.brief_required, { required: true });
  const audioOptional = toBoolean(raw.audio_optional);
  const slidesOptional = toBoolean(raw.slides_optional);
  const videoOptional = toBoolean(raw.video_optional);
  const rawSourceVisible = toBoolean(raw.raw_source_visible, { required: true });
  const publishStartAt = toIsoDatetime(raw.publish_start_at);
  const notes = raw.notes?.trim() ?? "";

  const errors = [];
  const warnings = [];

  const requiredPairs = [
    ["seed_id", seedId],
    ["source_title", sourceTitle],
    ["source_type", sourceType],
    ["platform", platform],
    ["source_url", sourceUrl],
    ["source_language", sourceLanguage],
    ["package_title", packageTitle],
    ["package_slug", packageSlug],
    ["package_type", packageType],
    ["publication_cycle", publicationCycle],
    ["primary_topic", primaryTopic],
    ["collection_name", collectionName],
    ["publish_start_at", publishStartAt],
  ];

  for (const [field, value] of requiredPairs) {
    if (!value) errors.push(`${rowTag}: missing ${field}`);
  }

  if (sourceUrl && !/^https?:\/\//.test(sourceUrl)) {
    errors.push(`${rowTag}: source_url must start with http:// or https://`);
  }

  if (sourceType && !ALLOWED.sourceType.has(sourceType)) {
    errors.push(`${rowTag}: unsupported source_type "${sourceType}"`);
  }
  if (sourceLanguage && !ALLOWED.sourceLanguage.has(sourceLanguage)) {
    errors.push(`${rowTag}: unsupported source_language "${sourceLanguage}"`);
  }
  if (packageType && !ALLOWED.packageType.has(packageType)) {
    errors.push(`${rowTag}: unsupported package_type "${packageType}"`);
  }
  if (publicationCycle && !ALLOWED.publicationCycle.has(publicationCycle)) {
    errors.push(`${rowTag}: unsupported publication_cycle "${publicationCycle}"`);
  }
  if (primaryTopic && !ALLOWED.topicSlug.has(primaryTopic)) {
    errors.push(`${rowTag}: unsupported primary_topic "${primaryTopic}"`);
  }

  if (!collectionSlug && collectionName) {
    errors.push(`${rowTag}: collection_name "${collectionName}" not in frozen list`);
  }

  if (briefRequired !== true) {
    errors.push(`${rowTag}: brief_required must be yes/true`);
  }

  if (audioOptional === undefined) {
    errors.push(`${rowTag}: audio_optional must be yes/no`);
  }
  if (slidesOptional === undefined) {
    errors.push(`${rowTag}: slides_optional must be yes/no`);
  }
  if (videoOptional === undefined) {
    errors.push(`${rowTag}: video_optional must be yes/no`);
  }
  if (rawSourceVisible === undefined) {
    errors.push(`${rowTag}: raw_source_visible must be true/false`);
  }

  if (sourcePublishedAt === undefined) {
    errors.push(`${rowTag}: source_published_at format must be YYYY-MM-DD or YYYY-MM-DD HH:mm:ss`);
  }
  if (publishStartAt === undefined) {
    errors.push(`${rowTag}: publish_start_at format must be YYYY-MM-DD or YYYY-MM-DD HH:mm:ss`);
  }

  for (const token of additionalTopics) {
    if (!ALLOWED.additionalTopicToken.has(token)) {
      errors.push(`${rowTag}: unknown additional_topics token "${token}"`);
    }
  }

  const ignoredAdditionalTokens = additionalTopics.filter(
    (token) =>
      !ALLOWED.topicSlug.has(token) &&
      !["strategy", "tooling", "workflow", "research"].includes(token)
  );
  if (ignoredAdditionalTokens.length > 0) {
    warnings.push(
      `${rowTag}: additional_topics ignored in model = ${ignoredAdditionalTokens.join(", ")}`
    );
  }

  const additionalTopicSlugs = deriveAdditionalTopicSlugs(primaryTopic, additionalTopics);
  const useCase = deriveUseCase(primaryTopic, additionalTopics);
  const difficulty = deriveDifficulty(packageType);
  const signalLevel = deriveSignalLevel({ packageType, sourceType });

  return {
    errors,
    warnings,
    normalized: {
      seedId,
      sourceTitle,
      sourceType,
      platform,
      sourceUrl,
      sourceLanguage,
      sourcePublishedAt,
      packageTitle,
      packageSlug,
      packageType,
      publicationCycle,
      primaryTopic,
      additionalTopicSlugs,
      collectionName,
      collectionSlug,
      briefRequired,
      audioOptional,
      slidesOptional,
      videoOptional,
      rawSourceVisible,
      publishStartAt,
      notes,
      useCase,
      difficulty,
      signalLevel,
      briefBodyMarkdown: createBriefMarkdown({
        packageTitle,
        sourceTitle,
        sourceUrl,
        notes,
      }),
    },
  };
}

export async function loadAndValidateSeed(csvPath) {
  const rawText = await readFile(csvPath, "utf-8");
  const { header, rows } = parseCsv(rawText);

  const errors = [];
  const warnings = [];
  const normalizedRows = [];

  for (const col of REQUIRED_COLUMNS) {
    if (!header.includes(col)) {
      errors.push(`missing required column: ${col}`);
    }
  }

  if (errors.length > 0) {
    return { errors, warnings, normalizedRows };
  }

  const slugSeen = new Set();
  const seedIdSeen = new Set();

  for (let index = 0; index < rows.length; index += 1) {
    const values = rows[index];
    if (values.length !== header.length) {
      errors.push(
        `row ${index + 2}: column count mismatch (expected ${header.length}, got ${values.length})`
      );
      continue;
    }

    const row = Object.fromEntries(header.map((col, i) => [col, values[i]?.trim() ?? ""]));
    const result = normalizeRow(row, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);

    if (result.normalized.seedId) {
      if (seedIdSeen.has(result.normalized.seedId)) {
        errors.push(`row ${index + 2}: duplicated seed_id "${result.normalized.seedId}"`);
      } else {
        seedIdSeen.add(result.normalized.seedId);
      }
    }

    if (result.normalized.packageSlug) {
      if (!/^[a-z0-9-]+$/.test(result.normalized.packageSlug)) {
        errors.push(
          `row ${index + 2}: package_slug "${result.normalized.packageSlug}" must use lowercase letters, numbers, hyphen`
        );
      }
      if (slugSeen.has(result.normalized.packageSlug)) {
        errors.push(`row ${index + 2}: duplicated package_slug "${result.normalized.packageSlug}"`);
      } else {
        slugSeen.add(result.normalized.packageSlug);
      }
    }

    normalizedRows.push(result.normalized);
  }

  return { errors, warnings, normalizedRows };
}

export function deriveWorkflowState(publishStartAtIso) {
  const target = new Date(publishStartAtIso).getTime();
  const now = Date.now();
  return target <= now ? "published" : "scheduled";
}

export async function ensureReportFile(reportPath, payload) {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

export function resolveProjectPath(relativePath) {
  return resolve(process.cwd(), relativePath);
}
