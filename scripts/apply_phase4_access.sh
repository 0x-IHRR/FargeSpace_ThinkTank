#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_FILE="$ROOT_DIR/directus/schema/phase4-access.sql"

docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T db sh -lc \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$SQL_FILE"

echo "Applied access control from $SQL_FILE"
