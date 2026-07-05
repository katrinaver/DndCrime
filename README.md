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

## Auth setup (Supabase)

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
