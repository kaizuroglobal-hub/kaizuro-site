#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

CONTENT_FILES=(site hero story assault principles engineering founder halo footer)
REQUIRED_FILES=(.pages.yml index.html script.js content-loader.js CMS-SETUP.md)
FAILURES=0
PIDS=()
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

log() {
  printf '%s\n' "$*"
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  return 1
}

validate_json() {
  local name="$1"
  local file="content/${name}.json"
  local result="$TMP_DIR/${name}.result"

  {
    [[ -f "$file" ]] || fail "Missing $file"

    if command -v python3 >/dev/null 2>&1; then
      python3 - "$file" <<'PY'
import json
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
with path.open("r", encoding="utf-8") as handle:
    data = json.load(handle)
if not isinstance(data, dict):
    raise SystemExit(f"{path}: top-level JSON value must be an object")
print(f"OK: {path}")
PY
    elif command -v node >/dev/null 2>&1; then
      node -e 'const fs=require("fs"); const p=process.argv[1]; const value=JSON.parse(fs.readFileSync(p,"utf8")); if(!value || Array.isArray(value) || typeof value!=="object") throw new Error("top-level JSON value must be an object"); console.log("OK: "+p);' "$file"
    else
      fail "python3 or node is required to validate JSON"
    fi
  } >"$result" 2>&1
}

log "Checking required CMS files..."
for file in "${REQUIRED_FILES[@]}"; do
  [[ -f "$file" ]] || { log "ERROR: Missing $file"; FAILURES=$((FAILURES + 1)); }
done

log "Validating JSON files in parallel..."
for name in "${CONTENT_FILES[@]}"; do
  validate_json "$name" &
  PIDS+=("$!")
done

for i in "${!PIDS[@]}"; do
  if ! wait "${PIDS[$i]}"; then
    FAILURES=$((FAILURES + 1))
  fi
done

for name in "${CONTENT_FILES[@]}"; do
  cat "$TMP_DIR/${name}.result"
done

log "Checking .pages.yml content mappings..."
for name in "${CONTENT_FILES[@]}"; do
  if ! grep -Fq "path: content/${name}.json" .pages.yml; then
    log "ERROR: .pages.yml does not map content/${name}.json"
    FAILURES=$((FAILURES + 1))
  fi
done

log "Checking loader source registration..."
for name in "${CONTENT_FILES[@]}"; do
  if ! grep -Eq "^[[:space:]]*${name}:" content-loader.js; then
    log "ERROR: content-loader.js does not register source '${name}'"
    FAILURES=$((FAILURES + 1))
  fi
done

log "Checking CMS bootstrap and chapter fallback..."
if ! grep -Fq 'loader.src = "content-loader.js"' script.js; then
  log "ERROR: script.js does not bootstrap content-loader.js"
  FAILURES=$((FAILURES + 1))
fi
if ! grep -Fq 'window.kzChapterData' script.js; then
  log "ERROR: script.js does not use window.kzChapterData"
  FAILURES=$((FAILURES + 1))
fi

if command -v node >/dev/null 2>&1; then
  log "Checking JavaScript syntax in parallel..."
  node --check script.js >"$TMP_DIR/script-js.result" 2>&1 & JS_PID_1=$!
  node --check content-loader.js >"$TMP_DIR/content-loader.result" 2>&1 & JS_PID_2=$!
  if ! wait "$JS_PID_1"; then FAILURES=$((FAILURES + 1)); fi
  if ! wait "$JS_PID_2"; then FAILURES=$((FAILURES + 1)); fi
  cat "$TMP_DIR/script-js.result"
  cat "$TMP_DIR/content-loader.result"
else
  log "NOTICE: node is unavailable; JavaScript syntax checks skipped."
fi

if (( FAILURES > 0 )); then
  log "Validation failed with ${FAILURES} error(s)."
  exit 1
fi

log "Validation passed: Pages CMS content layer is structurally complete."
