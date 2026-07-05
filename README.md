# DndCrime

Portal for offline D&D parties.

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS 4, React Router 7 |
| Backend  | Go 1.22, Chi router                 |
| Auth     | [Supabase Auth](https://supabase.com) (free tier, JWT) |

## Prerequisites

| Tool   | Version (global) | Notes |
|--------|------------------|-------|
| Docker | 29.3.1           | For containerized run |
| Node   | v20.14.0         | Use `yarn --ignore-engines` (some deps want ≥20.19) |
| Yarn   | 1.22.22          | Package manager |
| Go     | not installed    | Install via [go.dev](https://go.dev/dl/) or use Docker |

## Быстрый старт без Supabase (dev-auth)

Для локальной разработки можно обойтись без Supabase: фронт показывает баннер «Войти как Dev», бэкенд принимает токен `dev-stub-token` как пользователя `user-demo` (in-memory store с seed-данными).

```bash
# Backend
cp backend/.env.development.example backend/.env
cd backend && go mod tidy && go run ./cmd/server

# Frontend (в другом терминале)
cd frontend && yarn install --ignore-engines && yarn dev
```

1. Откройте http://localhost:5173/login
2. Нажмите **Войти как dev@dndcrime.local** в жёлтом баннере
3. API доступен через Vite proxy на `/api` → `localhost:8080`

Фронт подхватывает `frontend/.env.development` автоматически при `yarn dev`. Для Docker test stack уже настроены `backend/.env.test` и `docker-compose.yml`.

## Auth setup (Supabase, production)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET` (backend)
3. In **Authentication → Providers**, enable Email.
4. Copy env files and fill in values:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Установите `DEV_AUTH_ENABLED=false` и `VITE_DEV_AUTH_STUB=false` для prod-подобного режима.

## Local development

### Frontend

```bash
cd frontend
yarn install --ignore-engines
yarn dev
```

Open http://localhost:5173

### Backend

```bash
cd backend
go mod tidy
go run ./cmd/server
```

API: http://localhost:8080/api/health

### Docker (full stack)

```bash
# Ensure backend/.env and frontend/.env are configured
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:8080

## Routes

| Path               | Page            | Access    |
|--------------------|-----------------|-----------|
| `/login`           | Sign in         | Public    |
| `/register`        | Create account  | Public    |
| `/forgot-password` | Reset password  | Public    |
| `/`                | Home            | Protected |

## Project structure

```
DndCrime/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Go API (JWT verification)
├── docker-compose.yml
└── README.md
```
