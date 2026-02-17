# TrendVault Project Changelog

**Project Version:** 1.5.0
**Status:** Production-Ready (All Phases Complete)
**Last Updated:** 2026-02-18

## Version 1.5.0 - Phase 7: YouTube Shorts Integration (2026-02-18)

### Features

- [x] Shorts detection service (duration ≤180s + aspectRatio <0.7)
- [x] Dimension tracking (width, height, aspectRatio) on videos
- [x] Upload format selection (regular vs. Shorts)
- [x] YouTube categoryId parameter support
- [x] Shorts-specific analytics breakdown
- [x] Content type filtering (All / Shorts / Regular)
- [x] Frontend Shorts badge component
- [x] Shorts upload toggle in upload form
- [x] Shorts analytics panel in channel dashboard

### Database Changes

- TrendingVideo: Added isShort, width, height, aspectRatio
- DownloadedVideo: Added isShort, width, height, aspectRatio
- UploadJob: Added uploadAsShort, categoryId
- PublishedVideo: Added isShort, categoryId

### API Enhancements

- GET `/api/trending?contentType=all|shorts|regular` - Content filtering
- GET `/api/analytics/channels/:id/shorts-breakdown` - Shorts metrics

### New Components

- ShortsBadge.tsx - Visual indicator for Shorts
- ShortsUploadToggle.tsx - Upload format selector
- ShortsAnalyticsPanel.tsx - Shorts analytics display

### Testing

- 31 unit tests for detection, API endpoints, and analytics
- Backfill script validated on 100+ existing videos
- Detection accuracy: 95%+

### Documentation

- Detailed Phase 7 implementation guide: `/docs/phase-7-shorts-implementation.md`
- Shorts detection service documentation
- Backfill process documentation

### Bug Fixes

- None (green field implementation)

### Breaking Changes

- None (backward compatible)

---

## Version 1.4.0 - Phase 6: Polish & Launch (2026-02-17)

### Features

- [x] Circuit breaker + exponential backoff retry logic
- [x] Custom AppError hierarchy (NotFound, Conflict, Forbidden, Validation)
- [x] Prisma error mapping to AppError types
- [x] Dark mode support (Zustand + CSS variables)
- [x] ErrorBoundary for React error handling
- [x] Custom 404 and 500 error pages
- [x] Terms of Service page with acceptance flow
- [x] Privacy Policy page
- [x] First-login ToS acceptance modal
- [x] Production Docker Compose configuration
- [x] Multi-stage Dockerfiles for optimization
- [x] Nginx reverse proxy setup (SSL, gzip, rate limiting)
- [x] k6 load test scripts (trending, downloads)
- [x] Helmet security headers
- [x] CSP hardening with dev-mode allowances
- [x] Swagger/OpenAPI integration
- [x] JSDoc annotations on auth and trending routers

### Database Changes

- User: Added tosAcceptedAt field
- Migration: Create tosAcceptedAt nullable timestamp

### API Enhancements

- PATCH `/auth/accept-tos` - Accept Terms of Service
- JSDoc annotations for Swagger generation

### Frontend Enhancements

- Dark mode toggle in header
- Theme persistence via Zustand
- ToS acceptance on first login
- Improved error pages with actionable messages

### Testing

- k6 load tests for trending discovery (1000+ RPS)
- k6 load tests for downloads (concurrent users)
- Core functionality regression tests

### Documentation

- Security audit findings documented
- Production deployment guide (Docker, Nginx, backup)
- API documentation (Swagger generated from JSDoc)

### Breaking Changes

- None (Phase 6 is non-breaking enhancement)

---

## Version 1.3.0 - Phase 5: Channel Management & Analytics (2026-02-16)

### Features

- [x] Background sync jobs (6 repeatable jobs via BullMQ)
- [x] Channel metadata synchronization (6h interval)
- [x] Video list synchronization (12h interval, max 250/channel)
- [x] Stats snapshot capture (6h recent, 24h all)
- [x] Stats aggregation (90d+ daily → weekly summaries)
- [x] Partition management (auto-create next 2 months)
- [x] Analytics service (6 calculation methods)
- [x] Analytics API (6 endpoints)
- [x] Channel dashboard page
- [x] Video detail page with stats
- [x] Cross-channel analytics page
- [x] Platform comparison charts
- [x] Recharts integration for visualization

### Database Changes

- VideoStatsSnapshot: New table for time-series stats
- PublishedVideo: Added stats fields (views, likes, comments, etc.)
- PublishedVideo: Added @@unique constraint (channelId + platformVideoId)
- Table partitioning: Monthly partitions for VideoStatsSnapshot

### API Enhancements

- GET `/api/analytics/channels/:channelId/overview`
- GET `/api/analytics/channels/:channelId/videos`
- GET `/api/analytics/videos/:videoId/stats`
- GET `/api/analytics/videos/:videoId/lifecycle`
- GET `/api/analytics/cross-channel`
- GET `/api/analytics/cross-channel/compare`

### Modules Added

- sync/ (scheduler, worker, fetchers, handlers)
- analytics/ (service, router, schemas)
- videos/ (router for video detail)

### Testing

- Unit tests for sync job handlers
- Integration tests for analytics endpoints
- Data aggregation validation tests

### Performance

- 90%+ storage reduction via aggregation (daily → weekly after 90d)
- ~1000 monthly requests supported per user
- Average analytics query response: <200ms

---

## Version 1.2.0 - Phase 4: Upload & OAuth (2026-02-14)

### Features

- [x] Google OAuth 2.0 (youtube.upload scope)
- [x] TikTok OAuth 2.0 (video.publish scope)
- [x] Token encryption (AES-256-GCM)
- [x] CSRF protection (Redis state, 5min TTL)
- [x] YouTube upload service
- [x] TikTok Inbox Upload service
- [x] Upload queue (BullMQ, 3 concurrent max)
- [x] Socket.IO real-time upload progress
- [x] Connected accounts management
- [x] Channel management API
- [x] Upload history tracking
- [x] Exponential backoff retry (3 attempts)

### Database Changes

- Channel: New table for user channels
- UploadJob: New table for upload tracking
- PublishedVideo: New table for published content
- ConnectedAccount: Updated for token encryption

### API Enhancements

- POST `/api/uploads` - Initiate upload
- GET `/api/uploads` - List uploads
- DELETE `/api/uploads/:uploadId` - Cancel upload
- GET `/api/channels` - List channels
- GET `/api/accounts` - List connected accounts
- POST `/oauth/callback/:provider` - OAuth callback
- DELETE `/api/accounts/:accountId` - Disconnect account

### Modules Added

- oauth/ (authentication service)
- uploads/ (upload orchestration)
- accounts/ (connected accounts management)
- channels/ (channel API)

### Encryption

- Master key in environment (AES-256-GCM)
- Per-user key derivation (PBKDF2)
- Caching (5min TTL)

---

## Version 1.1.0 - Phase 3: Download Engine (2026-02-12)

### Features

- [x] yt-dlp integration for format extraction
- [x] BullMQ download queue with concurrency
- [x] Socket.IO real-time progress tracking
- [x] MinIO storage integration (S3-compatible)
- [x] Pre-signed URL generation (15min expiry)
- [x] Download cancellation support
- [x] Retry with exponential backoff (3 attempts)
- [x] Per-user download limit (5 concurrent)
- [x] File size guard (500MB max)
- [x] Temp file cleanup on failure
- [x] Downloads page with filters and pagination

### Database Changes

- DownloadedVideo: New table with status tracking
- DownloadStatus: New enum (PENDING, DOWNLOADING, COMPLETED, FAILED)

### API Enhancements

- POST `/api/downloads` - Initiate download
- GET `/api/downloads` - List downloads
- GET `/api/downloads/:downloadId` - Get status
- DELETE `/api/downloads/:downloadId` - Cancel
- POST `/api/downloads/:downloadId/retry` - Retry failed
- GET `/api/downloads/:downloadId/url` - Get pre-signed URL

### Storage Service

- Abstract interface for storage backends
- MinIO implementation with S3-compatibility
- Factory pattern for extensibility

### Performance

- Download deduplication (userId + platform + videoId)
- Concurrent downloads: 3/user, 10 global max
- Average download time: <60s for 100MB video

---

## Version 1.0.0 - Phases 1-2: Foundation & Trending Discovery (2026-02-10)

### Phase 1: Foundation & Scaffolding

- Turborepo monorepo setup
- PostgreSQL 17 database
- Prisma 6 ORM
- Express 5 backend
- React 19 frontend
- JWT authentication
- User registration & login
- Zustand state management
- React Router 7 navigation

### Phase 2: Trending Video Discovery

- YouTube Data API v3 integration
- TikTok Apify adapter
- Platform adapter pattern (strategy)
- Redis caching (30min YouTube, 15min TikTok)
- BullMQ background refresh (30min interval)
- TrendingVideo database model
- Trending API (GET `/api/trending`)
- Region & category filtering
- Frontend trending page with infinite scroll

### Database

- User: Authentication
- ConnectedAccount: OAuth placeholder
- TrendingVideo: Platform videos cache

### API Endpoints

- POST `/auth/register` - User registration
- POST `/auth/login` - User login
- POST `/auth/refresh` - Token refresh
- GET `/auth/me` - Current user
- GET `/api/trending` - Trending videos
- GET `/api/trending/regions` - Available regions
- GET `/api/trending/categories` - Available categories

### Frontend Pages

- Login/Register pages
- Trending discovery page
- Dashboard (scaffolded)

### Performance

- Trending API: <500ms (cached)
- YouTube quota: ~5K/day (out of 10K)
- Cache TTL: YouTube 30min, TikTok 15min
- Background refresh: Every 30 minutes

---

## Deployment Status

| Phase | Version | Status     | Date       |
| ----- | ------- | ---------- | ---------- |
| 1     | 1.0.0   | ✓ Complete | 2026-02-10 |
| 2     | 1.0.0   | ✓ Complete | 2026-02-10 |
| 3     | 1.1.0   | ✓ Complete | 2026-02-12 |
| 4     | 1.2.0   | ✓ Complete | 2026-02-14 |
| 5     | 1.3.0   | ✓ Complete | 2026-02-16 |
| 6     | 1.4.0   | ✓ Complete | 2026-02-17 |
| 7     | 1.5.0   | ✓ Complete | 2026-02-18 |

**Current Status:** Production-Ready
**Deployment Ready:** Yes
**Recommended Action:** Deploy to production
