#!/usr/bin/env bash
# True BYOD E2E: rails-web → client-server → enterprise. Headed browser, real DB URLs, new business.
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

if [[ -z "${LIVE_DB_ACCOUNTS_URL:-}" || -z "${LIVE_DB_USERS_URL:-}" || -z "${LIVE_DB_LEDGER_URL:-}" || -z "${LIVE_DB_AUDIT_URL:-}" ]]; then
  echo "Missing LIVE_DB_* URLs. Set USERS/ACCOUNTS/LEDGER/AUDIT_DATABASE_URL in $ENTERPRISE/.env" >&2
  exit 1
fi

export LIVE_SITE_URL="$SITE_URL"
export LIVE_MOCK_PASSWORD="${LIVE_MOCK_PASSWORD:-SecurePass123!}"
export LIVE_HEADED=1
export LIVE_SLOW_MO="${LIVE_SLOW_MO:-400}"

echo "=== Live BYOD journey (headed) ==="
echo "Gateway:  $GATEWAY_URL"
echo "BFF:      $BFF_URL"
echo "Site:     $SITE_URL"
echo "Bug log:  $WEB/e2e/artifacts/byod-journey-live-bugs.jsonl"
echo ""

echo "Waiting for gateway at $GATEWAY_URL/health ..."
wait_http "$GATEWAY_URL/health" "gateway" 180 || {
  echo "Start rails-enterprise first: cd $ENTERPRISE && make dev" >&2
  exit 1
}

STARTED_BFF=0
STARTED_WEB=0

if ! curl -sf "$BFF_URL/health" >/dev/null 2>&1; then
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
  STARTED_BFF=1
else
  echo "[client-server] already running: $BFF_URL"
fi

if ! curl -sf "$SITE_URL" >/dev/null 2>&1; then
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
  STARTED_WEB=1
else
  echo "[rails-web] already running: $SITE_URL"
  echo "WARNING: existing dev server may lack NEXT_PUBLIC_CLIENT_SERVER=$BFF_URL" >&2
fi

cleanup() {
  if (( STARTED_BFF )); then kill "${BFF_PID:-}" 2>/dev/null || true; fi
  if (( STARTED_WEB )); then kill "${WEB_PID:-}" 2>/dev/null || true; fi
}
trap cleanup EXIT

wait_http "$BFF_URL/health" "client-server" 90
wait_http "$SITE_URL" "rails-web" 120

mkdir -p "$WEB/recordings-output" "$WEB/e2e/artifacts"
cd "$WEB"

echo ""
echo "Opening headed browser — watch registration → connect → login → edit ..."
npx playwright test e2e/byod-full-journey.live.spec.ts \
  --config=playwright.live.config.ts \
  --workers=1 \
  --headed

echo ""
echo "Done. Videos: find $WEB/recordings-output -name 'video.webm'"
echo "Soft failures: $WEB/e2e/artifacts/byod-journey-live-bugs.jsonl"
