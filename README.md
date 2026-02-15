# TrendVault

Cross-platform trending video discovery, download & re-upload web app.

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

## Project Structure

```
TrendVault/
├── apps/
│   ├── api/          # Express 5 backend
│   └── web/          # React 19 frontend
├── packages/
│   ├── shared-types/ # Zod schemas + TypeScript types
│   └── config/       # Shared tsconfig + ESLint
├── docker/           # Docker Compose configs
└── plans/            # Implementation plans
```
