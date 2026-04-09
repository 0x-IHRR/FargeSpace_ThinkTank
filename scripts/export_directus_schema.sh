#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_DIR="$ROOT_DIR/directus/schema"

mkdir -p "$SCHEMA_DIR"

docker compose -f "$ROOT_DIR/docker-compose.yml" exec directus sh -lc \
  'npx directus schema snapshot --yes --format yaml /tmp/schema.yaml'

docker compose -f "$ROOT_DIR/docker-compose.yml" cp \
  directus:/tmp/schema.yaml \
  "$SCHEMA_DIR/schema.yaml"

echo "Exported schema to $SCHEMA_DIR/schema.yaml"
