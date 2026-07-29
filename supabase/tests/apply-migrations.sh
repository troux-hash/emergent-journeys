#!/bin/bash
set -u
P="$1"; U="$2"; MIG="$3"
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP=$(mktemp -d); fail=0
for f in $(ls "$MIG"/*.sql | sort); do
  b=$(basename "$f")
  python3 "$HERE/preprocess.py" "$f" "$TMP/$b"
  out=$("$P" "$U" -q -v ON_ERROR_STOP=1 -f "$TMP/$b" 2>&1 | grep -iE "ERROR" | head -1)
  [ -n "$out" ] && { echo "FAIL $b :: ${out##*ERROR:}"; fail=$((fail+1)); }
done
echo "migrations_with_errors=$fail"
