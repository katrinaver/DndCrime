#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -x "$ROOT/.go-toolchain/go/bin/go" ]]; then
  export PATH="$ROOT/.go-toolchain/go/bin:$PATH"
fi

if ! command -v go >/dev/null 2>&1; then
  echo "error: go not found. Install Go or use the bundled toolchain in .go-toolchain/" >&2
  exit 1
fi

if ! command -v yarn >/dev/null 2>&1; then
  echo "error: yarn not found. Install Yarn 1.x (see README.md)." >&2
  exit 1
fi

if [[ ! -f "$ROOT/backend/.env" ]]; then
  cp "$ROOT/backend/.env.development.example" "$ROOT/backend/.env"
  echo "Created backend/.env from .env.development.example"
fi

if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "$ROOT/frontend" && yarn install --ignore-engines)
fi

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  local pid
  for pid in "$FRONTEND_PID" "$BACKEND_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done
}

trap cleanup EXIT INT TERM

echo "Starting backend on :8080..."
(
  cd "$ROOT/backend"
  go mod tidy
  CGO_ENABLED=0 go build -o /tmp/dndcrime-server ./cmd/server
  exec /tmp/dndcrime-server
) &
BACKEND_PID=$!

echo "Starting frontend on :5173..."
(
  cd "$ROOT/frontend"
  exec yarn dev
) &
FRONTEND_PID=$!

cat <<EOF

DndCrime is running:
  Frontend  http://localhost:5173/login
  Backend   http://localhost:8080/api/health

Dev auth: open the login page and use the yellow "Войти как Dev" banner.

Press Ctrl+C to stop both servers.

EOF

wait "$BACKEND_PID" "$FRONTEND_PID"
