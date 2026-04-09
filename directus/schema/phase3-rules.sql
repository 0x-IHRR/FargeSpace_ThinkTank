CREATE UNIQUE INDEX IF NOT EXISTS uq_package_sources_primary
ON package_sources (package_id)
WHERE is_primary = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_processed_assets_primary
ON processed_assets (package_id)
WHERE is_primary = true;

CREATE OR REPLACE FUNCTION phase3_validate_processed_asset_payload()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  trimmed_body text;
  trimmed_url text;
BEGIN
  trimmed_body := NULLIF(BTRIM(COALESCE(NEW.body_markdown, '')), '');
  trimmed_url := NULLIF(BTRIM(COALESCE(NEW.external_url, '')), '');

  IF NEW.asset_type = 'brief' AND trimmed_body IS NULL AND NEW.file_id IS NULL THEN
    RAISE EXCEPTION 'brief 类型必须至少提供正文或文件'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.asset_type IN ('audio', 'slides', 'video')
     AND NEW.file_id IS NULL
     AND trimmed_url IS NULL THEN
    RAISE EXCEPTION '% 类型必须至少提供文件或外部链接', NEW.asset_type
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION phase3_validate_package_dependencies(
  p_package_id uuid,
  p_primary_topic_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  source_count integer;
  primary_source_count integer;
  active_asset_count integer;
  brief_count integer;
BEGIN
  SELECT COUNT(*)
  INTO source_count
  FROM package_sources
  WHERE package_id = p_package_id;

  IF source_count = 0 THEN
    RAISE EXCEPTION '内容包发布前必须至少关联 1 个来源'
      USING ERRCODE = '23514';
  END IF;

  SELECT COUNT(*)
  INTO primary_source_count
  FROM package_sources
  WHERE package_id = p_package_id
    AND is_primary = true;

  IF primary_source_count = 0 THEN
    RAISE EXCEPTION '内容包发布前必须指定 1 个主来源'
      USING ERRCODE = '23514';
  END IF;

  SELECT COUNT(*)
  INTO active_asset_count
  FROM processed_assets
  WHERE package_id = p_package_id
    AND status = 'active';

  IF active_asset_count = 0 THEN
    RAISE EXCEPTION '内容包发布前必须至少保留 1 个有效加工内容'
      USING ERRCODE = '23514';
  END IF;

  SELECT COUNT(*)
  INTO brief_count
  FROM processed_assets
  WHERE package_id = p_package_id
    AND status = 'active'
    AND asset_type = 'brief'
    AND (
      NULLIF(BTRIM(COALESCE(body_markdown, '')), '') IS NOT NULL
      OR file_id IS NOT NULL
    );

  IF brief_count = 0 THEN
    RAISE EXCEPTION '内容包发布前必须至少保留 1 个有效 brief'
      USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM package_topics
    WHERE package_id = p_package_id
      AND topic_id = p_primary_topic_id
  ) THEN
    RAISE EXCEPTION 'primary_topic_id 必须同时存在于 package_topics'
      USING ERRCODE = '23514';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION phase3_validate_package_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.workflow_state IN ('scheduled', 'published') THEN
    IF NEW.publish_start_at IS NULL THEN
      RAISE EXCEPTION 'scheduled 或 published 状态必须填写 publish_start_at'
        USING ERRCODE = '23514';
    END IF;

    IF NEW.primary_topic_id IS NULL THEN
      RAISE EXCEPTION 'scheduled 或 published 状态必须填写 primary_topic_id'
        USING ERRCODE = '23514';
    END IF;

    PERFORM phase3_validate_package_dependencies(NEW.id, NEW.primary_topic_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION phase3_revalidate_package(package_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  package_row packages%ROWTYPE;
BEGIN
  SELECT *
  INTO package_row
  FROM packages
  WHERE id = package_uuid;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF package_row.workflow_state NOT IN ('scheduled', 'published') THEN
    RETURN;
  END IF;

  IF package_row.publish_start_at IS NULL THEN
    RAISE EXCEPTION 'scheduled 或 published 状态必须填写 publish_start_at'
      USING ERRCODE = '23514';
  END IF;

  PERFORM phase3_validate_package_dependencies(
    package_row.id,
    package_row.primary_topic_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION phase3_revalidate_package_from_children()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  affected_package uuid;
BEGIN
  affected_package := COALESCE(NEW.package_id, OLD.package_id);

  IF affected_package IS NOT NULL THEN
    PERFORM phase3_revalidate_package(affected_package);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_phase3_validate_package_state ON packages;
CREATE TRIGGER trg_phase3_validate_package_state
BEFORE INSERT OR UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION phase3_validate_package_state();

DROP TRIGGER IF EXISTS trg_phase3_validate_processed_asset_payload ON processed_assets;
CREATE TRIGGER trg_phase3_validate_processed_asset_payload
BEFORE INSERT OR UPDATE ON processed_assets
FOR EACH ROW
EXECUTE FUNCTION phase3_validate_processed_asset_payload();

DROP TRIGGER IF EXISTS trg_phase3_revalidate_package_sources ON package_sources;
CREATE TRIGGER trg_phase3_revalidate_package_sources
AFTER INSERT OR UPDATE OR DELETE ON package_sources
FOR EACH ROW
EXECUTE FUNCTION phase3_revalidate_package_from_children();

DROP TRIGGER IF EXISTS trg_phase3_revalidate_package_topics ON package_topics;
CREATE TRIGGER trg_phase3_revalidate_package_topics
AFTER INSERT OR UPDATE OR DELETE ON package_topics
FOR EACH ROW
EXECUTE FUNCTION phase3_revalidate_package_from_children();

DROP TRIGGER IF EXISTS trg_phase3_revalidate_processed_assets ON processed_assets;
CREATE TRIGGER trg_phase3_revalidate_processed_assets
AFTER INSERT OR UPDATE OR DELETE ON processed_assets
FOR EACH ROW
EXECUTE FUNCTION phase3_revalidate_package_from_children();
