# TrendVault Implementation Plan

**Created:** 2026-02-14 22:18
**Updated:** 2026-02-17 19:50
**Status:** Phase 6 In Progress (70% complete), Phase 7 Not Started

---

## Current Project State (Post-Revert)

### Committed Code (as of TV-8)
- Phase 1-5: ✅ Complete and committed
- Prisma v7 upgrade: ✅ Complete (TV-6)
- Refresh token rotation: ✅ Complete (TV-6)
- Worker hardening: ✅ Complete (TV-6)
- YouTube search fix: ✅ Complete (TV-3)
- CI guardrails: ✅ Complete (TV-8)
- ESLint config: ✅ Complete (TV-4)

### Uncommitted Phase 6 Work (Present but Untracked)

#### ✅ Complete Components
1. **Resilience Patterns**
   - `apps/api/src/lib/circuit-breaker.ts` ✓
   - `apps/api/src/lib/retry-with-backoff.ts` ✓
   - Applied to all platform adapters & uploaders

2. **Error Handling**
   - `apps/api/src/lib/app-errors.ts` (AppError hierarchy) ✓
   - Prisma error mapping ✓
   - `apps/api/src/middleware/not-found-handler.ts` ✓

3. **Dark Mode**
   - `apps/web/src/stores/theme-store.ts` (Zustand persisted) ✓
   - CSS variables + theme toggle ✓
   - `apps/web/src/components/layout/theme-toggle.tsx` ✓

4. **Error Pages**
   - `apps/web/src/components/ui/error-boundary.tsx` ✓
   - `apps/web/src/pages/error/not-found-page.tsx` ✓
   - `apps/web/src/pages/error/server-error-page.tsx` ✓
   - Toaster (sonner) integrated ✓

5. **Production Infrastructure**
   - `docker/docker-compose.prod.yml` ✓
   - `docker/api.Dockerfile` (multi-stage) ✓
   - `docker/web.Dockerfile` (multi-stage) ✓
   - `docker/nginx/nginx.conf` (reverse proxy) ✓
   - `docker/nginx/generate-ssl.sh` ✓

6. **Testing & Documentation**
   - `tests/load/k6-trending.js` ✓
   - `tests/load/k6-downloads.js` ✓
   - `tests/load/k6-config.js` ✓
   - Basic security audit (npm audit) ✓

7. **Legal Pages**
   - `apps/web/src/pages/legal/terms-of-service-page.tsx` ✓
   - `apps/web/src/pages/legal/privacy-policy-page.tsx` ✓
   - `apps/web/src/hooks/use-accept-tos.ts` ✓
   - `apps/web/src/hooks/use-tos-guard.ts` ✓

#### ❌ Incomplete/Not Integrated

1. **Swagger/OpenAPI** (Created but not integrated)
   - `apps/api/src/config/swagger.ts` exists ✓
   - NOT imported/called in `app.ts` or `server.ts` ❌
   - Router JSDoc annotations needed ❌

2. **Helmet CSP Hardening** (Basic only)
   - `helmet()` imported and used in `app.ts` ✓
   - Using default config (NO CSP customization) ❌
   - No `apps/api/src/config/helmet.ts` file ❌

3. **ToS Acceptance Flow** (Code exists, DB not ready)
   - Hooks created (`use-accept-tos.ts`, `use-tos-guard.ts`) ✓
   - References `user.tosAcceptedAt` field ✓
   - Field NOT in Prisma schema ❌
   - Migration NOT created ❌
   - First-login ToS modal NOT implemented ❌

### Phase 7 (Not Started)
- YouTube Shorts heuristic detection ❌
- Shorts upload hints ❌
- Trending Shorts integration ❌

---

## Phase 6 Completion Plan

### Task 1: Swagger Integration
**Status:** Not Started
**Estimated:** 30 min

1. Import `setupSwagger` in `apps/api/src/server.ts`
2. Call `setupSwagger(app)` after routes but before error handler
3. Add `NODE_ENV` check (dev only)
4. Test `/api/docs` endpoint

**Files to modify:**
- `apps/api/src/server.ts`

### Task 2: Helmet CSP Hardening
**Status:** Not Started
**Estimated:** 1 hour

1. Create `apps/api/src/config/helmet.ts`
2. Define CSP policy:
   - `default-src: 'self'`
   - `script-src: 'self' 'unsafe-inline'` (for Vite HMR in dev)
   - `style-src: 'self' 'unsafe-inline'`
   - `img-src: 'self' data: https:`
   - `connect-src: 'self' ws: wss:` (for Socket.IO)
3. Import in `app.ts` and replace `helmet()` with custom config
4. Test CSP headers with browser DevTools

**Files to create:**
- `apps/api/src/config/helmet.ts`

**Files to modify:**
- `apps/api/src/app.ts`

### Task 3: ToS Acceptance Database & Flow
**Status:** Not Started
**Estimated:** 2 hours

1. Add `tosAcceptedAt DateTime?` to User model in `schema.prisma`
2. Generate migration: `pnpm db:migrate:create`
3. Run migration: `pnpm db:migrate`
4. Create ToS modal component in `apps/web/src/components/tos/`
5. Add ToS guard in protected route wrapper
6. Implement POST `/api/auth/accept-tos` endpoint
7. Test first-login flow

**Files to create:**
- `apps/api/prisma/migrations/YYYYMMDD_add_tos_accepted_at/migration.sql`
- `apps/web/src/components/tos/tos-acceptance-modal.tsx`
- `apps/api/src/modules/auth/accept-tos-controller.ts`

**Files to modify:**
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/auth/auth-router.ts`
- `apps/web/src/app.tsx` (route guard)

### Task 4: JSDoc for Swagger
**Status:** Not Started
**Estimated:** 2 hours

Add OpenAPI JSDoc comments to all routers:
- `auth-router.ts` (5 endpoints)
- `trending-router.ts` (3 endpoints)
- `download-router.ts` (5 endpoints)
- `oauth-router.ts` (2 endpoints)
- `accounts-router.ts` (2 endpoints)
- `channels-router.ts` (2 endpoints)
- `upload-router.ts` (4 endpoints)
- `analytics-router.ts` (6 endpoints)
- `videos-router.ts` (1 endpoint)

**Files to modify:** (9 router files)

### Task 5: Commit Phase 6 Work
**Status:** Not Started
**Estimated:** 30 min

1. Stage all uncommitted Phase 6 files
2. Create commit: `git commit -m "#TV-9: feat: complete Phase 6 (error handling, dark mode, prod infra, ToS, Swagger, CSP)"`
3. Test build: `pnpm build`
4. Test type-check: `pnpm type-check`
5. Test lint: `pnpm lint`

---

## Phase 7 Implementation Plan

### Overview
**Goal:** YouTube Shorts detection, upload optimization, and trending discovery

**Key Features:**
1. Heuristic detection (duration ≤180s + aspect ratio <0.7)
2. Upload hints (categoryId=10, videoType=short)
3. Trending Shorts via Apify/SerpApi

### Task 7.1: Shorts Detection Service
**Estimated:** 2 hours

1. Create `apps/api/src/lib/shorts-detector.ts`
2. Implement heuristic:
   ```typescript
   function isShort(video: { duration: number; width?: number; height?: number }): boolean {
     const isShortDuration = video.duration <= 180;
     const aspectRatio = video.width && video.height ? video.width / video.height : null;
     const isVertical = aspectRatio ? aspectRatio < 0.7 : false;
     return isShortDuration && (isVertical || aspectRatio === null);
   }
   ```
3. Add `isShort` boolean field to:
   - TrendingVideo model
   - DownloadedVideo model
   - PublishedVideo model
4. Generate migration
5. Update trending/download/upload services to call detector

**Files to create:**
- `apps/api/src/lib/shorts-detector.ts`

**Files to modify:**
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/trending/trending-service.ts`
- `apps/api/src/modules/downloads/download-service.ts`
- `apps/api/src/modules/uploads/youtube-uploader.ts`

### Task 7.2: YouTube Shorts Upload Hints
**Estimated:** 1.5 hours

1. Modify `youtube-uploader.ts` to detect Shorts
2. Add upload hints when `isShort === true`:
   ```typescript
   snippet: {
     title,
     description,
     categoryId: '10', // Music category (Shorts-friendly)
     tags
   },
   status: {
     privacyStatus,
     videoType: 'short' // Shorts hint
   }
   ```
3. Log Shorts detection in worker
4. Test with real Shorts upload

**Files to modify:**
- `apps/api/src/modules/uploads/youtube-uploader.ts`

### Task 7.3: Trending Shorts Discovery
**Estimated:** 3 hours

**Option A: Apify Scraper** (Recommended)
1. Create Apify actor for YouTube Shorts trending
2. Update `youtube-adapter.ts` to call Apify
3. Add `isShort: true` filter to trending query
4. Cache Shorts separately (TTL 30min)

**Option B: SerpApi** (Alternative)
1. Sign up for SerpApi (free tier: 100 searches/month)
2. Create `serpapi-youtube-shorts.ts` adapter
3. Query: `https://serpapi.com/search?engine=youtube&search_query=trending+shorts`
4. Parse JSON response

**Files to modify:**
- `apps/api/src/modules/trending/adapters/youtube-adapter.ts`

**Files to create (if Option B):**
- `apps/api/src/modules/trending/adapters/serpapi-youtube-shorts.ts`

### Task 7.4: Frontend Shorts Filter
**Estimated:** 1 hour

1. Add "Shorts" toggle to trending filters
2. Update `use-trending-filters.ts` hook
3. Add query param: `?isShort=true`
4. Update trending API to filter by `isShort` field
5. Add Shorts badge to video cards

**Files to modify:**
- `apps/web/src/pages/trending/trending-filters.tsx`
- `apps/web/src/hooks/use-trending-filters.ts`
- `apps/api/src/modules/trending/trending-controller.ts`
- `apps/web/src/pages/trending/trending-video-card.tsx`

---

## Testing Checklist

### Phase 6
- [ ] Swagger docs load at `/api/docs` (dev only)
- [ ] CSP headers present in response
- [ ] Dark mode persists after refresh
- [ ] Error pages render correctly (404/500)
- [ ] ToS modal shows on first login
- [ ] ToS acceptance updates DB
- [ ] k6 load tests pass (trending, downloads)
- [ ] Production Docker build succeeds
- [ ] Nginx reverse proxy works

### Phase 7
- [ ] Shorts detected correctly (duration + aspect ratio)
- [ ] Shorts upload includes categoryId=10 + videoType=short
- [ ] Trending Shorts API returns Shorts only
- [ ] Shorts filter works in frontend
- [ ] Shorts badge displays on video cards

---

## Deployment Checklist (Post-Phase 6)

### Pre-Deployment
- [ ] Run `pnpm build` (no errors)
- [ ] Run `pnpm type-check` (no errors)
- [ ] Run `pnpm lint` (no errors)
- [ ] Run `npm audit` (no critical vulnerabilities)
- [ ] Test all API endpoints manually
- [ ] Test frontend flows (auth, trending, download, upload, analytics)

### Production Setup
- [ ] Update `.env.prod` with production values
- [ ] Generate SSL cert: `cd docker/nginx && ./generate-ssl.sh`
- [ ] Start services: `docker compose -f docker/docker-compose.prod.yml up -d`
- [ ] Run migrations: `docker compose exec api pnpm db:migrate`
- [ ] Check logs: `docker compose logs -f`
- [ ] Test health endpoint: `curl https://api.trendvault.com/api/health`

### Monitoring
- [ ] Set up log aggregation (future: ELK stack)
- [ ] Configure alerting (future: Grafana)
- [ ] Monitor PostgreSQL disk usage
- [ ] Monitor MinIO storage usage
- [ ] Monitor BullMQ job failures

---

## Known Issues & Risks

### Phase 6
1. **Helmet CSP may break Vite HMR** - Mitigation: Add `'unsafe-inline'` for dev only
2. **ToS modal UX** - Risk: Users may abandon if too intrusive - Mitigation: Single modal on first login only
3. **Nginx SSL cert expiry** - Mitigation: Document renewal process (Let's Encrypt)

### Phase 7
1. **Shorts detection false positives** - Mitigation: Conservative heuristic (duration AND aspect ratio)
2. **Apify rate limits** - Mitigation: Cache Shorts for 30min, use free tier (1000 results/month)
3. **YouTube Shorts API changes** - Risk: No official Shorts API - Mitigation: Fallback to standard upload

---

## Summary

### Current Status
- **Phase 1-5:** ✅ Committed (100%)
- **Phase 6:** 🟡 70% complete (code exists, needs integration + DB migration)
- **Phase 7:** ❌ Not started (0%)

### Next Immediate Actions (Phase 6 Completion)
1. Integrate Swagger (30min)
2. Harden Helmet CSP (1h)
3. Add ToS DB field + flow (2h)
4. Add JSDoc to routers (2h)
5. Commit Phase 6 work (30min)

**Total Phase 6 remaining:** ~6 hours

### Phase 7 Estimate
**Total:** ~7.5 hours

---

**Plan maintained in:** `.claude/plans/260214-2218-trendvault-implementation.md`
**Last updated:** 2026-02-17 19:50
