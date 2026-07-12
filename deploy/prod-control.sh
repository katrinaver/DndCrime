#!/usr/bin/env bash
set -euo pipefail

# Forced-команда для PROD_CONTROL_KEY. В отличие от staging здесь НЕТ refresh БД —
# prod и есть источник данных, только перезапускаем backend с новым бинарём.
if [[ "${SSH_ORIGINAL_COMMAND:-}" != "deploy" ]]; then
  echo "Only the deploy command is allowed" >&2
  exit 64
fi

chmod +x "$HOME/DndCrime/backend/server"
pm2 restart dnd-crime-api --update-env
