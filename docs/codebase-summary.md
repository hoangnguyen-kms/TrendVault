# TrendVault Codebase Summary

**Version:** 1.2.0 (Phase 4 Complete)
**Generated:** 2026-02-15
**Monorepo Structure:** Turborepo + pnpm workspaces

## Project Structure

```
TrendVault/
├── apps/
│   ├── api/                 # Express 5 backend
│   │   ├── src/
│   │   │   ├── config/              # Configuration modules
│   │   │   │   ├── socket-io.ts       # Socket.IO setup + JWT auth (Phase 3)
│   │   │   │   ├── ... (other configs)
│   │   │   ├── lib/                 # Shared utilities
│   │   │   ├── middleware/          # Express middleware
│   │   │   │   ├── rate-limiter.ts  # Updated with downloadLimiter (Phase 3)
│   │   │   │   ├── ... (other middleware)
│   │   │   ├── services/            # Shared services (Phase 3-4)
│   │   │   │   ├── storage/
│   │   │   │   │   ├── storage-service.interface.ts
│   │   │   │   │   ├── minio-storage-service.ts
│   │   │   │   │   └── storage-factory.ts
│   │   │   │   └── encryption/
│   │   │   │       └── encryption-service.ts  # AES-256-GCM (Phase 4)
│   │   │   ├── modules/             # Feature modules
│   │   │   │   ├── auth/            # Authentication (Phase 1)
│   │   │   │   ├── trending/        # Trending discovery (Phase 2)
│   │   │   │   ├── downloads/       # Download engine (Phase 3)
│   │   │   │   ├── oauth/           # OAuth 2.0 flows (Phase 4)
│   │   │   │   ├── uploads/         # Upload & publishing (Phase 4)
│   │   │   │   ├── accounts/        # Connected accounts (Phase 4)
│   │   │   │   └── channels/        # User channels (Phase 4)
│   │   │   ├── app.ts               # Express app
│   │   │   └── server.ts            # Server startup
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database schema
│   │   │   ├── seed.ts              # Test data seeding
│   │   │   └── migrations/          # Database migrations
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   └── web/                 # React 19 frontend
│       ├── src/
│       │   ├── pages/               # Page components
│       │   │   ├── auth/            # Login, Register (Phase 1)
│       │   │   ├── trending/        # Trending discovery (Phase 2)
│       │   │   └── downloads/       # Download interface (Phase 3)
│       │   ├── components/          # Reusable components
│       │   ├── hooks/               # Custom hooks
│       │   ├── stores/              # Zustand stores
│       │   ├── lib/
│       │   │   ├── socket-client.ts # Socket.IO client (Phase 3)
│       │   │   ├── ... (other libs)
│       │   ├── app.tsx              # Root component
│       │   ├── router.tsx           # React Router 7 config
│       │   └── main.tsx             # Entry point
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig files
├── packages/                # Shared packages
│   ├── shared-types/        # Zod schemas + TS types
│   │   └── src/
│   │       ├── auth.ts
│   │       ├── trending.ts
│   │       └── platform.ts
│   └── config/              # Shared configs
│       ├── tsconfig/        # TypeScript presets
│       └── eslint/          # ESLint configs
├── docker/                  # Docker Compose setup
│   └── docker-compose.yml
├── plans/                   # Implementation plans
│   └── 260214-2218-trendvault-implementation/
│       ├── phase-01-foundation-and-scaffolding.md
│       ├── phase-02-trending-video-discovery.md
│       └── ... (phases 3-6)
├── docs/                    # Project documentation
│   ├── project-overview-pdr.md
│   ├── system-architecture.md
│   ├── codebase-summary.md (this file)
│   ├── code-standards.md
│   └── development-roadmap.md
├── README.md                # Getting started guide
├── CLAUDE.md                # Claude Code instructions
├── package.json             # Monorepo root config
├── pnpm-workspace.yaml      # pnpm workspace config
├── turbo.json               # Turborepo config
└── .env.example             # Environment template
```

## Backend (`apps/api/`)

### Configuration Layer (`src/config/`)

| File | Purpose |
|------|---------|
| `environment.ts` | Validates & exports environment variables |
| `database.ts` | Prisma client instance |
| `redis.ts` | Redis client instance |
| `cors.ts` | CORS policy configuration |
| `socket-io.ts` | Socket.IO server setup with JWT auth middleware (Phase 3) |

### Storage Services (`src/services/storage/`)

**Phase 3 Complete**

| File | Purpose |
|------|---------|
| `storage-service.interface.ts` | Abstraction for storage operations |
| `minio-storage-service.ts` | MinIO implementation (S3-compatible) |
| `storage-factory.ts` | Factory pattern for service instantiation |

### Library Layer (`src/lib/`)

| File | Purpose |
|------|---------|
| `prisma-client.ts` | Prisma singleton |
| `redis-client.ts` | Redis singleton |
| `api-response.ts` | Standard response wrapper |

### Middleware (`src/middleware/`)

| File | Purpose |
|------|---------|
| `auth-middleware.ts` | JWT validation & user extraction |
| `error-handler.ts` | Centralized error handling |
| `rate-limiter.ts` | Express rate limiting + downloadLimiter (Phase 3) + uploadLimiter (Phase 4) |
| `request-logger.ts` | Request/response logging (Morgan) |
| `validate-request.ts` | Zod schema validation wrapper |

### Auth Module (`src/modules/auth/`)

**Phase 1 Complete**

| File | Purpose | Key Exports |
|------|---------|-------------|
| `auth-schemas.ts` | Zod validation schemas | `RegisterSchema`, `LoginSchema` |
| `auth-service.ts` | Business logic | `AuthService` class methods |
| `auth-controller.ts` | HTTP handlers | `register()`, `login()`, `refresh()`, `logout()` |
| `auth-router.ts` | Route definitions | Router with `/register`, `/login`, etc. |

**Key Methods:**
- `register(email, password, name)` - Create user with hashed password
- `login(email, password)` - Validate + issue JWT tokens
- `refresh(refreshToken)` - Extend session
- `logout()` - Invalidate token (client-side only)

### Download Module (`src/modules/downloads/`)

**Phase 3 Complete**

```
downloads/
├── download-service.ts          # Download orchestration
├── download-controller.ts       # HTTP handlers
├── download-router.ts           # Route definitions
├── download-schemas.ts          # Zod validation schemas
├── download-helpers.ts          # Utility functions
├── ytdlp-service.ts             # yt-dlp-wrap integration
└── jobs/
    ├── download-queue.ts        # BullMQ queue setup
    └── download-worker.ts       # BullMQ job processor
```

**Key Responsibilities:**
- Extract video formats/qualities via yt-dlp
- Manage download queue with BullMQ
- Emit real-time progress via Socket.IO
- Store files in MinIO
- Track download status in PostgreSQL

**Key Methods:**
- `initiateDownload(videoUrl, format)` - Queue download job
- `getFormats(videoUrl)` - Fetch available formats
- `getDownloadProgress(downloadId)` - Query job status
- `cancelDownload(downloadId)` - Abort job

### Trending Module (`src/modules/trending/`)

**Phase 2 Complete**

```
trending/
├── adapters/
│   ├── platform-adapter.interface.ts  # Strategy pattern interface
│   ├── youtube-adapter.ts             # YouTube Data API v3 integration
│   └── tiktok-adapter.ts              # TikTok Research API + Apify fallback
├── jobs/
│   ├── trending-refresh-job.ts        # BullMQ job definition
│   └── trending-refresh-worker.ts     # BullMQ job processor
├── trending-cache.ts                  # Redis cache abstraction
├── trending-controller.ts             # HTTP handlers
├── trending-router.ts                 # Route definitions
├── trending-service.ts                # Core business logic
├── trending-service-instance.ts       # Service instantiation
└── trending-schemas.ts                # Zod validation schemas
```

**Platform Adapter Pattern:**

```typescript
interface IPlatformAdapter {
  fetchTrending(
    region: string,
    category?: string
  ): Promise<TrendingVideoDTO[]>
}

class YouTubeAdapter implements IPlatformAdapter {
  // Uses google-auth-library + axios for YouTube Data API v3
}

class TikTokAdapter implements IPlatformAdapter {
  // Uses axios for Apify (primary) + Research API (optional)
}
```

**Trending Service Flow:**

```typescript
class TrendingService {
  async fetchTrending(platform, region, category, page) {
    // 1. Check Redis cache
    // 2. If miss: call adapter
    // 3. Normalize response
    // 4. Upsert to PostgreSQL
    // 5. Cache in Redis
    // 6. Return paginated response
  }

  async upsertTrendingVideos(videos, region) {
    // Dedup on platform + platformVideoId + region
    // Insert or update in TrendingVideo table
  }
}
```

**Key Files:**
- `trending-schemas.ts` - Zod schemas for request/response validation
- `trending-cache.ts` - Redis get/set/del + quota tracking
- `trending-service.ts` - Main orchestrator (~1700 LOC)
- `youtube-adapter.ts` - YouTube API integration (~1600 LOC)
- `tiktok-adapter.ts` - TikTok + Apify integration
- `trending-refresh-job.ts` - BullMQ repeatable job (every 30min)

### OAuth Module (`src/modules/oauth/`)

**Phase 4 Complete**

| File | Purpose |
|------|---------|
| `oauth-service.ts` | OAuth 2.0 flow orchestration (Google + TikTok) |
| `oauth-router.ts` | OAuth callback routes (/callback/{provider}) |

**Features:**
- Google OAuth 2.0 (youtube.upload scope)
- TikTok OAuth 2.0 (video.publish scope)
- CSRF protection via Redis state storage
- Token blob encryption (AES-256-GCM)
- Automatic token refresh on expiry

### Upload Module (`src/modules/uploads/`)

**Phase 4 Complete**

```
uploads/
├── upload-service.ts            # Upload orchestration
├── upload-controller.ts         # HTTP handlers
├── upload-router.ts             # Route definitions
├── upload-schemas.ts            # Zod validation schemas
├── uploaders/
│   ├── platform-uploader-interface.ts  # Strategy pattern
│   ├── youtube-uploader.ts             # YouTube API integration
│   └── tiktok-uploader.ts              # TikTok Inbox Upload
└── jobs/
    ├── upload-queue.ts          # BullMQ queue setup
    └── upload-worker.ts         # BullMQ job processor
```

**Key Methods:**
- `initiateUpload(downloadedVideoId, channelId, metadata)` - Queue upload job
- `getUploadStatus(uploadId)` - Query job status
- `cancelUpload(uploadId)` - Abort job

### Accounts Module (`src/modules/accounts/`)

**Phase 4 Complete**

| File | Purpose |
|------|---------|
| `accounts-router.ts` | Connected accounts API routes |

**Endpoints:**
- GET `/api/accounts` - List connected accounts per user
- POST `/api/accounts/{accountId}/refresh` - Force token refresh
- DELETE `/api/accounts/{accountId}` - Disconnect account

### Channels Module (`src/modules/channels/`)

**Phase 4 Complete**

| File | Purpose |
|------|---------|
| `channels-router.ts` | User channels API routes |

**Endpoints:**
- GET `/api/channels` - List channels per user
- GET `/api/channels/{channelId}` - Get channel details

### Encryption Service (`src/services/encryption/`)

**Phase 4 Complete**

| File | Purpose |
|------|---------|
| `encryption-service.ts` | AES-256-GCM token blob encryption |

**Usage:**
- Encrypts OAuth access/refresh tokens as single JSON blob before DB storage
- Async PBKDF2 key derivation per user (cached 5min)
- Decrypts on retrieval for API calls
- Master key: Environment variable (HSM in production)

### Root Entry Points

| File | Purpose |
|------|---------|
| `app.ts` | Express app initialization (middleware, routes) |
| `server.ts` | HTTP server startup, listener initialization |

### Database (`prisma/`)

| File | Purpose |
|------|---------|
| `schema.prisma` | Prisma data model (User, ConnectedAccount, TrendingVideo) |
| `seed.ts` | Test data seeding script |
| `migrations/` | Database migration history |

**Current Schema (Phase 4):**
```prisma
model User { ... }                    # Phase 1
model ConnectedAccount { ... }        # Phase 1 (updated Phase 4: encrypted tokens)
enum Platform { YOUTUBE, TIKTOK }    # Phase 2
model TrendingVideo { ... }          # Phase 2
enum DownloadStatus { ... }           # Phase 3
model DownloadedVideo { ... }        # Phase 3
model Channel { ... }                 # Phase 4
model UploadJob { ... }              # Phase 4
model PublishedVideo { ... }         # Phase 4
```

**Migrations:**
- `20260215075820_add_trending_video/` - Platform enum + TrendingVideo table
- `20260215XXXXXX_add_downloaded_video/` - DownloadStatus enum + DownloadedVideo table (Phase 3)
- `202602XXXXXX_add_upload_models/` - Channel, UploadJob, PublishedVideo tables (Phase 4)

## Frontend (`apps/web/`)

### Pages

| Directory | Files | Phase | Status |
|-----------|-------|-------|--------|
| `pages/auth/` | `login-page.tsx`, `register-page.tsx` | 1 | Complete |
| `pages/trending/` | `trending-page.tsx` + 3 components + 2 hooks | 2 | Complete |
| `pages/downloads/` | `downloads-page.tsx` + components + hooks | 3 | Complete |
| `pages/uploads/` | `uploads-page.tsx`, `upload-form.tsx`, `upload-history-table.tsx`, 1 hook | 4 | Complete |
| `pages/settings/` | `connected-accounts-page.tsx`, `connected-account-card.tsx`, 1 hook | 4 | Complete |
| `pages/` | `dashboard-page.tsx` | 1 | Scaffolded |

### Trending Page (`pages/trending/`)

```
trending-page.tsx (main page component)
├── Layout (header, sidebar)
├── <TrendingFilters> (platform, region, category selector)
├── <TrendingAutoRefresh> (toggle + interval selector)
└── <TrendingVideoGrid>
    └── <TrendingVideoCard> × N (infinite scroll)
```

**Hooks:**
- `use-trending-filters.ts` - Filter state (platform, region, category)
- `use-trending-videos.ts` - Data fetching (TanStack Query useInfiniteQuery)

**Components:**
- `trending-filters.tsx` - Filter UI (dropdowns, buttons)
- `trending-video-card.tsx` - Video card (thumbnail, title, stats, creator)
- `trending-auto-refresh.tsx` - Refresh toggle + interval selector

### Layout Components (`components/layout/`)

| File | Purpose |
|------|---------|
| `root-layout.tsx` | Main app wrapper (sidebar, header) |
| `app-header.tsx` | Top navigation bar |
| `app-sidebar.tsx` | Navigation sidebar (links, user info) |

### Hooks

| File | Purpose |
|------|---------|
| `use-auth.ts` | Auth context hook (check logged-in status) |

### Stores (`stores/`)

| File | Purpose | Library |
|------|---------|---------|
| `auth-store.ts` | User authentication state | Zustand |

**State:**
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  setUser(user),
  logout(),
}
```

### Library Utilities (`lib/`)

| File | Purpose |
|------|---------|
| `api-client.ts` | HTTP client + TanStack Query integration |
| `query-client.ts` | TanStack Query configuration |
| `socket-client.ts` | Socket.IO client for real-time updates (Phase 3) |
| `utils.ts` | Helper functions (formatting, etc.) |

**API Client:**
```typescript
// Configured with base URL, interceptors
// Used by hooks via TanStack Query
export const apiClient = {
  get(path, config),
  post(path, data, config),
  // ... standard HTTP methods
}
```

### Configuration Files

| File | Purpose |
|------|---------|
| `components.json` | shadcn/ui components list |
| `vite.config.ts` | Vite bundler config |
| `tsconfig*.json` | TypeScript configs |
| `package.json` | Dependencies + scripts |

## Shared Packages (`packages/`)

### Shared Types (`packages/shared-types/src/`)

| File | Purpose | Exports |
|------|---------|---------|
| `auth.ts` | Auth schemas + types | `UserSchema`, `LoginSchema`, `UserDTO` |
| `trending.ts` | Trending schemas + types | `TrendingVideoSchema`, `TrendingQuerySchema` |
| `platform.ts` | Platform enums + types | `Platform`, `PlatformType` |
| `connected-account.ts` | OAuth account types | `ConnectedAccountDTO` |
| `channel.ts` | Channel entity types (Phase 4) | `ChannelDTO`, `ChannelSchema` |
| `upload.ts` | Upload job types (Phase 4) | `UploadJobDTO`, `PublishedVideoDTO` |
| `api-response.ts` | Standard response shape | `ApiResponse<T>` |
| `user.ts` | User entity types | `User`, `UserProfile` |
| `index.ts` | Package exports | All types |

**Pattern:** Zod schema + TypeScript type inference
```typescript
export const UserSchema = z.object({ ... })
export type User = z.infer<typeof UserSchema>
```

### Config Package (`packages/config/`)

| Directory | Files | Purpose |
|-----------|-------|---------|
| `tsconfig/` | `base.json`, `react.json`, `node.json` | TypeScript presets |
| `eslint/` | `base.js` | ESLint base config |

## Docker Configuration (`docker/`)

| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL + Redis + MinIO stack |

**Services:**
- PostgreSQL 17 (port 5433)
- Redis 7 (port 6379)
- MinIO (ports 9000/9001)

## Dependencies Summary

### Backend (`apps/api/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.0.0 | HTTP server framework |
| `prisma` | ^6.0.0 | ORM database access |
| `@prisma/client` | ^6.0.0 | Prisma runtime client |
| `redis` | ^4.6.0 | Redis client |
| `bullmq` | ^5.0.0 | Job queue (Redis-backed) |
| `socket.io` | ^4.7.0 | Real-time communication (Phase 3) |
| `yt-dlp-wrap` | Latest | Video format extraction (Phase 3) |
| `minio` | ^7.0.0 | S3-compatible storage (Phase 3) |
| `jsonwebtoken` | ^9.0.0 | JWT token handling |
| `bcryptjs` | ^2.4.0 | Password hashing |
| `axios` | ^1.0.0 | HTTP requests (adapters) |
| `zod` | ^3.0.0 | Schema validation |
| `cors` | ^2.8.0 | CORS middleware |
| `helmet` | ^7.0.0 | Security headers |
| `express-rate-limit` | ^6.0.0 | Rate limiting |
| `morgan` | ^1.10.0 | Request logging |

### Frontend (`apps/web/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.0 | UI library |
| `react-router-dom` | ^7.0.0 | Client routing |
| `@tanstack/react-query` | ^5.0.0 | Server state management |
| `zustand` | ^5.0.0 | Client state (Zustand) |
| `socket.io-client` | ^4.7.0 | Real-time client (Phase 3) |
| `tailwindcss` | ^4.0.0 | Utility CSS |
| `shadcn/ui` | Latest | Component library |
| `vite` | ^6.0.0 | Build tool |
| `typescript` | ^5.3.0 | Type checking |
| `zod` | ^3.0.0 | Schema validation |

### Shared (`packages/shared-types/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^3.0.0 | Schema definitions |
| `typescript` | ^5.3.0 | Type definitions |

## Development Scripts

**Root (`package.json`):**
```bash
pnpm dev              # Start all apps (API + Web)
pnpm build            # Build all packages
pnpm type-check       # TypeScript check
pnpm lint             # ESLint check
pnpm test             # Run tests (vitest)
pnpm docker:up        # Start Docker services
pnpm docker:down      # Stop Docker services
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed test data
pnpm db:studio        # Open Prisma Studio
```

**Per-workspace:**
```bash
pnpm -F api dev       # Start API only
pnpm -F web dev       # Start Web only
```

## Phase 4 Implementation Summary

**Completed Features:**
- OAuth 2.0 integration (Google + TikTok)
- Token encryption (AES-256-GCM)
- CSRF protection (Redis state storage)
- YouTube upload service (metadata, thumbnail, privacy)
- TikTok Inbox Upload service
- BullMQ upload queue with progress tracking
- Socket.IO real-time upload progress
- Connected accounts management
- Channel management API
- Upload history tracking
- Frontend OAuth login flow
- Upload form with metadata
- Connected accounts page
- Shared upload/channel types

**Files Added/Modified:**
- Backend Modules: `oauth/`, `uploads/`, `accounts/`, `channels/`
- Backend Services: `encryption/`
- Frontend Pages: `uploads/`, `settings/`
- Frontend Hooks: `use-uploads.ts`, `use-connected-accounts.ts`
- Shared Types: `channel.ts`, `upload.ts`
- Database: Phase 4 migration (Channel, UploadJob, PublishedVideo models)

## Code Quality Standards

### TypeScript
- Strict mode enabled
- Target: ES2020
- Module: ESNext

### Linting
- ESLint with @typescript-eslint
- Prettier for formatting
- No console.log in production (warning)

### Testing
- Framework: Vitest (unit tests)
- E2E: Planned Playwright (Phase 6)

### Git Workflow
- Conventional commits
- Branch protection on main
- CI/CD via GitHub Actions

## Key Architectural Decisions

1. **Strategy Pattern (Adapters):** Abstracts platform differences (YouTube vs TikTok)
2. **Service Layer:** Handles orchestration, caching, database operations
3. **Redis Caching:** Reduces API quota usage, improves response time
4. **BullMQ Jobs:** Warm cache proactively, decouple from request path
5. **Monorepo:** Code reuse (shared-types), unified tooling (Turborepo)
6. **Zod Schemas:** Runtime validation + type inference (DRY)

## Known Limitations & Future Work

| Item | Phase | Notes |
|------|-------|-------|
| Analytics dashboard | Phase 5 | VideoStatsSnapshot model + partitioning |
| E2E tests | Phase 6 | Playwright test suite |
| Deployment guide | Phase 6 | Docker, Nginx, backup strategy |
| Direct TikTok posting | Future | Currently Inbox Upload only; requires audit approval |

## Statistics

| Metric | Value |
|--------|-------|
| Total Files | 150+ |
| Backend Source Files | ~40 (excl. migrations) |
| Frontend Source Files | ~20 |
| Shared Package Files | 10 |
| Database Entities | 7 (User, ConnectedAccount, TrendingVideo, DownloadedVideo, Channel, UploadJob, PublishedVideo) |
| API Endpoints | 20+ (auth: 4, trending: 3, downloads: 3, uploads: 4, accounts: 3, channels: 2) |
| OAuth Providers | 2 (Google, TikTok) |
| Upload Uploaders | 2 (YouTube, TikTok) |
| Redis Cache Keys | 5+ patterns |
| Socket.IO Events | 6+ (download:*, upload:*, OAuth:*) |

## Documentation Map

- **Getting Started:** See `/README.md`
- **Architecture:** See `/docs/system-architecture.md`
- **Project Overview:** See `/docs/project-overview-pdr.md`
- **Code Standards:** See `/docs/code-standards.md` (when created)
- **Roadmap:** See `/docs/development-roadmap.md` (when created)
- **Implementation Plans:** See `/plans/260214-2218-trendvault-implementation/`
