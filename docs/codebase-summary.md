# TrendVault Codebase Summary

**Version:** 1.6.0 (Phase 8 Complete)
**Generated:** 2026-02-18
**Monorepo Structure:** Turborepo + pnpm workspaces
**Status:** Production-Ready - All Core Features Implemented

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
│   │   │   │   ├── channels/        # User channels (Phase 4)
│   │   │   │   ├── analytics/       # Analytics & stats (Phase 5)
│   │   │   │   ├── videos/          # Video detail (Phase 5)
│   │   │   │   └── sync/            # Background sync jobs (Phase 5)
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
│       │   │   ├── downloads/       # Download interface (Phase 3)
│       │   │   ├── uploads/         # Upload interface (Phase 4)
│       │   │   ├── settings/        # Connected accounts (Phase 4)
│       │   │   ├── channels/        # Channel dashboard (Phase 5)
│       │   │   ├── videos/          # Video detail (Phase 5)
│       │   │   └── analytics/       # Cross-channel analytics (Phase 5)
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
│   │       ├── platform.ts
│   │       └── analytics.ts     # Phase 5 analytics types
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

| File             | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `environment.ts` | Validates & exports environment variables                 |
| `database.ts`    | Prisma client instance                                    |
| `redis.ts`       | Redis client instance                                     |
| `cors.ts`        | CORS policy configuration                                 |
| `socket-io.ts`   | Socket.IO server setup with JWT auth middleware (Phase 3) |

### Storage Services (`src/services/storage/`)

**Phase 3 Complete**

| File                           | Purpose                                   |
| ------------------------------ | ----------------------------------------- |
| `storage-service.interface.ts` | Abstraction for storage operations        |
| `minio-storage-service.ts`     | MinIO implementation (S3-compatible)      |
| `storage-factory.ts`           | Factory pattern for service instantiation |

### Library Layer (`src/lib/`)

| File               | Purpose                   |
| ------------------ | ------------------------- |
| `prisma-client.ts` | Prisma singleton          |
| `redis-client.ts`  | Redis singleton           |
| `api-response.ts`  | Standard response wrapper |

### Middleware (`src/middleware/`)

| File                  | Purpose                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| `auth-middleware.ts`  | JWT validation & user extraction                                            |
| `error-handler.ts`    | Centralized error handling                                                  |
| `rate-limiter.ts`     | Express rate limiting + downloadLimiter (Phase 3) + uploadLimiter (Phase 4) |
| `request-logger.ts`   | Request/response logging (Morgan)                                           |
| `validate-request.ts` | Zod schema validation wrapper                                               |

### Auth Module (`src/modules/auth/`)

**Phase 1 Complete**

| File                 | Purpose                | Key Exports                                      |
| -------------------- | ---------------------- | ------------------------------------------------ |
| `auth-schemas.ts`    | Zod validation schemas | `RegisterSchema`, `LoginSchema`                  |
| `auth-service.ts`    | Business logic         | `AuthService` class methods                      |
| `auth-controller.ts` | HTTP handlers          | `register()`, `login()`, `refresh()`, `logout()` |
| `auth-router.ts`     | Route definitions      | Router with `/register`, `/login`, etc.          |

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

**Phase 2 Complete (Updated Phase 8)**

```
trending/
├── adapters/
│   ├── platform-adapter.interface.ts  # Strategy pattern interface
│   ├── youtube-adapter.ts             # YouTube Data API v3 integration
│   ├── tiktok-adapter.ts              # TikTok Research API + Apify fallback
│   └── instagram-adapter.ts           # Instagram Apify integration (Phase 8)
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
  fetchTrending(region: string, category?: string): Promise<TrendingVideoDTO[]>;
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

| File               | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `oauth-service.ts` | OAuth 2.0 flow orchestration (Google + TikTok) |
| `oauth-router.ts`  | OAuth callback routes (/callback/{provider})   |

**Features:**

- Google OAuth 2.0 (youtube.upload scope)
- TikTok OAuth 2.0 (video.publish scope)
- CSRF protection via Redis state storage
- Token blob encryption (AES-256-GCM)
- Automatic token refresh on expiry

### Upload Module (`src/modules/uploads/`)

**Phase 4 Complete (Updated Phase 8)**

```
uploads/
├── upload-service.ts            # Upload orchestration
├── upload-controller.ts         # HTTP handlers
├── upload-router.ts             # Route definitions
├── upload-schemas.ts            # Zod validation schemas
├── uploaders/
│   ├── platform-uploader-interface.ts  # Strategy pattern
│   ├── youtube-uploader.ts             # YouTube API integration
│   ├── tiktok-uploader.ts              # TikTok Inbox Upload
│   └── instagram-uploader.ts           # Instagram Graph API (Phase 8)
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

| File                 | Purpose                       |
| -------------------- | ----------------------------- |
| `accounts-router.ts` | Connected accounts API routes |

**Endpoints:**

- GET `/api/accounts` - List connected accounts per user
- POST `/api/accounts/{accountId}/refresh` - Force token refresh
- DELETE `/api/accounts/{accountId}` - Disconnect account

### Channels Module (`src/modules/channels/`)

**Phase 4 Complete**

| File                 | Purpose                  |
| -------------------- | ------------------------ |
| `channels-router.ts` | User channels API routes |

**Endpoints:**

- GET `/api/channels` - List channels per user
- GET `/api/channels/{channelId}` - Get channel details

### Encryption Service (`src/services/encryption/`)

**Phase 4 Complete**

| File                    | Purpose                           |
| ----------------------- | --------------------------------- |
| `encryption-service.ts` | AES-256-GCM token blob encryption |

**Usage:**

- Encrypts OAuth access/refresh tokens as single JSON blob before DB storage
- Async PBKDF2 key derivation per user (cached 5min)
- Decrypts on retrieval for API calls
- Master key: Environment variable (HSM in production)

### Sync Module (`src/modules/sync/`)

**Phase 5 Complete (Updated Phase 8)**

```
sync/
├── sync-scheduler.ts                    # BullMQ repeatable job registration (6 jobs)
├── sync-worker.ts                       # BullMQ worker dispatcher
├── platform-stats/
│   ├── platform-stats-fetcher-interface.ts  # Strategy pattern interface
│   ├── youtube-stats-fetcher.ts             # YouTube Data API v3
│   ├── tiktok-stats-fetcher.ts              # TikTok Video Query API
│   └── instagram-stats-fetcher.ts           # Instagram Graph API (Phase 8)
└── handlers/
    ├── channel-metadata-sync-handler.ts   # Sync channel info (6h)
    ├── video-list-sync-handler.ts         # Sync video list (12h, max 250/channel)
    ├── stats-snapshot-sync-handler.ts     # Capture stats (6h recent, 24h all)
    ├── stats-aggregation-handler.ts       # 90d+ daily → weekly summaries (daily 2AM)
    └── partition-management-handler.ts    # Auto-create next 2 month partitions
```

**Sync Schedule:**

- Channel metadata: every 6 hours
- Video list: every 12 hours
- Stats (recent <7d): every 6 hours
- Stats (all): daily at 3 AM
- Aggregation: daily at 2 AM
- Partition: 1st of each month

### Analytics Module (`src/modules/analytics/`)

**Phase 5 Complete**

| File                   | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `analytics-service.ts` | 6 methods: overview, videos, stats, lifecycle, aggregate, compare |
| `analytics-router.ts`  | 6 GET routes (all auth-protected)                                 |
| `analytics-schemas.ts` | Zod schemas + date range helper                                   |

**Endpoints:**

- GET `/api/analytics/channels/:channelId/overview` - Channel KPIs + recent videos
- GET `/api/analytics/channels/:channelId/videos` - Paginated video list
- GET `/api/analytics/videos/:videoId/stats` - Time-series stats
- GET `/api/analytics/videos/:videoId/lifecycle` - Content lifecycle (trending→download→upload→published)
- GET `/api/analytics/cross-channel` - Aggregate stats across all channels
- GET `/api/analytics/cross-channel/compare` - Same-content cross-channel comparison

### Videos Module (`src/modules/videos/`)

**Phase 5 Complete**

| File               | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `videos-router.ts` | GET `/api/videos/:videoId` - Video detail with BigInt→Number conversion |

### Root Entry Points

| File        | Purpose                                         |
| ----------- | ----------------------------------------------- |
| `app.ts`    | Express app initialization (middleware, routes) |
| `server.ts` | HTTP server startup, listener initialization    |

### Database (`prisma/`)

| File            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `schema.prisma` | Prisma data model (User, ConnectedAccount, TrendingVideo) |
| `seed.ts`       | Test data seeding script                                  |
| `migrations/`   | Database migration history                                |

**Current Schema (Phase 5):**

```prisma
model User { ... }                                    # Phase 1
model ConnectedAccount { ... }                        # Phase 1 (updated Phase 4: encrypted tokens)
enum Platform { YOUTUBE, TIKTOK, INSTAGRAM }         # Phase 2 (updated Phase 8)
model TrendingVideo { ... }                          # Phase 2
enum DownloadStatus { ... }                           # Phase 3
model DownloadedVideo { ... }                        # Phase 3
model Channel { ... }                                 # Phase 4
model UploadJob { ... }                              # Phase 4
model PublishedVideo { ... }                         # Phase 4 (updated Phase 5: stats fields + @@unique)
model VideoStatsSnapshot { ... }                     # Phase 5
```

**Migrations:**

- `20260215075820_add_trending_video/` - Platform enum + TrendingVideo table
- `20260215XXXXXX_add_downloaded_video/` - DownloadStatus enum + DownloadedVideo table (Phase 3)
- `202602XXXXXX_add_upload_models/` - Channel, UploadJob, PublishedVideo tables (Phase 4)

## Frontend (`apps/web/`)

**Comprehensive documentation:** See `/docs/frontend-architecture.md`

**Overview:** React 19 + TypeScript frontend with Vibe Design System styling, TanStack Query for data fetching, Zustand for state management.

**Key Features:**

- 9 main pages (auth, trending, downloads, uploads, settings, channels, videos, analytics, dashboard)
- Real-time updates via Socket.IO
- OAuth integration (Google, TikTok, Instagram)
- Responsive design (Tailwind layout + Vibe tokens for styling)
- Dark/light theme switching with CSS variables

**Architecture:**

- Components: Pages, layout shell, reusable UI components
- Hooks: Custom data-fetching hooks using TanStack Query
- Stores: Zustand for theme and auth state
- Utilities: API client, Socket.IO, formatting helpers
- Styling: Vibe CSS variables (colors, typography, shadows) + Tailwind (layout)

## Shared Packages (`packages/`)

### Shared Types (`packages/shared-types/src/`)

| File                   | Purpose                        | Exports                                                    |
| ---------------------- | ------------------------------ | ---------------------------------------------------------- |
| `auth.ts`              | Auth schemas + types           | `UserSchema`, `LoginSchema`, `UserDTO`                     |
| `trending.ts`          | Trending schemas + types       | `TrendingVideoSchema`, `TrendingQuerySchema`               |
| `platform.ts`          | Platform enums + types         | `Platform`, `PlatformType`                                 |
| `connected-account.ts` | OAuth account types            | `ConnectedAccountDTO`                                      |
| `channel.ts`           | Channel entity types (Phase 4) | `ChannelDTO`, `ChannelSchema`                              |
| `upload.ts`            | Upload job types (Phase 4)     | `UploadJobDTO`, `PublishedVideoDTO`                        |
| `analytics.ts`         | Analytics schemas (Phase 5)    | `VideoStatsSnapshot`, `StatsTimeSeries`, `ChannelOverview` |
| `api-response.ts`      | Standard response shape        | `ApiResponse<T>`                                           |
| `user.ts`              | User entity types              | `User`, `UserProfile`                                      |
| `index.ts`             | Package exports                | All types                                                  |

**Pattern:** Zod schema + TypeScript type inference

```typescript
export const UserSchema = z.object({ ... })
export type User = z.infer<typeof UserSchema>
```

### Config Package (`packages/config/`)

| Directory   | Files                                  | Purpose            |
| ----------- | -------------------------------------- | ------------------ |
| `tsconfig/` | `base.json`, `react.json`, `node.json` | TypeScript presets |
| `eslint/`   | `base.js`                              | ESLint base config |

## Docker Configuration (`docker/`)

| File                 | Purpose                          |
| -------------------- | -------------------------------- |
| `docker-compose.yml` | PostgreSQL + Redis + MinIO stack |

**Services:**

- PostgreSQL 17 (port 5433)
- Redis 7 (port 6379)
- MinIO (ports 9000/9001)

## Key Dependencies

**Backend:** Express 5, Prisma 6, Redis 4, BullMQ 5, Socket.IO 4, yt-dlp-wrap, MinIO, JWT, bcrypt, Axios, Zod, Helmet
**Frontend:** React 19, React Router 7, TanStack Query 5, Zustand 5, Socket.IO Client 4, Tailwind 4, Vibe @core 3.85.1, Vibe @icons 1.16.0, Recharts 2, date-fns 4
**Shared:** Zod 3, TypeScript 5

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

## Frontend Styling Architecture (Vibe Design System)

**Status:** 100% Complete (All components migrated)

The frontend styling system is built on a hybrid approach:

1. **Vibe Design System** (`@vibe/core` v3.85.1, `@vibe/icons` v1.16.0)
   - All visual design tokens (colors, typography, shadows, borders, radius)
   - React component wrappers (Icon, Button, Loader, etc.)
   - Automatic light/dark theme switching via CSS custom properties
   - ThemeProvider manages theme state and applies via `data-vibe-theme` attribute

2. **Tailwind CSS** (v4 - Structural layout only)
   - Flexbox/Grid layout utilities
   - Spacing (margin, padding, gap)
   - Sizing (width, height, min/max constraints)
   - Responsive breakpoints (sm, md, lg, xl)
   - Border (without color), overflow, transform

3. **Custom Utilities** (`apps/web/src/styles/vibe-overrides.css`)
   - Shorthand classes for repeated Vibe token patterns
   - Surface, text, border, semantic color utilities
   - Used when inline `style={{}}` is impractical

**Styling Pattern:**

- Inline `style={{ backgroundColor: 'var(--primary-background-color)' }}` for Vibe tokens
- Tailwind classes for layout and responsive behavior
- Event handlers (`onMouseEnter`, `onMouseLeave`) for interactive hover states
- `useVibeColors()` hook to extract hex values for chart libraries (Recharts)

**Key Implementation Details:**

- All hardcoded colors removed (except platform branding: YouTube red #FF0000, TikTok black #000000, Instagram pink #E1306C)
- Typography via `font: 'var(--font-h2-bold)'` shorthand (size + weight + line-height)
- Shadows: `--box-shadow-xs`, `--box-shadow-small`, `--box-shadow-medium`
- Borders: `--ui-border-color` (interactive), `--layout-border-color` (structural)
- Semantic colors: `--positive-color`, `--negative-color`, `--warning-color` (+ `-selected` variants)
- Theme colors: `--primary-text-color`, `--secondary-text-color`, `--primary-background-color`, etc.

**Files:**

- `apps/web/src/main.tsx` - Import order: @vibe/core/tokens → vibe-overrides.css → app → index.css
- `apps/web/src/styles/vibe-overrides.css` - Utility class definitions
- `apps/web/src/hooks/use-vibe-colors.ts` - Extract CSS vars as hex for charts
- `apps/web/src/stores/theme-store.ts` - Zustand theme state (light/dark/system)
- All component files use `style={{}}` with CSS variables
- See `/docs/design-guidelines.md` for complete styling reference

## Phase 0 Implementation Summary

**Vibe UI Foundation (Complete):**

- @vibe/core and @vibe/icons as web dependencies
- ThemeProvider wrapping root app component
- VibeCard custom component using Vibe @core
- useVibeColors hook for theme color access
- 22 custom SVG icon components for UI consistency

**Files Created:**

- `apps/web/src/components/ui/vibe-card.tsx` - Reusable Vibe card component
- `apps/web/src/hooks/use-vibe-colors.ts` - Theme color management hook
- Custom SVG icon components in `apps/web/src/components/icons/`

**Architecture:** Vibe replaces shadcn/ui as primary component library. Progressive migration approach allows building new features with Vibe while retrofitting existing components.

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

## Phase 5 Implementation Summary

**Completed Features:**

- Background sync jobs (BullMQ repeatable: 6 job types)
- Platform stats fetchers (YouTube Data API v3, TikTok Video Query API)
- Channel metadata, video list, and stats snapshot syncing
- Stats aggregation (90d+ daily → weekly, ~80% storage reduction)
- Analytics API (6 endpoints: overview, videos, stats, lifecycle, cross-channel, compare)
- Video detail API with BigInt→Number conversion
- Channel dashboard (sidebar, overview with charts, video library)
- Video detail page (stats chart, lifecycle timeline, player)
- Cross-channel analytics (KPI cards, platform bar chart, content comparison table)
- Recharts integration (LineChart, BarChart)
- Format utilities (compact numbers, dates, duration)

**Files Added/Modified:**

- Backend Modules: `sync/` (10 files), `analytics/` (3 files), `videos/` (1 file)
- Frontend Pages: `channels/` (7 files), `videos/` (5 files), `analytics/` (4 files)
- Frontend Hooks: 4 new hooks
- Frontend Utilities: `format-utils.ts`
- Shared Types: `analytics.ts`
- Schema: VideoStatsSnapshot model, PublishedVideo stats fields, @@unique constraint
- Router: 3 new routes (channels, videos/:id, analytics)
- Sidebar: 2 nav items enabled (Channels, Analytics)

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

## Phase 6 Implementation Summary

**Completed Security & Polish:**

- Circuit breaker + retry-with-backoff on all platform adapters
- AppError hierarchy with Prisma error mapping
- Dark mode (Zustand + CSS variables + theme persistence)
- ErrorBoundary + custom 404/500 error pages
- ToS/Privacy pages with first-login acceptance modal
- Production Docker Compose + multi-stage Dockerfiles
- Nginx reverse proxy (SSL, gzip, rate limiting)
- k6 load tests (trending, downloads)
- Helmet CSP hardening (custom directives + dev allowances)
- Swagger/OpenAPI integration (JSDoc on auth/trending routers)
- tosAcceptedAt field + migration + PATCH /auth/accept-tos endpoint

**Files Created:** 15+ (services, middleware, UI components, scripts)
**Files Modified:** 20+ (integrations across all modules)

## Phase 7 Implementation Summary

**YouTube Shorts Integration (Complete):**

- Shorts detection service (duration ≤180s + aspectRatio <0.7)
- Database fields: isShort, width, height, aspectRatio on TrendingVideo/DownloadedVideo/PublishedVideo
- UploadJob fields: uploadAsShort, categoryId for YouTube API hints
- GET `/api/analytics/channels/:id/shorts-breakdown` - Shorts analytics endpoint
- GET `/api/trending?contentType=all|shorts|regular` - Content type filtering
- ShortsBadge, ShortsUploadToggle, ShortsAnalyticsPanel components
- Backfill script for retroactive detection on 100+ existing videos
- 31 unit tests validating detection heuristics and API endpoints

**Files Created:** 3 (shorts-detection-service, backfill script, detailed implementation docs)
**Files Modified:** 9 (services, adapters, routers, pages)
**Test Coverage:** 31 passing unit tests

## Phase 8 Implementation Summary

**Instagram Reels Integration (Complete - Commit: ef2c3f3):**

- Platform enum: Added INSTAGRAM support to Prisma + Zod
- Meta OAuth 2.0: 60-day long-lived token flow with automatic refresh
- InstagramAdapter: Apify instagram-reel-scraper integration (Trending discovery)
- InstagramUploader: Graph API container upload (two-step: create → poll → publish)
- InstagramStatsFetcher: Channel metadata + per-video analytics (views, likes, comments, shares)
- Shorts detection: All Instagram Reels automatically marked isShort=true
- Download support: Instagram Reel URL extraction + download pipeline
- Frontend integration: Trending, uploads, downloads, channels, settings, video detail pages
- 105 unit tests (15 adapter, 17 uploader, 26 stats, 6 download, 10 OAuth)

**Files Created:**

- `apps/api/src/modules/trending/adapters/instagram-adapter.ts` (163 LOC)
- `apps/api/src/modules/uploads/uploaders/instagram-uploader.ts` (196 LOC)
- `apps/api/src/modules/sync/platform-stats/instagram-stats-fetcher.ts` (148 LOC)
- 5 test files in **tests** directories

**Files Modified:** 12+ (OAuth integration, trending service, upload service, sync scheduler, frontend pages)
**Test Coverage:** 105 passing unit tests, zero regressions
**Environment Variables:** META_APP_ID, META_APP_SECRET, INSTAGRAM_REDIRECT_URI

## Key Architectural Decisions

1. **Strategy Pattern (Adapters):** Abstracts platform differences (YouTube vs TikTok)
2. **Service Layer:** Handles orchestration, caching, database operations
3. **Redis Caching:** Reduces API quota usage, improves response time
4. **BullMQ Jobs:** Warm cache proactively, decouple from request path
5. **Monorepo:** Code reuse (shared-types), unified tooling (Turborepo)
6. **Zod Schemas:** Runtime validation + type inference (DRY)
7. **Heuristic Detection:** Shorts identification without external API dependency

## Known Limitations & Future Work

| Item                  | Phase   | Notes                                                |
| --------------------- | ------- | ---------------------------------------------------- |
| E2E tests             | Phase 6 | Playwright test suite                                |
| Deployment guide      | Phase 6 | Docker, Nginx, backup strategy                       |
| Dark mode             | Phase 6 | UI/UX polish                                         |
| API docs (Swagger)    | Phase 6 | OpenAPI spec generation                              |
| Direct TikTok posting | Future  | Currently Inbox Upload only; requires audit approval |

## Statistics

| Metric                | Value                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Total Files           | 200+                                                                                                               |
| Backend Source Files  | ~60 (excl. migrations)                                                                                             |
| Frontend Source Files | ~45                                                                                                                |
| Shared Package Files  | 10                                                                                                                 |
| Database Entities     | 8 (User, ConnectedAccount, TrendingVideo, DownloadedVideo, Channel, UploadJob, PublishedVideo, VideoStatsSnapshot) |
| API Endpoints         | 32+ (auth: 4, trending: 4, downloads: 3, uploads: 4, accounts: 3, channels: 2, analytics: 7, videos: 1)            |
| New Fields (Phase 7)  | 7 (isShort, width, height, aspectRatio, uploadAsShort, categoryId on 4 models)                                     |
| New Components        | 3 (ShortsBadge, ShortsUploadToggle, ShortsAnalyticsPanel)                                                          |
| OAuth Providers       | 3 (Google, TikTok, Meta/Instagram) - Phase 8                                                                       |
| Upload Uploaders      | 3 (YouTube, TikTok, Instagram) - Phase 8                                                                           |
| Platform Adapters     | 3 (YouTube, TikTok, Instagram) - Phase 8                                                                           |
| Stats Fetchers        | 3 (YouTube, TikTok, Instagram) - Phase 8                                                                           |
| Redis Cache Keys      | 5+ patterns (YouTube, TikTok, Instagram)                                                                           |
| Socket.IO Events      | 6+ (download:_, upload:_, OAuth:\*)                                                                                |
| Unit Tests            | 136+ (31 Phase 7 Shorts + 105 Phase 8 Instagram)                                                                   |

## Documentation Map

- **Getting Started:** See `/README.md`
- **Architecture:** See `/docs/system-architecture.md`
- **Project Overview:** See `/docs/project-overview-pdr.md`
- **Code Standards:** See `/docs/code-standards.md` (when created)
- **Roadmap:** See `/docs/development-roadmap.md` (when created)
- **Implementation Plans:** See `/plans/260214-2218-trendvault-implementation/`
