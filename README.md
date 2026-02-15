# TrendVault

Cross-platform trending video discovery, download & re-upload web app.

## Features

### Implemented

- **Authentication** — JWT-based auth with httpOnly cookies, register/login/logout
- **Trending Discovery** — Browse trending videos from YouTube & TikTok across 12 regions (US, GB, JP, KR, BR, IN, DE, FR, AU, CA, MX, VN). Platform adapter pattern with Redis caching and BullMQ background refresh.
- **Trending Dashboard** — Filter by platform/region/category, infinite scroll, auto-refresh toggle with configurable interval

### Planned

- **Video Downloads** — yt-dlp powered download queue with progress tracking (Phase 3)
- **Re-Upload** — OAuth-connected YouTube & TikTok upload with metadata editing (Phase 4)
- **Channel Analytics** — Multi-channel dashboard with stats sync and charts (Phase 5)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TailwindCSS 4, shadcn/ui, TanStack Query 5, Zustand 5 |
| Backend | Node.js 22, Express 5, Prisma 6, BullMQ 5, Socket.IO 4 |
| Storage | PostgreSQL 17, Redis 7, MinIO (S3-compatible) |
| Monorepo | Turborepo, pnpm workspaces |

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9.15
- **Docker** & Docker Compose

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and update these values:

```env
# Generate a strong JWT secret (min 32 chars)
JWT_SECRET=<your-secret>

# Generate encryption key: openssl rand -hex 32
ENCRYPTION_MASTER_KEY=<64-hex-chars>
```

### 3. Start infrastructure

```bash
pnpm docker:up
```

This starts PostgreSQL (port 5433), Redis (port 6379), and MinIO (ports 9000/9001).

### 4. Run database migration

```bash
pnpm db:migrate
```

### 5. (Optional) Seed test data

```bash
pnpm db:seed
```

Creates a test user: `test@trendvault.dev` / `password123`

### 6. Start development

```bash
pnpm dev
```

- **API**: http://localhost:3001
- **Web**: http://localhost:5173
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages |
| `pnpm type-check` | TypeScript type-check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run tests |
| `pnpm docker:up` | Start Docker services |
| `pnpm docker:down` | Stop Docker services |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Prisma Studio |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (sets httpOnly cookie) |
| POST | `/api/auth/logout` | Logout (clears cookie) |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/trending` | List trending videos (query: platform, region, category, page, limit) |
| GET | `/api/trending/regions` | Supported regions & YouTube categories |
| GET | `/api/trending/:id` | Single trending video details |

## Project Structure

```
TrendVault/
├── apps/
│   ├── api/                # Express 5 backend
│   │   └── src/modules/
│   │       ├── auth/       # JWT authentication
│   │       └── trending/   # Trending discovery + adapters + BullMQ jobs
│   └── web/                # React 19 frontend
│       └── src/pages/
│           └── trending/   # Trending dashboard + filters + infinite scroll
├── packages/
│   ├── shared-types/       # Zod schemas + TypeScript types
│   └── config/             # Shared tsconfig + ESLint
├── docker/                 # Docker Compose configs
├── docs/                   # Project documentation
└── plans/                  # Implementation plans
```

## Environment Variables

See `.env.example` for all available configuration. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `ENCRYPTION_MASTER_KEY` | Yes | AES-256 key for OAuth tokens (64 hex chars) |
| `YOUTUBE_API_KEY` | No | YouTube Data API v3 key (for trending) |
| `APIFY_API_TOKEN` | No | Apify token (for TikTok trending) |
