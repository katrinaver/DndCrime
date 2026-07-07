# DndCrime

Portal for offline D&D parties.

## Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS 4, React Router 7 |
| Backend  | Go 1.22, Chi router                             |
| Storage  | MySQL 5.7+/8.0 compatible store                 |
| Files    | S3-compatible object storage                    |
| Auth     | Google OAuth ID token + backend-issued app JWT  |

## Prerequisites

| Tool   | Version      | Notes |
|--------|--------------|-------|
| Docker | 29.3.1       | For containerized run |
| Node   | v20.14.0     | Run `nvm use` from repo root |
| Yarn   | 1.22.22      | Frontend package manager |
| Go     | 1.22         | Install via go.dev or use Docker |
| MySQL  | 5.7+/8.0     | Required for persistent data |

Для frontend используем только Yarn v1: `yarn.lock` — единственный lockfile. `package-lock.json` намеренно не коммитится, чтобы разные версии `npm` не создавали лишние dependency diff.

## Быстрый старт без Google/MySQL

Для локальной разработки можно обойтись без внешних сервисов: фронт показывает баннер «Войти как Dev», бэкенд принимает токен `dev-stub-token` как пользователя `user-demo`. Если `MYSQL_DSN` не задан, используется in-memory store с seed-данными.

```bash
# Backend
cp backend/.env.development.example backend/.env
cd backend && go mod tidy && go run ./cmd/server

# Frontend (в другом терминале)
cd frontend && yarn install --ignore-engines && yarn dev
```

1. Откройте http://localhost:5173/login
2. Нажмите **Войти как dev@dndcrime.local** в dev-баннере
3. API доступен через Vite proxy на `/api` -> `localhost:8080`

## Google OAuth

1. В Google Cloud Console создайте OAuth 2.0 Client ID типа **Web application**.
2. Добавьте authorized JavaScript origins:
   - `http://localhost:5173`
   - production origin, например `https://dndcrime.example.com`
3. Укажите один и тот же client id:

```env
# backend/.env
GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
APP_JWT_SECRET=change-me-to-a-long-random-secret

# frontend/.env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

Фронт получает Google ID token, отправляет его в `POST /api/auth/google`, backend проверяет подпись через Google JWKS и выдаёт собственный app JWT для дальнейших `/api/*` запросов.

## MySQL

Backend включает MySQL store автоматически, если задан `MYSQL_DSN`.

```env
MYSQL_DSN=dnd-crime:password@tcp(rc1b-nivv22gmbg16e4hm.mdb.yandexcloud.net:3306)/dnd-crime?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci&loc=UTC&tls=true
MYSQL_CA_CERT=/path/to/yandex-ca.pem
```

При старте backend создаёт нужные таблицы через `CREATE TABLE IF NOT EXISTS`. Данные приложения больше не сбрасываются при рестарте, если используется MySQL.

## S3 uploads

Backend включает загрузку файлов, если заданы переменные S3-compatible storage:

```env
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_ENDPOINT=https://storage.yandexcloud.net
S3_BUCKET=dnd-crime
S3_PUBLIC_BASE_URL=https://storage.yandexcloud.net/dnd-crime
```

Фронт загружает аватары и вложения rich-text через `POST /api/uploads`. В ответ сохраняется публичный URL объекта; для отображения картинок bucket или нужный prefix должен быть доступен на чтение по этому URL.

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

API healthcheck: http://localhost:8080/api/health

### Docker demo stack

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:8080

The checked-in Docker stack uses dev-auth and in-memory data. For production, pass real backend env and frontend build args.

## Production checklist

1. Set backend env:

```env
DEV_AUTH_ENABLED=false
GOOGLE_CLIENT_ID=...
APP_JWT_SECRET=...
MYSQL_DSN=...
MYSQL_CA_CERT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_ENDPOINT=https://storage.yandexcloud.net
S3_BUCKET=dnd-crime
S3_PUBLIC_BASE_URL=https://storage.yandexcloud.net/dnd-crime
PORT=8080
ALLOWED_ORIGINS=https://your-domain.com
```

2. Build frontend with:

```env
VITE_GOOGLE_CLIENT_ID=...
VITE_DEV_AUTH_STUB=false
VITE_DEV_AUTH_ALLOW_BUILD=false
```

3. Put TLS/reverse proxy in front of frontend nginx.
4. Keep backend private inside the compose/network where possible; frontend nginx proxies `/api/` to backend.
5. Configure MySQL backups.

## Routes

| Path               | Page            | Access    |
|--------------------|-----------------|-----------|
| `/login`           | Google sign in  | Public    |
| `/register`        | Info redirect   | Public    |
| `/forgot-password` | Info redirect   | Public    |
| `/`                | Home            | Protected |

## Project structure

```text
DndCrime/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Go API, Google JWT verification, MySQL store
├── docker-compose.yml
└── README.md
```
