#!/bin/sh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  exec node server.mjs
fi
BUNDLED_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ -x "$BUNDLED_NODE" ]; then
  exec "$BUNDLED_NODE" server.mjs
fi
printf '%s\n' 'SwaraNusa memerlukan Node.js 24 atau lebih baru. Instal dari https://nodejs.org, lalu jalankan node server.mjs.'
exit 1
