#!/usr/bin/env bash
# Calls the AI post generation cron endpoint. Reads CRON_SECRET from the
# project's .env so secrets are not duplicated in the crontab.
set -euo pipefail

PROJECT_ROOT="/home/innovats/mason"
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/ai-cron.log"
ENDPOINT="http://localhost:3000/api/cron/generate-posts"

mkdir -p "${LOG_DIR}"

CRON_SECRET=$(grep -E '^CRON_SECRET=' "${PROJECT_ROOT}/.env" | cut -d= -f2-)
if [[ -z "${CRON_SECRET}" ]]; then
  echo "[$(date -Iseconds)] missing CRON_SECRET" >> "${LOG_FILE}"
  exit 1
fi

{
  echo "[$(date -Iseconds)] starting"
  curl -sS --max-time 300 \
    -X POST \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    "${ENDPOINT}"
  echo
  echo "[$(date -Iseconds)] done"
} >> "${LOG_FILE}" 2>&1
