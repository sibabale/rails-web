#!/usr/bin/env bash
# Start rails-web + rails-client-server, wait for rails-enterprise gateway, record live BYOD flows.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
ENTERPRISE="$REPO_ROOT/rails-enterprise"
CLIENT="$REPO_ROOT/rails-client-server"
WEB="$ROOT"

GATEWAY_URL="${GATEWAY_URL:-http://127.0.0.1:8080}"
BFF_URL="${BFF_URL:-http://127.0.0.1:3100}"
SITE_URL="${SITE_URL:-http://127.0.0.1:3000}"

# shellcheck source=lib/load-live-db-urls.sh
source "$ROOT/scripts/lib/load-live-db-urls.sh"

load_env_urls() {
  load_live_db_urls "$ENTERPRISE"
}

wait_http() {
  local url="$1"
  local label="$2"
  local max="${3:-120}"
  local i=0
  while (( i < max )); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "[$label] ready: $url"
      return 0
    fi
    sleep 2
    ((i++)) || true
  done
  echo "[$label] not ready after ${max} attempts: $url" >&2
  return 1
}

load_env_urls
export LIVE_SITE_URL="$SITE_URL"
export LIVE_MOCK_EMAIL="${LIVE_MOCK_EMAIL:-recordings.mock@rails.local}"
export LIVE_MOCK_PASSWORD="${LIVE_MOCK_PASSWORD:-SecurePass123!}"

echo "Waiting for gateway at $GATEWAY_URL/health ..."
wait_http "$GATEWAY_URL/health" "gateway" 180 || {
  echo "Start rails-enterprise first: cd $ENTERPRISE && make dev" >&2
  exit 1
}

echo "Starting rails-client-server on $BFF_URL ..."
(
  cd "$CLIENT"
  export PORT=3100
  export USERS_SERVICE_BASE_URL="${GATEWAY_URL%/}/users"
  export ACCOUNTS_SERVICE_BASE_URL="${GATEWAY_URL%/}/accounts"
  export LEDGER_SERVICE_BASE_URL="${GATEWAY_URL%/}/ledger"
  export AUDIT_SERVICE_BASE_URL="${GATEWAY_URL%/}/audit"
  export CORS_ALLOWED_ORIGINS="$SITE_URL,http://127.0.0.1:3000"
  npm run dev
) &
BFF_PID=$!

echo "Starting rails-web on $SITE_URL ..."
(
  cd "$WEB"
  export PORT=3000
  export NEXT_PUBLIC_CLIENT_SERVER="$BFF_URL"
  export NEXT_PUBLIC_SITE_URL="$SITE_URL"
  export NEXT_PUBLIC_ENABLE_AUTH_VIEWS=true
  export NEXT_PUBLIC_SHOW_AUTH_BUTTONS=true
  export NEXT_PUBLIC_ENABLE_ANALYTICS=false
  npm run dev
) &
WEB_PID=$!

cleanup() {
  kill "$BFF_PID" "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT

wait_http "$BFF_URL/health" "client-server" 90
wait_http "$SITE_URL" "rails-web" 120

mkdir -p "$WEB/recordings-output"
cd "$WEB"
npx playwright test e2e/live-database-flows.spec.ts --config=playwright.live.config.ts --workers=1

echo ""
echo "Videos:"
find recordings-output -name 'video.webm' 2>/dev/null || find test-results -name 'video.webm' 2>/dev/null
