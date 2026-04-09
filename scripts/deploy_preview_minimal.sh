#!/bin/bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
DEPLOY_ENDPOINT="https://codex-deploy-skills.vercel.sh/api/deploy"

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

PROJECT_DIR="$TEMP_DIR/project"
ARCHIVE_PATH="$TEMP_DIR/frontend-preview.tgz"

mkdir -p "$PROJECT_DIR"

cp -R "$ROOT_DIR/app" "$PROJECT_DIR/"
cp -R "$ROOT_DIR/components" "$PROJECT_DIR/"
cp -R "$ROOT_DIR/lib" "$PROJECT_DIR/"
cp "$ROOT_DIR/package.json" "$PROJECT_DIR/"
cp "$ROOT_DIR/package-lock.json" "$PROJECT_DIR/"
cp "$ROOT_DIR/tsconfig.json" "$PROJECT_DIR/"
cp "$ROOT_DIR/next-env.d.ts" "$PROJECT_DIR/"
cp "$ROOT_DIR/next.config.mjs" "$PROJECT_DIR/"
cp "$ROOT_DIR/middleware.ts" "$PROJECT_DIR/"

tar -C "$PROJECT_DIR" -czf "$ARCHIVE_PATH" .

curl -sS -X POST "$DEPLOY_ENDPOINT" \
  -F "file=@$ARCHIVE_PATH" \
  -F "framework=nextjs"
