import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function slugifyTitle(title) {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 180);

  return slug;
}

export function buildPackageSlug(item) {
  return slugifyTitle(item.title) || `content-intake-${item.id.slice(0, 8).toLowerCase()}`;
}

export function deriveWorkflowState(publishMode, publishStartAt) {
  if (publishMode === "draft") return "draft";
  if (!publishStartAt) return "published";

  const target = new Date(publishStartAt).getTime();
  return target > Date.now() ? "scheduled" : "published";
}

export function buildAssetPlans(item) {
  const plans = [];
  let sortOrder = 1;

  if (item.brief_body_markdown || item.brief_file_id?.id) {
    plans.push({
      action: "create",
      collection: "processed_assets",
      payload: {
        asset_type: "brief",
        title: item.brief_title || `${item.title} 摘要`,
        language: "zh",
        body_markdown: item.brief_body_markdown || null,
        file_id: item.brief_file_id?.id ?? null,
        external_url: null,
        is_primary: true,
        status: "active",
        sort_order: sortOrder,
      },
    });
    sortOrder += 1;
  }

  if (item.audio_file_id?.id || item.audio_external_url) {
    plans.push({
      action: "create",
      collection: "processed_assets",
      payload: {
        asset_type: "audio",
        title: `${item.title} 音频版`,
        language: "zh",
        body_markdown: null,
        file_id: item.audio_file_id?.id ?? null,
        external_url: item.audio_external_url || null,
        is_primary: false,
        status: "active",
        sort_order: sortOrder,
      },
    });
    sortOrder += 1;
  }

  if (item.slides_file_id?.id || item.slides_external_url) {
    plans.push({
      action: "create",
      collection: "processed_assets",
      payload: {
        asset_type: "slides",
        title: `${item.title} 幻灯片`,
        language: "zh",
        body_markdown: null,
        file_id: item.slides_file_id?.id ?? null,
        external_url: item.slides_external_url || null,
        is_primary: false,
        status: "active",
        sort_order: sortOrder,
      },
    });
    sortOrder += 1;
  }

  if (item.video_file_id?.id || item.video_external_url) {
    plans.push({
      action: "create",
      collection: "processed_assets",
      payload: {
        asset_type: "video",
        title: `${item.title} 视频版`,
        language: "zh",
        body_markdown: null,
        file_id: item.video_file_id?.id ?? null,
        external_url: item.video_external_url || null,
        is_primary: false,
        status: "active",
        sort_order: sortOrder,
      },
    });
  }

  return plans;
}

export const MINIMUM_VALIDATION_RULES = [
  {
    key: "title",
    label: "资料标题",
    check: (item) => Boolean(item.title),
    message: "请填写资料标题",
  },
  {
    key: "summary",
    label: "简短摘要",
    check: (item) => Boolean(item.summary),
    message: "请填写简短摘要",
  },
  {
    key: "primary_topic_id",
    label: "主主题",
    check: (item) => Boolean(item.primary_topic_id?.id),
    message: "请选择主主题",
  },
  {
    key: "member_tier_id",
    label: "会员层级",
    check: (item) => Boolean(item.member_tier_id?.id),
    message: "请选择会员层级",
  },
  {
    key: "source_type",
    label: "来源类型",
    check: (item) => Boolean(item.source_type),
    message: "请选择来源类型",
  },
  {
    key: "source_platform",
    label: "来源平台",
    check: (item) => Boolean(item.source_platform),
    message: "请填写来源平台",
  },
  {
    key: "source_url",
    label: "原始链接",
    check: (item) => Boolean(item.source_url),
    message: "请填写原始链接",
  },
  {
    key: "processed_assets",
    label: "加工内容",
    check: (item) =>
      Boolean(item.brief_body_markdown) ||
      Boolean(item.brief_file_id?.id) ||
      Boolean(item.audio_file_id?.id) ||
      Boolean(item.audio_external_url) ||
      Boolean(item.slides_file_id?.id) ||
      Boolean(item.slides_external_url) ||
      Boolean(item.video_file_id?.id) ||
      Boolean(item.video_external_url),
    message: "请至少提供一种加工内容（摘要、音频、PPT 或视频）",
  },
];

export function collectValidationIssues(item) {
  return MINIMUM_VALIDATION_RULES.filter((rule) => !rule.check(item)).map((rule) => ({
    key: rule.key,
    label: rule.label,
    message: rule.message,
  }));
}

export function summarizeValidationIssues(issues) {
  return issues.map((issue) => issue.message).join("；");
}

export function validateItem(item) {
  return collectValidationIssues(item).map((issue) => issue.key);
}

export function buildGenerationPlan(item) {
  const packageSlug = buildPackageSlug(item);
  const packageWorkflowState = deriveWorkflowState(
    item.publish_mode,
    item.publish_start_at
  );
  const collectionLinks =
    item.collection_ids?.map((entry, index) => ({
      action: "create",
      collection: "package_collections",
      payload: {
        collection_id: entry.collection_id?.id ?? null,
        collection_slug: entry.collection_id?.slug ?? null,
        collection_name: entry.collection_id?.name ?? null,
        sort_order: index + 1,
      },
    })) ?? [];

  return {
    source: {
      action: "create",
      collection: "sources",
      payload: {
        title: item.source_title || item.title,
        source_type: item.source_type,
        platform: item.source_platform,
        source_url: item.source_url,
        author_name: item.source_author || null,
        language: item.source_language || "en",
        published_at: item.source_published_at || null,
        thumbnail_file_id: item.source_thumbnail_file_id?.id ?? null,
        source_summary: item.summary,
        status: "active",
      },
    },
    package: {
      action: "create",
      collection: "packages",
      payload: {
        slug: packageSlug,
        title: item.title,
        summary: item.summary,
        cover_file_id: item.cover_file_id?.id ?? null,
        primary_topic_id: item.primary_topic_id?.id ?? null,
        member_tier_id: item.member_tier_id?.id ?? null,
        package_type: item.package_type,
        publication_cycle: "special",
        difficulty: item.difficulty,
        use_case: item.use_case,
        signal_level: item.signal_level,
        workflow_state: packageWorkflowState,
        publish_start_at: item.publish_start_at || null,
        sort_date: item.publish_start_at || new Date().toISOString(),
        raw_source_visible: item.raw_source_visible,
        is_featured: false,
        seo_title: null,
        seo_description: null,
      },
    },
    package_source: {
      action: "create",
      collection: "package_sources",
      payload: {
        is_primary: true,
        sort_order: 1,
      },
    },
    package_topic: {
      action: "create",
      collection: "package_topics",
      payload: {
        topic_id: item.primary_topic_id?.id ?? null,
        topic_slug: item.primary_topic_id?.slug ?? null,
        topic_name: item.primary_topic_id?.name ?? null,
        sort_order: 1,
      },
    },
    package_collections: collectionLinks,
    processed_assets: buildAssetPlans(item),
    writeback: {
      success: {
        generated_package_id: "<created-package-id>",
        generated_at: "<now>",
        generation_status: "generated",
        generation_error: null,
      },
      failure: {
        generation_status: "failed",
        generation_error: "<error-message>",
      },
    },
  };
}

export async function fetchContentIntake(token, request, id) {
  const fields = [
    "id",
    "title",
    "summary",
    "primary_topic_id.id",
    "primary_topic_id.slug",
    "primary_topic_id.name",
    "member_tier_id.id",
    "member_tier_id.code",
    "member_tier_id.name",
    "collection_ids.collection_id.id",
    "collection_ids.collection_id.slug",
    "collection_ids.collection_id.name",
    "cover_file_id.id",
    "cover_file_id.filename_download",
    "source_type",
    "source_platform",
    "source_url",
    "source_title",
    "source_author",
    "source_language",
    "source_published_at",
    "source_thumbnail_file_id.id",
    "source_thumbnail_file_id.filename_download",
    "brief_title",
    "brief_body_markdown",
    "brief_file_id.id",
    "brief_file_id.filename_download",
    "audio_file_id.id",
    "audio_file_id.filename_download",
    "audio_external_url",
    "slides_file_id.id",
    "slides_file_id.filename_download",
    "slides_external_url",
    "video_file_id.id",
    "video_file_id.filename_download",
    "video_external_url",
    "publish_mode",
    "publish_start_at",
    "package_type",
    "difficulty",
    "use_case",
    "signal_level",
    "raw_source_visible",
    "generation_status",
    "generated_package_id.id",
    "generated_package_id.slug",
    "generated_package_id.title",
  ].join(",");

  const { payload } = await request(`/items/content_intake/${id}?fields=${fields}`, {
    token,
  });
  return payload.data;
}

export async function ensureReportFile(relativeReportPath, payload) {
  const reportPath = resolve(process.cwd(), relativeReportPath);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  return reportPath;
}

export async function writeGenerationSuccess(updateItem, token, itemId, packageId, generatedAt) {
  await updateItem(token, "content_intake", itemId, {
    generated_package_id: packageId,
    generated_at: generatedAt,
    generation_status: "generated",
    generation_error: null,
  });
}

export async function writeGenerationFailure(updateItem, token, itemId, message) {
  await updateItem(token, "content_intake", itemId, {
    generated_package_id: null,
    generated_at: null,
    generation_status: "failed",
    generation_error: message,
  });
}
