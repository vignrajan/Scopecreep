#!/bin/bash
# Installs dependencies so Claude Code on the web can run the linter and build.
set -euo pipefail

# Only run in the remote (web) environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Idempotent; npm install (not ci) so the cached container state is reused.
npm install --no-audit --no-fund
