CREATE UNIQUE INDEX IF NOT EXISTS uq_package_sources_pair
ON package_sources (package_id, source_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_package_topics_pair
ON package_topics (package_id, topic_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_package_collections_pair
ON package_collections (package_id, collection_id);

CREATE INDEX IF NOT EXISTS idx_packages_workflow_publish_start
ON packages (workflow_state, publish_start_at);

CREATE INDEX IF NOT EXISTS idx_packages_member_workflow_sort
ON packages (member_tier_id, workflow_state, sort_date DESC);

CREATE INDEX IF NOT EXISTS idx_processed_assets_package_sort
ON processed_assets (package_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_package_sources_package_sort
ON package_sources (package_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_package_topics_package_sort
ON package_topics (package_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_package_collections_collection_sort
ON package_collections (collection_id, sort_order);
