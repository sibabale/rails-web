# shellcheck shell=bash
# Shared live E2E database URL loader — source from scripts/run-live-*.sh
# Loads rails-enterprise/.env then .env.local; BYOD_* keys win over service URLs.

load_live_db_url_line() {
  local key="$1"
  local value="$2"
  local from_local="${3:-0}"

  case "$key" in
    BYOD_USERS_DATABASE_URL|USERS_DATABASE_URL) export LIVE_DB_USERS_URL="$value" ;;
    BYOD_ACCOUNTS_DATABASE_URL|ACCOUNTS_DATABASE_URL) export LIVE_DB_ACCOUNTS_URL="$value" ;;
    BYOD_LEDGER_DATABASE_URL|LEDGER_DATABASE_URL) export LIVE_DB_LEDGER_URL="$value" ;;
    BYOD_AUDIT_DATABASE_URL|AUDIT_DATABASE_URL) export LIVE_DB_AUDIT_URL="$value" ;;
  esac

  if [[ "$from_local" == "1" && "$key" == "BYOD_USERS_DATABASE_URL" && -n "${value// /}" ]]; then
    export LIVE_BYOD_USERS_CONFIGURED=1
  fi
}

load_live_db_urls_from_file() {
  local env_file="$1"
  local from_local="${2:-0}"
  [[ -f "$env_file" ]] || return 0

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    [[ -n "$line" ]] || continue
    [[ "$line" == *=* ]] || continue
    load_live_db_url_line "${line%%=*}" "${line#*=}" "$from_local"
  done < "$env_file"
}

load_live_db_urls() {
  local enterprise_dir="${1:?enterprise dir required}"
  load_live_db_urls_from_file "$enterprise_dir/.env" 0
  load_live_db_urls_from_file "$enterprise_dir/.env.local" 1
  if [[ "${LIVE_BYOD_USERS_CONFIGURED:-}" == "1" && -z "${LIVE_USERS_CONNECT_SOFT_FAIL+x}" ]]; then
    export LIVE_USERS_CONNECT_SOFT_FAIL=0
  fi
}
