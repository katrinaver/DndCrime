#!/usr/bin/env bash
set -euo pipefail

prod_env="$HOME/DndCrime/backend/.env"
staging_env="$HOME/DndCrimeStaging/backend/.env"

read_dsn() { sed -n 's/^MYSQL_DSN=//p' "$1" | tail -n1 | tr -d '"'; }
split_dsn() {
  local dsn="$1" rest dbpart
  DB_USER=${dsn%%:*}; rest=${dsn#*:}; DB_PASS=${rest%%@tcp*}
  DB_HOSTPORT=${dsn#*@tcp(}; DB_HOSTPORT=${DB_HOSTPORT%%)*}
  dbpart=${dsn#*/}; DB_NAME=${dbpart%%\?*}
}

prod_dsn=$(read_dsn "$prod_env"); staging_dsn=$(read_dsn "$staging_env")
ca=$(sed -n 's/^MYSQL_CA_CERT=//p' "$prod_env" | tail -n1 | tr -d '"')
split_dsn "$prod_dsn"; pu=$DB_USER pp=$DB_PASS ph=${DB_HOSTPORT%:*} pport=${DB_HOSTPORT##*:} pdb=$DB_NAME
split_dsn "$staging_dsn"; su=$DB_USER sp=$DB_PASS sh=${DB_HOSTPORT%:*} sport=${DB_HOSTPORT##*:} sdb=$DB_NAME

pm2 stop dnd-crime-api-staging >/dev/null 2>&1 || true
trap 'pm2 restart dnd-crime-api-staging --update-env >/dev/null 2>&1 || true' ERR
MYSQL_PWD="$pp" mysqldump --single-transaction --set-gtid-purged=OFF --no-tablespaces --ssl-mode=VERIFY_CA --ssl-ca="$ca" -h "$ph" -P "$pport" -u "$pu" "$pdb" \
  | MYSQL_PWD="$sp" mysql --ssl-mode=VERIFY_CA --ssl-ca="$ca" -h "$sh" -P "$sport" -u "$su" "$sdb"

chmod +x "$HOME/DndCrimeStaging/backend/server"
pm2 restart dnd-crime-api-staging --update-env
trap - ERR
