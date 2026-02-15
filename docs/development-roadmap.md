# TrendVault Development Roadmap

**Version:** 1.0.0
**Status:** Phase 2 Complete
**Updated:** 2026-02-15
**Next Phase:** Phase 3 (Download Engine)

## Timeline Overview

| Phase | Title | Duration | Status | Completion |
|-------|-------|----------|--------|------------|
| 1 | Foundation & Scaffolding | Weeks 1-3 | COMPLETE | 100% |
| 2 | Trending Video Discovery | Weeks 4-6 | COMPLETE | 100% |
| 3 | Download Engine | Weeks 7-9 | IN PROGRESS | 0% |
| 4 | Upload & OAuth | Weeks 10-13 | PENDING | 0% |
| 5 | Channel Management & Analytics | Weeks 14-16 | PENDING | 0% |
| 6 | Polish & Launch | Weeks 17-19 | PENDING | 0% |

**Total Project Duration:** 19 weeks (from start)
**Estimated Completion:** Week 19 (early May 2026)

## Phase 1: Foundation & Scaffolding (Weeks 1-3)

**Status:** COMPLETE ✓

**Deliverables:**
- [x] Monorepo scaffold (Turborepo + pnpm workspaces)
- [x] Database setup (PostgreSQL 17, Prisma 6)
- [x] User model + migrations
- [x] ConnectedAccount model (OAuth placeholder)
- [x] Authentication service (JWT + bcrypt)
- [x] Auth routes (register, login, refresh, logout)
- [x] Auth controller + Zod schemas
- [x] Auth middleware (JWT validation)
- [x] Base UI components (header, sidebar, layout)
- [x] React Router 7 setup (SPA mode)
- [x] Login/Register pages
- [x] Zustand auth store
- [x] TanStack Query setup
- [x] Docker Compose (PostgreSQL, Redis, MinIO)
- [x] GitHub Actions CI/CD (linting, type-check, tests)
- [x] Environment configuration

**Files Created:**
- Backend: 8 files (auth module, config, middleware)
- Frontend: 5 files (auth pages, layout, store, hooks)
- Database: schema.prisma + seed.ts + migrations

**Key Decisions Confirmed:**
- Express 5 (stable since late 2025)
- React 19 (use() hook, improved Suspense)
- Incremental DB schema per phase
- Turborepo + pnpm for monorepo

## Phase 2: Trending Video Discovery (Weeks 4-6)

**Status:** COMPLETE ✓

**Deliverables:**
- [x] YouTube adapter (Data API v3: mostPopular + search.list)
- [x] TikTok adapter (Apify primary + Research API optional)
- [x] Platform adapter interface (strategy pattern)
- [x] Trending service (cache + DB orchestration)
- [x] Redis cache layer (TTL per platform)
- [x] BullMQ background refresh jobs (every 30min)
- [x] Trending refresh job + worker
- [x] TrendingVideo database model
- [x] Database migration (Platform enum, TrendingVideo table)
- [x] Trending schemas (Zod validation)
- [x] API endpoints (GET /api/trending, regions, categories)
- [x] Trending controller + router
- [x] Frontend trending page
- [x] Trending filters component (platform, region, category)
- [x] Trending video card component
- [x] Trending auto-refresh component
- [x] use-trending-videos hook (infinite scroll)
- [x] use-trending-filters hook
- [x] Infinite scroll pagination (10+ videos/page)
- [x] Shared Zod schemas (trending.ts)

**Files Created:**
- Backend: 11 files (adapters, service, cache, jobs, controller, router, schemas)
- Frontend: 5 files (page, 3 components, 2 hooks)
- Database: migration for TrendingVideo
- Shared: trending.ts schemas

**Key Metrics:**
- API response time (cached): < 500ms
- YouTube quota allocation: ~5K units/day (out of 10K)
- Cache TTL: YouTube 30min, TikTok 15min
- Job frequency: Every 30 minutes

**Key Decisions Confirmed:**
- TikTok: Apify primary (not fallback) due to Research API uncertainty
- YouTube: search.list as primary fallback for mostPopular limitation
- Background jobs: Prevent cache cold starts on user requests
- Adapter pattern: Easy to add more platforms (Instagram, etc.)

## Phase 3: Download Engine (Weeks 7-9)

**Status:** IN PROGRESS (0% - Starting now)

**Objectives:**
- Implement robust video download functionality
- Support multiple format/quality selections
- Track download progress in real-time
- Handle cancellation and resume

**Deliverables:**
- [ ] yt-dlp-wrap integration
- [ ] Format/quality extraction from videos
- [ ] Download queue (BullMQ)
- [ ] Socket.IO integration (progress events)
- [ ] DownloadedVideo database model
- [ ] Download job + worker
- [ ] Download service (format selection, progress, cancellation)
- [ ] Download controller + router
- [ ] Frontend download page/modal
- [ ] Download progress component
- [ ] Format selector component
- [ ] Download history display
- [ ] API endpoints (POST /api/downloads, GET progress)
- [ ] Error handling (invalid format, network failures)
- [ ] Resume interrupted downloads

**Database Changes:**
```prisma
model DownloadedVideo {
  id              String @id @default(uuid())
  userId          String
  videoId         String
  sourceUrl       String
  fileName        String
  fileSize        Int
  format          String
  quality         String
  status          String // pending | downloading | completed | failed
  progress        Int // 0-100
  downloadedAt    DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Key Considerations:**
- yt-dlp-wrap supports AbortController for cancellation
- Socket.IO rooms per user for real-time progress
- Storage: MinIO bucket (downloaded-videos)
- Format negotiation: Ask user before download if multiple available
- Resume: Store partial files, continue from offset

## Phase 4: Upload & OAuth (Weeks 10-13)

**Status:** PENDING (0%)

**Objectives:**
- Implement Google OAuth 2.0 for YouTube
- Implement TikTok OAuth 2.0 for Inbox Upload
- Enable video re-publishing to user channels
- Track upload status and errors

**Deliverables:**
- [ ] Google OAuth 2.0 flow (youtube.upload scope)
- [ ] TikTok OAuth 2.0 flow (video.publish scope)
- [ ] OAuth callback routes
- [ ] Token storage (encrypted in ConnectedAccount)
- [ ] Token refresh logic
- [ ] YouTube upload service (metadata, thumbnail, privacy)
- [ ] TikTok Inbox Upload service (draft mode)
- [ ] Upload queue (BullMQ)
- [ ] UploadJob database model
- [ ] Channel database model
- [ ] PublishedVideo database model
- [ ] Upload controller + router
- [ ] Frontend OAuth login modals
- [ ] Channel connection UI
- [ ] Upload form (title, description, tags, privacy)
- [ ] Upload progress tracking
- [ ] API endpoints (POST /api/uploads, GET channels)
- [ ] Auto re-encoding (if needed for format compatibility)
- [ ] Proper attribution + watermarking support

**Database Changes:**
```prisma
model Channel {
  id              String @id @default(uuid())
  userId          String
  connectedAccountId String
  platform        Platform
  platformChannelId String
  channelName     String
  subscribers     Int?
  createdAt       DateTime @default(now())
}

model UploadJob {
  id              String @id @default(uuid())
  userId          String
  downloadedVideoId String
  channelId       String
  title           String
  description     String?
  tags            String[]
  privacy         String // public | unlisted | private
  status          String // pending | uploading | completed | failed
  progress        Int
  platformVideoId String?
  error           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model PublishedVideo {
  id              String @id @default(uuid())
  userId          String
  uploadJobId     String
  platform        Platform
  platformVideoId String
  title           String
  publishedAt     DateTime @default(now())
}
```

**Key Decisions:**
- TikTok: Inbox Upload ONLY (direct post deferred post audit approval)
- YouTube: Full upload with metadata support
- Token encryption: AES-256-GCM with master key
- Upload cap: 4 videos/day max to stay within quota

## Phase 5: Channel Management & Analytics (Weeks 14-16)

**Status:** PENDING (0%)

**Objectives:**
- Provide channel dashboard and management
- Aggregate video statistics
- Display analytics and engagement metrics
- Support time-series data visualization

**Deliverables:**
- [ ] Channel dashboard page
- [ ] Connected accounts UI
- [ ] Video stats aggregation service
- [ ] VideoStatsSnapshot model + partitioning
- [ ] Analytics API endpoints
- [ ] Video stats refresh job (daily)
- [ ] Time-series chart components
- [ ] Engagement rate calculations
- [ ] Channel-level aggregations
- [ ] Stats history retrieval
- [ ] Performance optimization (partitioning by date)

**Database Changes:**
```prisma
model VideoStatsSnapshot {
  id              String @id @default(uuid())
  userId          String
  publishedVideoId String
  viewCount       Int
  likeCount       Int
  commentCount    Int
  shareCount      Int
  engagementRate  Float
  snapshotDate    DateTime @default(now())
  createdAt       DateTime @default(now())

  @@index([userId, snapshotDate])
}
```

**Manual PostgreSQL Partitioning (Phase 5):**
```sql
CREATE TABLE video_stats_snapshot_2026_02 PARTITION OF video_stats_snapshot
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**Key Metrics:**
- Views, likes, comments, shares per video
- Engagement rate: (likes + comments + shares) / views
- Time-series trends (weekly/monthly)
- Channel-level aggregations

## Phase 6: Polish & Launch (Weeks 17-19)

**Status:** PENDING (0%)

**Objectives:**
- Complete security hardening
- Optimize performance
- Add comprehensive test coverage
- Prepare production deployment
- Launch publicly

**Deliverables:**
- [ ] Security audit (OWASP Top 10)
- [ ] CORS hardening (whitelist origins)
- [ ] Rate limiting tuning
- [ ] Input validation comprehensive review
- [ ] Error message sanitization
- [ ] Helmet security headers
- [ ] Database backup strategy
- [ ] API performance optimization (query analysis)
- [ ] Frontend performance (lighthouse > 90)
- [ ] Bundle size analysis
- [ ] E2E tests (Playwright)
- [ ] Load testing
- [ ] Deployment guide (Nginx, Docker, MinIO)
- [ ] Environment setup documentation
- [ ] Monitoring & alerting setup
- [ ] Logging aggregation (future: ELK)
- [ ] Public launch checklist
- [ ] Marketing materials

**Deployment Target:**
```
Single Server (Docker Compose):
- Nginx reverse proxy (API + Web)
- Express API (Node.js 22)
- PostgreSQL 17 (automated backups)
- Redis 7 (session + cache)
- MinIO (video storage)
```

**Testing Coverage:**
- Unit tests: > 80% for services
- Integration tests: Core APIs
- E2E tests: Critical user flows

## Critical Path

1. **Phase 1 Complete** → Foundation ready
2. **Phase 2 Complete** → Trending discovery live
3. **Phase 3 Complete** → Download capability ready
4. **Phase 4 Complete** → Publishing capability ready
5. **Phase 5 Complete** → Analytics ready
6. **Phase 6 Complete** → Production deployment ready

**Risk Items:**
- YouTube API quota management (mitigation: 4 uploads/day cap)
- TikTok audit approval (mitigation: Apify fallback + Inbox mode)
- Video format compatibility (mitigation: FFmpeg re-encoding available)

## Success Metrics (by Phase)

### Phase 1 ✓
- [x] Monorepo builds successfully
- [x] Auth flows work (register → login → token refresh)
- [x] Base UI renders without errors
- [x] CI/CD passes for all apps

### Phase 2 ✓
- [x] Trending API returns videos < 500ms (cached)
- [x] YouTube quota usage < 5K units/day
- [x] TikTok data flows (Apify or Research API)
- [x] Frontend infinite scroll works smoothly
- [x] Background jobs refresh cache proactively

### Phase 3 (Current)
- [ ] Download completes successfully for popular formats
- [ ] Progress tracking updates in real-time
- [ ] Can cancel/resume downloads
- [ ] Downloaded videos stored in MinIO

### Phase 4
- [ ] YouTube OAuth flow completes
- [ ] TikTok OAuth flow completes
- [ ] Video uploads with metadata
- [ ] Published videos tracked in DB

### Phase 5
- [ ] Analytics dashboard displays stats
- [ ] Time-series charts show trends
- [ ] Partitioned queries perform well

### Phase 6
- [ ] Security audit passed
- [ ] Load test handles 100+ concurrent users
- [ ] E2E tests > 80% coverage
- [ ] Production deployment successful

## Known Dependencies

| Dependency | Phase | Status | Risk |
|-----------|-------|--------|------|
| YouTube Data API key | 2 | Obtained | Quota mgmt (mitigated) |
| TikTok Research API | 2 | Optional | Apify fallback in place |
| Google OAuth 2.0 creds | 4 | Needed | TBD |
| TikTok OAuth 2.0 creds | 4 | Needed | Audit required |
| Apify account | 2 | Needed | ~$0.001/100 results |
| FFmpeg binary | 3+ | System | Auto-install needed |
| yt-dlp binary | 3+ | System | Wrapper auto-installs |

## Assumptions

1. No phased launch — all 6 phases shipped together at end of Week 19
2. Single-server deployment model (not cloud-native)
3. Self-hosted storage (MinIO) preferred over AWS S3
4. TikTok upload limited to Inbox mode initially (audit deferred)
5. YouTube quota prioritizes trending discovery over uploads
6. PostgreSQL sufficient for analytics (no need for time-series DB)

## Questions Resolved

See `/plans/260214-2218-trendvault-implementation/plan.md` for detailed validation sessions.

**Key Decisions:**
- MVP includes all 6 phases (no reduced scope)
- TikTok: Apify primary source (safe, no approval needed)
- YouTube: 4 uploads/day cap, trending gets remaining quota
- Database schema: Incremental per phase (not all upfront)
- Storage: MinIO self-hosted (not AWS S3)

## Next Actions

**Immediate (Phase 3 Start):**
1. Begin Phase 3 implementation (download engine)
2. Integrate yt-dlp-wrap into backend
3. Set up BullMQ download queue
4. Implement Socket.IO for progress events
5. Create DownloadedVideo model + migration
6. Build frontend download UI

**Upcoming (Phase 4 Planning):**
1. Obtain Google OAuth credentials
2. Outline OAuth callback flow
3. Design token storage strategy
4. Plan upload form UI

## References

- Implementation Plan: `/plans/260214-2218-trendvault-implementation/plan.md`
- Project Overview: `/docs/project-overview-pdr.md`
- System Architecture: `/docs/system-architecture.md`
- Codebase Summary: `/docs/codebase-summary.md`
