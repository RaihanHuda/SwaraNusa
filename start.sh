#!/bin/sh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  node scripts/build-pages.mjs
  exec node scripts/serve.mjs
fi
SWARANUSA_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ -x "$SWARANUSA_NODE" ]; then
  "$SWARANUSA_NODE" scripts/build-pages.mjs
  exec "$SWARANUSA_NODE" scripts/serve.mjs
fi
printf '%s\n' 'SwaraNusa memerlukan Node.js 24 atau lebih baru.'
exit 1
