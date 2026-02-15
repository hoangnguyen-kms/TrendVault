---
title: "TrendVault Implementation Plan"
description: "Cross-platform trending video discovery, download & re-upload web app"
status: in-progress
priority: P1
effort: 19w
branch: main
tags: [react, node, postgresql, redis, bullmq, youtube-api, tiktok-api, turborepo]
created: 2026-02-14
updated: 2026-02-15
---

# TrendVault Implementation Plan

## Overview

Full-stack monorepo web app: React SPA + Express 4.x API + PostgreSQL + Redis + BullMQ + MinIO.
Turborepo with pnpm workspaces. 4 core features: trending discovery, download engine, re-upload, channel analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TanStack Query 5, Zustand 5, TailwindCSS 4, shadcn/ui |
| Backend | Node.js 22, Express 5, Prisma 6, BullMQ 5, Socket.IO 4, Passport.js |
| Storage | PostgreSQL 17, Redis 7, MinIO/S3 |
| DevOps | Docker Compose, GitHub Actions, Nginx |
| Monorepo | Turborepo, pnpm workspaces |

## Key Research Decisions

1. Express 5 - stable since late 2025, all planned middleware compatible
2. yt-dlp wrappers over raw child_process
3. YouTube mostPopular limited post-July 2025 - use search.list fallback
4. TikTok unaudited = private-only, 5 users/24hr
5. BullMQ QueueEvents.on('progress') -> Socket.IO rooms
6. AES-256-GCM with hybrid key strategy
7. Prisma 6 requires TS >= 5.1.0
8. Turborepo: export raw TS, not compiled JS
9. TailwindCSS 4 CSS-first config
10. PostgreSQL partitioning for VideoStatsSnapshot (manual creation)

## Phases

| # | Phase | Weeks | Status | File |
|---|-------|-------|--------|------|
| 1 | Foundation & Scaffolding | W1-3 | completed | [phase-01](./phase-01-foundation-and-scaffolding.md) |
| 2 | Trending Video Discovery | W4-6 | completed | [phase-02](./phase-02-trending-video-discovery.md) |
| 3 | Download Engine | W7-9 | completed | [phase-03](./phase-03-download-engine.md) |
| 4 | Upload & OAuth | W10-13 | completed | [phase-04](./phase-04-upload-and-oauth.md) |
| 5 | Channel Mgmt & Analytics | W14-16 | completed | [phase-05](./phase-05-channel-management-and-analytics.md) |
| 6 | Polish & Launch | W17-19 | pending | [phase-06](./phase-06-polish-and-launch.md) |

## Critical Dependencies

- YouTube Data API v3 key (quota: 10K units/day)
- TikTok Developer App (audit for public visibility)
- Google OAuth 2.0 credentials (youtube.upload scope)
- TikTok OAuth 2.0 credentials (video.publish scope)
- yt-dlp binary (auto-downloaded by wrapper)
- FFmpeg for video processing

## Research Reports

- [Backend & APIs](./research/researcher-01-backend-apis.md)
- [Frontend & Infra](./research/researcher-02-frontend-infra.md)
- [Requirements Summary](./requirements-summary.md)

## Validation Log

### Session 1 — 2026-02-15
**Trigger:** Initial plan creation validation
**Questions asked:** 6

#### Questions & Answers

1. **[Scope]** TikTok unaudited apps can ONLY post PRIVATE content (max 5 users/24hr). Audit process is lengthy and uncertain. How should we handle TikTok upload in Phase 4?
   - Options: Build both modes, document limitation | Inbox Upload only | Defer TikTok upload entirely
   - **Answer:** Inbox Upload only
   - **Rationale:** Safer approach — build Inbox/Draft mode only (sends to TikTok inbox for user to finalize). Avoids private-only confusion. Add Direct Post after audit approval.

2. **[Architecture]** YouTube daily quota is 10K units. search.list costs 100 units vs videos.list at 1 unit. Each upload costs 1,600 units (~6 uploads/day). How should we allocate the quota?
   - Options: Prioritize trending discovery | Prioritize uploads | Apply for quota increase first | Use third-party trending APIs
   - **Answer:** Prioritize trending discovery
   - **Rationale:** Cap uploads to 4/day (6,400 units). Reserve 3,600 for trending: ~36 search.list calls/day covering key regions. Trending is core value prop.

3. **[Scope]** Which phases constitute the MVP for initial launch?
   - Options: Phases 1-3 = MVP | Phases 1-4 = MVP | All 6 phases = MVP
   - **Answer:** All 6 phases = MVP
   - **Rationale:** No phased launch. Ship everything together after 19 weeks. Full feature set required for initial release.

4. **[Risk]** If TikTok Research API access is denied, the trending feature falls back to third-party scrapers (Apify ~$0.001/100 results). Is this acceptable?
   - Options: Apify as primary, Research API bonus | Research API primary, Apify fallback | Skip TikTok trending initially
   - **Answer:** Apify as primary, Research API bonus
   - **Rationale:** Design around Apify from the start. Lower risk — no dependency on TikTok approval. If Research API approved later, swap in as primary data source.

5. **[Architecture]** Which yt-dlp Node.js wrapper should we use for the download engine?
   - Options: yt-dlp-wrap | ytdlp-nodejs | Raw child_process
   - **Answer:** yt-dlp-wrap
   - **Rationale:** AbortController support for cancellation, event emitters for progress tracking, stream handling. More mature library with better production patterns.

6. **[Architecture]** What should be the default storage backend for production deployment?
   - Options: MinIO self-hosted | AWS S3 | Configurable, document both
   - **Answer:** Self-hosted storage (MinIO)
   - **Custom input:** "store on the self-host storage"
   - **Rationale:** S3-compatible, free, full control. Already in Docker Compose for dev. Good for single-server or small team. No cloud vendor dependency.

#### Confirmed Decisions
- TikTok upload: Inbox/Draft mode only — Direct Post deferred until audit approval
- YouTube quota: 4 uploads/day max, rest for trending discovery
- MVP: All 6 phases, no phased launch
- TikTok trending: Apify primary, Research API as enhancement
- yt-dlp wrapper: yt-dlp-wrap (AbortController + event emitters)
- Production storage: MinIO self-hosted

#### Action Items
- [ ] Phase 2: Swap TikTok adapter to use Apify as primary source, Research API as optional enhancement
- [ ] Phase 3: Update yt-dlp wrapper from generic to yt-dlp-wrap specifically
- [ ] Phase 4: Remove Direct Post implementation, keep Inbox Upload only. Add UI notice about TikTok audit status
- [ ] Phase 4: Add YouTube quota tracking with 4 uploads/day cap and 80% warning
- [ ] Phase 6: Ensure MinIO is documented as default production storage in deployment guide

#### Impact on Phases
- Phase 2: TikTok adapter architecture — Apify becomes primary, not fallback
- Phase 3: yt-dlp wrapper specified as yt-dlp-wrap (not generic choice)
- Phase 4: TikTok upload scope reduced to Inbox mode only; YouTube upload capped at 4/day
- Phase 6: Production deployment defaults to MinIO self-hosted

### Session 2 — 2026-02-15
**Trigger:** User questioned Turborepo monorepo choice; re-validation of architecture decisions
**Questions asked:** 7

#### Questions & Answers

1. **[Architecture]** The plan uses Turborepo + pnpm workspaces for 2 apps (web, api) + 2 packages (shared-types, config). For this project size, what monorepo strategy do you prefer?
   - Options: pnpm workspaces only | Keep Turborepo | No monorepo — flat structure
   - **Answer:** Keep Turborepo
   - **Rationale:** User confirms Turborepo for task orchestration, caching, parallel builds despite small project size.

2. **[Architecture]** The requirements doc says Express 5, but the plan switched to Express 4.x because "Express 5 still next stage". Express 5 has been stable since late 2025. Which do you want?
   - Options: Express 4.x (plan's choice) | Express 5 | Fastify instead
   - **Answer:** Express 5
   - **Custom input:** "Express 5 but given the architect of the current app, should we go with Express 5 with limited set of middleware? Let's say If we don't use the NOT available one, I still prefer to go with Express 5"
   - **Rationale:** Express 5 stable 14+ months. Native async/await error handling. Only use middleware confirmed compatible.

3. **[Architecture]** The requirements mention React 18/19, plan uses React 18. React 19 has been stable since Dec 2024. Which version?
   - Options: React 19 (Recommended) | React 18
   - **Answer:** React 19
   - **Rationale:** Stable 14+ months. use() hook, Actions, improved Suspense, ref as prop. shadcn/ui supports it.

4. **[Architecture]** Phase 1 creates a full Prisma schema with 8 entities + manual PostgreSQL partitioning for VideoStatsSnapshot. Only User + ConnectedAccount are used in Phase 1 (auth). Should we define all 8 entities upfront or incrementally?
   - Options: All 8 upfront | Incremental per phase | All 8 upfront, defer partitioning
   - **Answer:** Incremental per phase
   - **Rationale:** Phase 1: User + ConnectedAccount. Phase 2 adds TrendingVideo. Phase 3 adds DownloadedVideo. Cleaner migrations, less churn.

5. **[Architecture]** Express 5 middleware compatibility — all planned middleware (cors, helmet, cookie-parser, express-rate-limit, Passport.js v0.7+) confirmed compatible. Proceed?
   - Options: Proceed with Express 5 | List middleware first
   - **Answer:** Proceed with Express 5
   - **Rationale:** All middleware verified compatible. jsonwebtoken + bcrypt are pure Node (no Express dependency).

6. **[Architecture]** The plan has a shared packages/config with tsconfig presets + ESLint config. Keep the config package?
   - Options: Keep packages/config (Recommended) | Remove, use local configs
   - **Answer:** Keep packages/config
   - **Rationale:** DRY tsconfig/eslint. Standard Turborepo pattern. Easy to add more apps later.

7. **[Architecture]** The plan uses React Router 7 for frontend routing. React Router 7 merged with Remix. For a pure SPA, React Router 7 or TanStack Router?
   - Options: React Router 7 (plan's choice) | TanStack Router
   - **Answer:** React Router 7
   - **Rationale:** Most popular, well-documented. SPA mode works fine without framework features.

#### Confirmed Decisions
- Monorepo: Turborepo + pnpm workspaces — confirmed
- Express: Upgrade from 4.x to 5 — all middleware compatible
- React: Upgrade from 18 to 19 — stable, shadcn/ui supports it
- DB Schema: Incremental per phase — Phase 1 only User + ConnectedAccount
- Shared config: Keep packages/config — standard Turborepo pattern
- Router: React Router 7 — SPA mode, no framework features

#### Action Items
- [ ] Phase 1: Change Express 4.x to Express 5 throughout (package.json, imports, middleware)
- [ ] Phase 1: Change React 18 to React 19 throughout (package.json, types)
- [ ] Phase 1: Reduce Prisma schema to User + ConnectedAccount only (move other 6 entities to their respective phases)
- [ ] Phase 1: Remove VideoStatsSnapshot partitioning SQL (moved to Phase 5)
- [ ] Phase 2: Add TrendingVideo entity to Prisma schema
- [ ] Phase 3: Add DownloadedVideo entity to Prisma schema
- [ ] Phase 4: Add UploadJob + Channel + PublishedVideo entities to Prisma schema
- [ ] Phase 5: Add VideoStatsSnapshot entity + partitioning SQL to Prisma schema

#### Impact on Phases
- Phase 1: Express 4.x → 5, React 18 → 19, Prisma schema reduced to 2 entities (User, ConnectedAccount)
- Phase 2: Must add TrendingVideo migration
- Phase 3: Must add DownloadedVideo migration
- Phase 4: Must add UploadJob, Channel, PublishedVideo migrations
- Phase 5: Must add VideoStatsSnapshot + partitioning SQL migration
