# TrendVault System Architecture

**Version:** 1.0.0
**Status:** Phase 2 Complete
**Last Updated:** 2026-02-15

## Architecture Overview

TrendVault is a full-stack monorepo web application with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Client (React 19 + Vite)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Trending Page  │  Auth Pages  │  Dashboard  │  Layout       │  │
│  └──────────────┬───────────────────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼──────────────────────────────────────────────────┐
│                 API Server (Express 5)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Auth Routes  │  Trending Routes  │  Error Handling  │ CORS  │  │
│  └──────────┬────────────┬──────────────────────────────────────┘  │
└─────────────┼────────────┼──────────────────────────────────────────┘
              │            │
      ┌───────▼───┐  ┌─────▼──────────────┐
      │ Auth      │  │ Trending Service   │
      │ Service   │  │ - Adapters         │
      └───────┬───┘  │ - Cache Layer      │
              │      │ - Jobs             │
              │      └─────┬──────────────┘
              │            │
    ┌─────────▼────────────▼──────────────────────────┐
    │         Data Layer (Prisma ORM)                 │
    │  ┌──────────────────────────────────────────┐  │
    │  │ PostgreSQL (17)  │ Redis (7)  │ MinIO   │  │
    │  │ - Entities       │ - Cache    │ - Files │  │
    │  │ - Migrations     │ - Sessions │         │  │
    │  └──────────────────────────────────────────┘  │
    └──────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Layer (React 19)

**Location:** `apps/web/src/`

**Key Directories:**
```
web/src/
├── pages/
│   ├── auth/
│   │   ├── login-page.tsx
│   │   └── register-page.tsx
│   ├── trending/
│   │   ├── trending-page.tsx
│   │   ├── components/
│   │   │   ├── trending-filters.tsx
│   │   │   ├── trending-video-card.tsx
│   │   │   └── trending-auto-refresh.tsx
│   │   └── hooks/
│   │       ├── use-trending-filters.ts
│   │       └── use-trending-videos.ts
│   └── dashboard-page.tsx
├── components/
│   └── layout/
│       ├── app-header.tsx
│       ├── app-sidebar.tsx
│       └── root-layout.tsx
├── hooks/
│   └── use-auth.ts
├── stores/
│   └── auth-store.ts (Zustand)
├── lib/
│   ├── api-client.ts (TanStack Query)
│   ├── query-client.ts
│   └── utils.ts
└── router.tsx (React Router 7)
```

**Key Libraries:**
- **State Management:** Zustand (auth), TanStack Query (server state)
- **Routing:** React Router 7 (SPA mode)
- **UI Components:** shadcn/ui
- **Styling:** TailwindCSS 4
- **HTTP:** Fetch API (wrapped by api-client)

**Data Flow:**
1. User interacts with trending page
2. `use-trending-videos` hook calls API via TanStack Query
3. Server response cached in Query cache
4. Updates trigger re-renders via hooks
5. `use-trending-filters` manages filter state (client-side)

### 2. Backend Layer (Express 5)

**Location:** `apps/api/src/`

**Architecture Pattern:** Modular routes → Controllers → Services → Prisma ORM

```
api/src/
├── config/
│   ├── environment.ts      # Env vars validation
│   ├── database.ts         # Prisma instance
│   ├── redis.ts            # Redis client
│   └── cors.ts             # CORS configuration
├── lib/
│   ├── prisma-client.ts
│   ├── redis-client.ts
│   └── api-response.ts
├── middleware/
│   ├── auth-middleware.ts
│   ├── error-handler.ts
│   ├── rate-limiter.ts
│   ├── request-logger.ts
│   └── validate-request.ts
├── modules/
│   ├── auth/
│   │   ├── auth-router.ts
│   │   ├── auth-controller.ts
│   │   ├── auth-service.ts
│   │   └── auth-schemas.ts
│   └── trending/
│       ├── trending-router.ts
│       ├── trending-controller.ts
│       ├── trending-service.ts
│       ├── trending-service-instance.ts
│       ├── trending-cache.ts
│       ├── trending-schemas.ts
│       ├── adapters/
│       │   ├── platform-adapter.interface.ts
│       │   ├── youtube-adapter.ts
│       │   └── tiktok-adapter.ts
│       └── jobs/
│           ├── trending-refresh-job.ts
│           └── trending-refresh-worker.ts
├── app.ts                  # Express app initialization
└── server.ts               # Server startup
```

**Request Lifecycle:**
```
Request → CORS → Logger → RateLimit → Auth → Route Handler
                                          ↓
                                     Controller
                                          ↓
                                      Service
                                          ↓
                              Cache Check / DB Query
                                          ↓
                                 Normalize Response
                                          ↓
Response ← Error Handler ← API Response Wrapper
```

### 3. Trending Module (Phase 2)

**Location:** `apps/api/src/modules/trending/`

**Responsibilities:**
- Fetch trending videos from multiple platforms
- Cache results in Redis with TTL
- Persist to PostgreSQL (dedup + upsert)
- Schedule background refresh jobs
- Provide paginated API endpoints

**Components:**

#### 3.1 Platform Adapters
**Pattern:** Strategy pattern for multi-platform support

```typescript
interface IPlatformAdapter {
  fetchTrending(region: string, category?: string): Promise<TrendingVideoDTO[]>
}
```

**YouTube Adapter:**
- Uses YouTube Data API v3
- Queries: `mostPopular` (limited post-July 2025) + `search.list` fallback
- Normalizes response to `TrendingVideoDTO`
- Tracks API quota usage

**TikTok Adapter:**
- Primary: Apify (HTTP request to proxy + scraping)
- Optional: TikTok Research API (if approved)
- Normalizes response to `TrendingVideoDTO`

#### 3.2 Trending Cache
**Location:** `trending-cache.ts`

**Responsibility:** Redis key-value store abstraction

**Cache Keys:**
```
trending:youtube:{region}:{category}:{page}    → TTL 30min
trending:tiktok:{region}:{page}                → TTL 15min
trending:youtube:quota:daily                   → TTL 24h
```

**Operations:**
- `get(key)` - Retrieve cached data
- `set(key, value, ttl)` - Cache data
- `del(key)` - Invalidate cache
- `trackQuota(units)` - Increment daily quota counter

#### 3.3 Trending Service
**Location:** `trending-service.ts`

**Main orchestrator for trending discovery**

**Methods:**
- `fetchTrending(platform, region, category, page)` - Fetch with cache
- `upsertTrendingVideos(videos, region)` - Persist to DB
- `getAdapters()` - Return active adapters
- `getQuotaStatus()` - Check YouTube quota

**Flow:**
1. Check Redis cache
2. If HIT: return cached data
3. If MISS: call platform adapter
4. Normalize response
5. Upsert to PostgreSQL
6. Cache in Redis
7. Return response

#### 3.4 Background Jobs
**Framework:** BullMQ (Redis-backed job queue)

**Job: TrendingRefreshJob**
- Trigger: Every 30 minutes (repeatable job)
- Action: Refresh trending cache for all regions/platforms
- Purpose: Warm cache before user requests

**Worker: TrendingRefreshWorker**
- Listens for TrendingRefreshJob
- Calls TrendingService.fetchTrending()
- Updates PostgreSQL & Redis
- Logs job progress

**BullMQ Setup:**
```typescript
const queue = new Queue('trending-refresh', { connection: redis })
queue.add('refresh', {}, { repeat: { pattern: '0 */30 * * * *' } })
queue.process(async (job) => { /* refresh logic */ })
```

#### 3.5 API Endpoints

**GET /api/trending**
```
Query Parameters:
- platform: 'youtube' | 'tiktok' | 'all' (default: 'all')
- region: 'US' | 'GB' | 'JP' | ... (default: 'US')
- category: 'Music' | 'Gaming' | 'Movies' | '' (YouTube only)
- page: number (default: 1)
- limit: number (default: 10, max: 50)

Response:
{
  success: true,
  data: {
    videos: TrendingVideoDTO[],
    pagination: { page, limit, total, hasMore },
    cached: boolean,
    cacheExpiry: ISO8601 timestamp
  },
  meta: { timestamp, region, platform }
}
```

**GET /api/trending/regions**
```
Response:
{
  success: true,
  data: ['US', 'GB', 'JP', 'KR', 'BR', 'IN', 'DE', 'FR', 'AU', 'CA', 'MX', 'VN']
}
```

**GET /api/trending/categories**
```
Response:
{
  success: true,
  data: ['Music', 'Gaming', 'Movies', ''] // '' = General
}
```

### 4. Authentication Module (Phase 1)

**Location:** `apps/api/src/modules/auth/`

**Components:**

**Auth Service:**
- User registration (email + password)
- Login (JWT token generation)
- Token refresh (extend session)
- Password hashing (bcrypt)

**JWT Structure:**
```typescript
{
  sub: userId,        // Subject
  email: user.email,
  iat: issuedAt,
  exp: expiresIn (1h for access, 24h for refresh)
}
```

**Middleware: AuthMiddleware**
- Validates JWT from Authorization header
- Extracts user context
- Returns 401 if invalid/expired
- Allows public routes to bypass

### 5. Data Layer

#### 5.1 PostgreSQL (17)

**Prisma Schema Location:** `apps/api/prisma/schema.prisma`

**Current Entities (Phase 2):**

**User**
```prisma
model User {
  id            String @id @default(uuid())
  email         String @unique
  password      String (bcrypt hash)
  name          String
  avatarUrl     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**ConnectedAccount**
```prisma
model ConnectedAccount {
  id                String @id @default(uuid())
  userId            String
  platform          Platform (YOUTUBE | TIKTOK)
  platformUserId    String
  platformUserName  String
  accessToken       String (AES-256-GCM encrypted)
  refreshToken      String? (encrypted)
  tokenExpiresAt    DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userId, platform])
}
```

**TrendingVideo**
```prisma
model TrendingVideo {
  id                String @id @default(uuid())
  platform          Platform
  platformVideoId   String
  region            String
  category          String?
  title             String
  description       String?
  thumbnailUrl      String
  viewCount         Int
  likeCount         Int
  creatorName       String
  creatorUrl        String?
  duration          Int?
  videoUrl          String
  fetchedAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([platform, platformVideoId, region])
  @@index([region, platform])
  @@index([fetchedAt])
}
```

**Migrations:**
- `20260215075820_add_trending_video` - Adds Platform enum + TrendingVideo table

#### 5.2 Redis (7)

**Purpose:** Caching + session management + job queue

**Data Structures:**
- String: Trending data (JSON serialized)
- Counter: API quota tracking
- Hash: Session storage (future)

**TTLs:**
- Trending (YouTube): 30 minutes
- Trending (TikTok): 15 minutes
- Daily quota counter: 24 hours

#### 5.3 MinIO (S3-Compatible)

**Purpose:** Video file storage (for Phase 3+)

**Buckets:**
- `downloaded-videos` - User-downloaded videos
- `published-videos` - Re-uploaded videos with metadata

### 6. Shared Types Package

**Location:** `packages/shared-types/src/`

**Exports:** Zod schemas + TypeScript types for frontend/backend

**Trending Types:**
```typescript
// trending.ts
export const TrendingVideoDTOSchema = z.object({
  id: z.string(),
  platform: z.enum(['YOUTUBE', 'TIKTOK']),
  platformVideoId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url(),
  viewCount: z.number().min(0),
  likeCount: z.number().min(0),
  creatorName: z.string(),
  creatorUrl: z.string().url().optional(),
  duration: z.number().min(0).optional(),
  videoUrl: z.string().url(),
})

export type TrendingVideoDTO = z.infer<typeof TrendingVideoDTOSchema>
```

## Data Flow Diagrams

### Trending Discovery Flow (Phase 2)

```
User Request (Browser)
  ↓
GET /api/trending?platform=youtube&region=US&page=1
  ↓
[Trending Controller]
  ↓
[Trending Service]
  ├─→ Cache Check (Redis)
  │     ├─→ HIT: Return cached data
  │     └─→ MISS: Continue
  ├─→ Platform Adapter Selection
  │     ├─→ YouTube: search.list API call
  │     └─→ TikTok: Apify HTTP request
  ├─→ Normalize Response (TrendingVideoDTO[])
  ├─→ Upsert to PostgreSQL (dedup on platform+id+region)
  ├─→ Store in Redis Cache (TTL per platform)
  └─→ Return Paginated Response
  ↓
API Response (JSON)
  ↓
TanStack Query Cache (Client)
  ↓
React Component Re-render
  ↓
UI Display (Video Grid)
```

### Background Refresh Flow (Phase 2)

```
[BullMQ Queue]
  ↓
Every 30 minutes
  ↓
[Trending Refresh Job]
  ├─→ For each region (US, GB, JP, ...)
  └─→ For each platform (YouTube, TikTok)
  ↓
[Trending Refresh Worker]
  ├─→ Call TrendingService.fetchTrending()
  ├─→ Fetch from platform adapters
  ├─→ Upsert to PostgreSQL
  ├─→ Update Redis cache
  └─→ Log job progress
  ↓
Cache Warm
(Ready for user requests)
```

## Deployment Architecture

### Development Environment

**Docker Compose Stack:**
```yaml
services:
  postgres:
    image: postgres:17
    ports: 5433:5432
  redis:
    image: redis:7
    ports: 6379:6379
  minio:
    image: minio/minio
    ports: 9000:9000, 9001:9001
```

**Services:**
- API: http://localhost:3001
- Web: http://localhost:5173
- MinIO Console: http://localhost:9001

### Production Environment (Target)

**Single Server Deployment:**

```
┌──────────────────────────────────────────────┐
│         Docker Container (Production)        │
│  ┌───────────────────────────────────────┐  │
│  │    Nginx Reverse Proxy                │  │
│  │  - /api → Express backend             │  │
│  │  - / → React frontend (static)        │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │    Express API (Node.js 22)           │  │
│  │  - Port 3001 (internal)               │  │
│  │  - Environment-based config           │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │    PostgreSQL (Port 5432)             │  │
│  │    Redis (Port 6379)                  │  │
│  │    MinIO (Port 9000)                  │  │
│  └───────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
        ↑                       ↑
   Internet          Data Volumes
```

**Configuration via Environment Variables:**
- `NODE_ENV` - development | production
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - Token signing key
- `YOUTUBE_API_KEY` - YouTube Data API key
- `APIFY_API_KEY` - Apify credentials

## Security Architecture

### Authentication
- Password hashing: bcrypt (12 salt rounds)
- JWT tokens: HS256 signature
- Token expiry: 1h access, 24h refresh
- HTTPS only in production

### Encryption
- Sensitive data (OAuth tokens): AES-256-GCM
- Master key: Hybrid strategy (env + HSM in production)

### API Security
- CORS: Whitelist origin in production
- Rate limiting: 100 req/min per IP
- Request validation: Zod schemas
- Error handling: No sensitive leaks in responses

### Data Protection
- SQL injection: Prisma parameterized queries
- XSS: React auto-escaping + CSP headers
- CSRF: SameSite cookies (future, when auth uses cookies)

## Performance Optimization

### Caching Strategy
- **Redis:** Trending data (30min YouTube, 15min TikTok)
- **Browser:** TanStack Query cache (configurable)
- **Static:** React build artifacts served by Nginx

### Database Optimization
- **Indexes:** `TrendingVideo(region, platform)`, `TrendingVideo(fetchedAt)`
- **Pagination:** Limit results to 50 max
- **Partitioning:** `VideoStatsSnapshot` (planned Phase 5)

### API Response Time Targets
- **Cached request:** < 500ms
- **Cold cache:** < 3s (depends on platform API)
- **Infinite scroll:** 100ms per page load (cached)

## Monitoring & Observability

### Logging
- Request/response logging (Morgan)
- Error stack traces
- Job execution logs (BullMQ)

### Metrics (Future)
- API endpoint latency
- Cache hit/miss rate
- Platform API quota usage
- Job success/failure rate
- Database query performance

## Dependency Injection & Configuration

**Express App Initialization:**
```typescript
// app.ts
const app = express()
// Middleware setup (CORS, logger, rate limit)
// Route mounting (auth, trending)
// Error handler
export default app

// server.ts
import app from './app'
const server = http.createServer(app)
server.listen(process.env.PORT || 3001)
```

**Service Instantiation:**
```typescript
// trending-service-instance.ts
export const trendingService = new TrendingService(
  prisma,
  redis,
  new YouTubeAdapter(/* config */),
  new TikTokAdapter(/* config */)
)
```

## Testing Strategy

### Unit Tests
- Service methods (mocked DB/cache)
- Controller handlers
- Schema validation

### Integration Tests
- API endpoints with test database
- Cache behavior
- Adapter platform API mocks

### E2E Tests (Planned Phase 6)
- Playwright: Full user flow
- Trending discovery → Download → Publish

## Next Steps (Phases 3-6)

**Phase 3:** Add DownloadedVideo entity, implement download queue & Socket.IO progress
**Phase 4:** Add UploadJob + Channel entities, implement OAuth flows
**Phase 5:** Add VideoStatsSnapshot + partitioning, analytics aggregation
**Phase 6:** Security audit, performance testing, production deployment guide
