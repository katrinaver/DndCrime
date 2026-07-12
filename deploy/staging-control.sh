#!/usr/bin/env bash
set -euo pipefail

if [[ "${SSH_ORIGINAL_COMMAND:-}" != "deploy" ]]; then
  echo "Only the deploy command is allowed" >&2
  exit 64
fi

exec bash "$HOME/DndCrimeStaging/deploy/refresh-staging-db.sh"
