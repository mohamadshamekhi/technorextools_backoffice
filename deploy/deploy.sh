#!/usr/bin/env bash
# Build + restart the backoffice container, then wait for it to become healthy.
# Usage: ./deploy/deploy.sh [--no-pull]
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
SERVICE="web"
HEALTH_URL="http://127.0.0.1:3001/api/health"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"
PULL=1
[[ "${1:-}" == "--no-pull" ]] && PULL=0

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[deploy] %s\033[0m\n' "$*" >&2; exit 1; }

command -v docker >/dev/null || die "docker not found"
docker compose version >/dev/null 2>&1 || die "docker compose plugin not found"
[[ -f "$ENV_FILE" ]] || die "$ENV_FILE missing — cp deploy/env.production.example .env.production"

# Fail fast on unset build-time vars instead of shipping a broken image.
for key in API_BASE_URL; do
  grep -Eq "^${key}=.+" "$ENV_FILE" || die "$key is empty in $ENV_FILE"
done

if [[ $PULL -eq 1 && -d .git ]]; then
  log "git pull --ff-only"
  git pull --ff-only
fi

log "building image"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build "$SERVICE"

log "starting container"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans "$SERVICE"

log "waiting for health (timeout ${HEALTH_TIMEOUT}s)"
deadline=$((SECONDS + HEALTH_TIMEOUT))
until curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; do
  if (( SECONDS >= deadline )); then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail 80 "$SERVICE" || true
    die "healthcheck failed after ${HEALTH_TIMEOUT}s"
  fi
  sleep 3
done

log "healthy: $(curl -fsS --max-time 5 "$HEALTH_URL")"
log "pruning dangling images"
docker image prune -f >/dev/null
log "done"
