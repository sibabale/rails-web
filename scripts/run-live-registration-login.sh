#!/usr/bin/env bash
# Live registration → connect → apply → login restore (headed, real stack).
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

load_live_db_urls "$ENTERPRISE"

if [[ -z "${LIVE_DB_ACCOUNTS_URL:-}" || -z "${LIVE_DB_USERS_URL:-}" || -z "${LIVE_DB_LEDGER_URL:-}" || -z "${LIVE_DB_AUDIT_URL:-}" ]]; then
  echo "Missing LIVE_DB_* URLs in $ENTERPRISE/.env or .env.local" >&2
  exit 1
fi

export LIVE_SITE_URL="$SITE_URL"
export LIVE_BFF_URL="$BFF_URL"
if [[ -z "${LIVE_MOCK_PASSWORD:-}" ]]; then
  echo "Set LIVE_MOCK_PASSWORD for live e2e." >&2
  exit 1
fi
export LIVE_MOCK_PASSWORD
export LIVE_HEADED=1
export LIVE_SLOW_MO="${LIVE_SLOW_MO:-400}"

BUG_LOG="$WEB/e2e/artifacts/byod-registration-login-live-bugs.jsonl"

echo "=== Live registration + login restore (RAI-51/55) ==="
echo "Bug log:  $BUG_LOG"
echo "Rebuild users-service if you changed rails-enterprise:"
echo "  cd $ENTERPRISE/services/users-service && cargo build -p users_service"
echo ""

wait_http "$GATEWAY_URL/health" "gateway" 180 || {
  echo "Start rails-enterprise: cd $ENTERPRISE && make dev" >&2
  exit 1
}

STARTED_BFF=0
STARTED_WEB=0

if ! curl -sf "$BFF_URL/health" >/dev/null 2>&1; then
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
fi

if ! curl -sf "$SITE_URL" >/dev/null 2>&1; then
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

echo "Opening headed browser — register → connect → apply → login ..."
npx playwright test e2e/byod-registration-login.live.spec.ts \
  --config=playwright.live.config.ts \
  --workers=1 \
  --headed

echo ""
echo "Videos: find $WEB/recordings-output -name 'video.webm'"
echo "Bugs:   $BUG_LOG"
if [[ -s "$BUG_LOG" ]]; then
  echo "--- bug log preview ---"
  tail -20 "$BUG_LOG"
fi
