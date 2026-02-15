# TrendVault - Project Overview & PDR

**Version:** 1.0.0
**Status:** Phase 2 Complete (Foundation, Trending Discovery)
**Last Updated:** 2026-02-15

## Executive Summary

TrendVault is a cross-platform trending video discovery, download, and re-upload web application. It aggregates trending videos from YouTube and TikTok, allows users to download them, re-encode if needed, and auto-publish to their own channels while respecting platform policies and legal requirements.

**Core Value Proposition:** Discover trending videos across platforms → Download → Re-publish with proper attribution

## Project Goals

| Goal | Priority | Status |
|------|----------|--------|
| Enable cross-platform video discovery | P0 | Complete (Phase 2) |
| Provide robust download engine | P0 | In Progress (Phase 3) |
| Simplify multi-platform publishing | P0 | In Progress (Phase 4) |
| Deliver comprehensive analytics | P1 | Planned (Phase 5) |
| Production-ready deployment | P1 | Planned (Phase 6) |

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite + TailwindCSS | 19, 6, 4 |
| **State** | TanStack Query + Zustand | 5, 5 |
| **Backend** | Node.js + Express | 22, 5 |
| **Database** | PostgreSQL + Prisma | 17, 6 |
| **Cache** | Redis + BullMQ | 7, 5 |
| **Storage** | MinIO (S3-compatible) | Latest |
| **Monorepo** | Turborepo + pnpm | Latest |

## Phase Breakdown

### Phase 1: Foundation & Scaffolding (Weeks 1-3) — COMPLETE
- Monorepo structure (Turborepo + pnpm workspaces)
- Database schema & Prisma setup (User, ConnectedAccount)
- Authentication system (JWT + bcrypt)
- Base UI components & routing (React Router 7)
- CI/CD pipeline (GitHub Actions)

**Deliverables:** Monorepo scaffold, auth system, base UI, deployable Docker setup

### Phase 2: Trending Video Discovery (Weeks 4-6) — COMPLETE
- Platform adapters (YouTube Data API, TikTok Research API, Apify fallback)
- Trending service with Redis caching (TTL: 30min YouTube, 15min TikTok)
- BullMQ background refresh jobs (every 30 minutes per region/platform)
- Database model: `TrendingVideo`
- Frontend dashboard with filters (platform, region, category), infinite scroll, auto-refresh toggle
- API endpoints with pagination

**Deliverables:** Trending discovery fully functional, trending cache layer, background jobs

### Phase 3: Download Engine (Weeks 7-9) — IN PROGRESS
- yt-dlp-wrap integration for video download
- Format selection & quality preferences
- Progress tracking with Socket.IO
- Download queue with BullMQ
- Database model: `DownloadedVideo`

**Deliverables:** End-to-end download flow, quality/format selection, progress tracking

### Phase 4: Upload & OAuth (Weeks 10-13) — PENDING
- Google OAuth 2.0 for YouTube publishing
- TikTok OAuth 2.0 for Inbox Upload (direct post deferred post-audit)
- YouTube upload with metadata (title, description, tags, thumbnail)
- TikTok Inbox Upload
- Database models: `UploadJob`, `Channel`, `PublishedVideo`

**Deliverables:** Multi-platform publishing, OAuth flows, upload tracking

### Phase 5: Channel Management & Analytics (Weeks 14-16) — PENDING
- Channel dashboard (connected accounts, video stats)
- Video analytics (views, likes, engagement over time)
- Analytics aggregation with VideoStatsSnapshot
- Database model: `VideoStatsSnapshot` (with manual PostgreSQL partitioning)

**Deliverables:** Channel management UI, analytics dashboard, stats aggregation

### Phase 6: Polish & Launch (Weeks 17-19) — PENDING
- Security hardening (CORS, rate limiting, input validation)
- Performance optimization (CDN, query optimization)
- E2E testing with Playwright
- Deployment documentation (Nginx, Docker, MinIO, PostgreSQL)
- Public launch

**Deliverables:** Production-ready app, security audit passed, deployment guide

## Functional Requirements (by Phase)

### FR1: Authentication & Base UI (Phase 1) — COMPLETE
- User registration with email/password
- JWT-based authentication
- Protected API routes & pages
- Base layout (header, sidebar, auth pages)

### FR2: Trending Discovery (Phase 2) — COMPLETE
- Fetch trending videos (YouTube mostPopular + search.list, TikTok Research API / Apify)
- Filter by: platform (YouTube, TikTok), region (12+ supported), category (YouTube only)
- Display videos with: thumbnail, title, views, likes, creator, platform badge, duration
- Infinite scroll pagination (10+ videos/page)
- Auto-refresh toggle with configurable intervals (1min, 5min, 15min, 30min)
- Video cache in Redis (30min YouTube, 15min TikTok)
- Background refresh jobs (BullMQ, every 30min per region/platform)

### FR3: Download Engine (Phase 3) — IN PROGRESS
- Select format/quality from available options
- Download with progress tracking
- Cancel/pause downloads
- Resume interrupted downloads
- Store metadata in DownloadedVideo table

### FR4: Multi-Platform Publishing (Phase 4) — PENDING
- YouTube: Publish with title, description, tags, thumbnail, privacy (public/unlisted/private)
- TikTok: Inbox Upload (draft mode, user finalizes before publishing)
- Automatic video re-encoding if needed (format/codec compatibility)
- Publishing queue with retry logic

### FR5: Channel Analytics (Phase 5) — PENDING
- Dashboard showing all connected channels
- Per-video stats: views, likes, comments, engagement rate
- Time-series analytics for engagement trends
- Channel-level aggregations (total views, average engagement)

### FR6: Deployment & Operations (Phase 6) — PENDING
- Single-server Docker Compose deployment
- Environment-based config (development, staging, production)
- Database backup strategy
- MinIO S3-compatible storage configuration
- Monitoring & logging setup

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| API response time (cached) | < 500ms |
| API response time (cold cache) | < 3s |
| YouTube quota usage | < 5K units/day for trending |
| Upload success rate | > 95% |
| Download resume support | Required |
| Database availability | 99.5% uptime |
| Session timeout | 24 hours |
| Token refresh | 1 hour |

## Data Models (Current)

### User (Phase 1)
```prisma
model User {
  id            String @id @default(uuid())
  email         String @unique
  password      String
  name          String
  avatarUrl     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### ConnectedAccount (Phase 1)
```prisma
model ConnectedAccount {
  id                String @id @default(uuid())
  userId            String
  platform          Platform // YOUTUBE | TIKTOK
  platformUserId    String
  platformUserName  String
  accessToken       String // encrypted
  refreshToken      String? // encrypted
  tokenExpiresAt    DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### TrendingVideo (Phase 2)
```prisma
model TrendingVideo {
  id                String @id @default(uuid())
  platform          Platform // YOUTUBE | TIKTOK
  platformVideoId   String
  region            String // US, GB, JP, etc.
  category          String? // For YouTube
  title             String
  description       String?
  thumbnailUrl      String
  viewCount         Int
  likeCount         Int
  creatorName       String
  creatorUrl        String?
  duration          Int? // seconds
  videoUrl          String
  fetchedAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([platform, platformVideoId, region])
}
```

## API Endpoints (Phase 2 Complete)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Logout

### Trending
- `GET /api/trending` - Fetch trending videos with filters
  - Query: `platform`, `region`, `category`, `page`, `limit`
  - Returns: paginated video list with cache status
- `GET /api/trending/regions` - List supported regions
- `GET /api/trending/categories` - List YouTube categories

## Deployment Architecture

**Current (Development):**
- Docker Compose: PostgreSQL (5433), Redis (6379), MinIO (9000/9001)
- Express API: http://localhost:3001
- React Web: http://localhost:5173

**Target (Production):**
- Single-server deployment with Docker Compose
- Nginx reverse proxy (API + Web)
- PostgreSQL with automated backups
- Redis for caching & session management
- MinIO for video file storage

## Critical Dependencies

| Service | Impact | Status |
|---------|--------|--------|
| YouTube Data API v3 | Trending discovery, publishing | Required, quota: 10K units/day |
| TikTok Research API | Trending discovery (Research API) | Optional (Apify fallback available) |
| Apify | TikTok trending (primary) | Required, ~$0.001/100 results |
| Google OAuth 2.0 | YouTube publishing | Required (Phase 4) |
| TikTok OAuth 2.0 | TikTok publishing | Required (Phase 4) |
| yt-dlp binary | Video download | Auto-installed by wrapper |
| FFmpeg | Video re-encoding | Required for format conversion (Phase 3+) |

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| YouTube API quota exhaustion | Medium | High | Cap uploads to 4/day, prioritize trending queries |
| TikTok Research API approval | Medium | Medium | Use Apify as primary, Research API as enhancement |
| Video copyright detection | High | Medium | Add content ID awareness, document attribution requirements |
| Platform OAuth flow failures | Low | High | Implement robust retry logic, clear error messages |
| Database performance degradation | Low | High | Index trending queries, implement caching, partition VideoStatsSnapshot |

## Success Criteria

### Phase 2 Completion (Current)
- [x] YouTube trending discovery with mostPopular + search.list
- [x] TikTok trending with Apify (primary) + Research API (optional)
- [x] Redis caching layer (TTL per platform)
- [x] BullMQ background refresh jobs
- [x] Frontend trending dashboard with filters
- [x] Infinite scroll pagination
- [x] Auto-refresh functionality
- [x] Database persistence in TrendingVideo table

### MVP Completion (All 6 Phases)
- [ ] End-to-end video download with progress tracking
- [ ] Multi-platform publishing (YouTube + TikTok Inbox)
- [ ] OAuth flows for both platforms
- [ ] Analytics dashboard with stats aggregation
- [ ] Production deployment with security hardening
- [ ] E2E test coverage > 80%
- [ ] Performance benchmarks met (< 500ms cached, < 3s cold)

## Development Roadmap

**Current Sprint:** Phase 3 - Download Engine (In Progress)
**Next Sprints:** Phase 4 (OAuth), Phase 5 (Analytics), Phase 6 (Launch)

See `/docs/development-roadmap.md` for detailed timeline and milestones.

## Questions & Decisions Log

See `/plans/260214-2218-trendvault-implementation/plan.md` for validation decisions:
- TikTok upload: Inbox/Draft mode only (deferred direct post)
- YouTube quota: Cap uploads to 4/day
- MVP: All 6 phases, no phased launch
- TikTok trending: Apify primary, Research API optional
- yt-dlp wrapper: yt-dlp-wrap (AbortController support)
- Production storage: MinIO self-hosted

## Contacts & Support

- **Project Owner:** TrendVault Team
- **Architecture Decision:** See `/plans/260214-2218-trendvault-implementation/`
- **Documentation:** See `/docs/` directory
