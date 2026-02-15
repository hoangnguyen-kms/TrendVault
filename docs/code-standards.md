# TrendVault Code Standards & Best Practices

**Version:** 1.1.0
**Last Updated:** 2026-02-15
**Scope:** Backend (Node.js/TypeScript), Frontend (React/TypeScript), Shared packages
**Phase 4 Updates:** OAuth patterns, encryption, token management

## General Principles

1. **DRY (Don't Repeat Yourself)** - Shared utilities, reusable components, shared types
2. **YAGNI (You Aren't Gonna Need It)** - Implement only what's needed now
3. **KISS (Keep It Simple, Stupid)** - Clear, readable code over clever solutions
4. **SRP (Single Responsibility)** - Each function/class does one thing well
5. **Type Safety** - Leverage TypeScript, avoid `any` type

## File Organization & Naming

### Backend (`apps/api/src/`)

**File Structure:**
```
modules/
├── {feature}/
│   ├── {feature}-router.ts      # Route definitions
│   ├── {feature}-controller.ts  # HTTP handlers
│   ├── {feature}-service.ts     # Business logic
│   ├── {feature}-schemas.ts     # Zod validation
│   └── {feature}-cache.ts       # Cache abstraction (if needed)
```

**Naming Conventions:**
- File names: `kebab-case.ts` (e.g., `trending-service.ts`)
- Class names: `PascalCase` (e.g., `TrendingService`)
- Function names: `camelCase` (e.g., `fetchTrending()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_PAGE_SIZE`)
- Private methods: `#privateMethod()` (ES2022 syntax)

**File Size Limits:**
- Maximum 200 lines per file (except schemas)
- If exceeding: Split into focused modules
- Example: `trending-service.ts` (adapters logic) + `trending-cache.ts` (cache layer)

### Frontend (`apps/web/src/`)

**File Structure:**
```
pages/
├── {page}/
│   ├── {page}-page.tsx              # Page component
│   ├── components/
│   │   ├── {component}.tsx
│   │   └── {component}.module.css   # Optional scoped styles
│   └── hooks/
│       └── use-{hook}.ts
```

**Naming Conventions:**
- Component files: `PascalCase.tsx` (e.g., `TrendingPage.tsx`) or `kebab-case.tsx` (e.g., `trending-page.tsx`)
- Hook files: `kebab-case.ts` (e.g., `use-trending-videos.ts`)
- Store files: `kebab-case.ts` (e.g., `auth-store.ts`)
- Utility files: `kebab-case.ts` (e.g., `api-client.ts`)
- Component names: `PascalCase` (e.g., `TrendingVideoCard`)
- Hook names: `useCamelCase` (e.g., `useTrendingVideos`)
- Constant names: `camelCase` (e.g., `defaultPageSize`)

### Shared Packages (`packages/shared-types/src/`)

**File Structure:**
```
├── {domain}.ts        # Domain-specific Zod schemas + types
├── index.ts           # Package exports
```

**Naming Conventions:**
- File names: `kebab-case.ts` (e.g., `trending.ts`)
- Schema names: `{Entity}Schema` (e.g., `TrendingVideoSchema`)
- Type names: `{Entity}` (e.g., `TrendingVideo`)
- DTO names: `{Entity}DTO` (e.g., `TrendingVideoDTO`)

## TypeScript Standards

### Type Definitions

**Prefer Interfaces for Objects:**
```typescript
interface User {
  id: string
  email: string
  name: string
}

type UserID = string  // Type alias for primitives
```

**Avoid `any` Type:**
```typescript
// ✓ GOOD
function getData(value: unknown) {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
}

// ✗ BAD
function getData(value: any) {
  return value.toUpperCase()  // No type safety
}
```

**Use Strict null Checks:**
```typescript
// ✓ GOOD
interface User {
  name: string
  avatarUrl?: string  // Optional field
}

// ✗ BAD
interface User {
  name: string | null
  avatarUrl: string | null
}
```

### Generics

**Use Generics for Reusable Code:**
```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

// Usage
const response: ApiResponse<User> = { ... }
```

### Enum vs Union Types

**Prefer Union Types for Simple Sets:**
```typescript
// ✓ GOOD
type Platform = 'YOUTUBE' | 'TIKTOK'
type VideoStatus = 'pending' | 'downloading' | 'completed' | 'failed'

// Use for database enums
enum PrismaEnum {
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
}
```

## Backend Code Patterns

### Service Layer

**Structure:**
```typescript
export class TrendingService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private adapters: IPlatformAdapter[]
  ) {}

  async fetchTrending(
    platform: Platform,
    region: string,
    page: number
  ): Promise<TrendingVideoDTO[]> {
    // 1. Validate input
    // 2. Check cache
    // 3. Fetch from adapter if miss
    // 4. Normalize response
    // 5. Persist to DB
    // 6. Cache result
    // 7. Return data
  }

  private async upsertTrendingVideos(
    videos: TrendingVideoDTO[],
    region: string
  ): Promise<void> {
    // Private helper method
  }
}
```

**Best Practices:**
- Dependency injection (constructor)
- Private methods for internal logic
- Async/await over promises
- Clear method names describing action + data

### Controller Pattern

**Structure:**
```typescript
export class TrendingController {
  constructor(private trendingService: TrendingService) {}

  async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate query params (Zod)
      // 2. Call service
      // 3. Format response
      // 4. Send response
    } catch (error) {
      next(error)  // Pass to error handler
    }
  }
}
```

**Best Practices:**
- Minimal logic (validation + service call + response)
- Error handling via try/catch + pass to middleware
- Consistent response format via api-response wrapper

### Middleware Pattern

**Structure:**
```typescript
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = decoded
    next()
  } catch (error) {
    next(error)
  }
}
```

**Best Practices:**
- Clear responsibility (one concern per middleware)
- Use `next()` to pass control
- Pass errors to error handler via `next(error)`

### Data Validation with Zod

**Structure:**
```typescript
export const TrendingQuerySchema = z.object({
  platform: z.enum(['youtube', 'tiktok', 'all']).default('all'),
  region: z.string().default('US'),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

export type TrendingQuery = z.infer<typeof TrendingQuerySchema>

// Usage in controller
const query = TrendingQuerySchema.parse(req.query)
```

**Best Practices:**
- Define schema once, export for reuse
- Use `z.infer<typeof Schema>` for type safety
- Validate at entry point (controller)
- Provide sensible defaults

### Error Handling

**Global Error Handler:**
```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err)

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors,
    })
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
}
```

**Best Practices:**
- Centralized error handling
- Don't expose sensitive details
- Log errors with context
- Return consistent error format

### Database Access with Prisma

**Pattern:**
```typescript
// ✓ GOOD: Use Prisma as is
const videos = await prisma.trendingVideo.findMany({
  where: { region: 'US', platform: 'YOUTUBE' },
  orderBy: { viewCount: 'desc' },
  take: 10,
})

// ✗ AVOID: Raw queries unless necessary
const videos = await prisma.$queryRaw`SELECT * FROM trending_videos`
```

**Best Practices:**
- Use Prisma methods (findMany, create, update, delete)
- Index frequently queried fields
- Use pagination (take/skip) for large datasets
- Validate schema changes with type-safe migrations

### Caching Pattern

**Redis Cache Wrapper:**
```typescript
export class TrendingCache {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set<T>(key: string, value: T, ttl: number) {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }

  async del(key: string) {
    await this.redis.del(key)
  }
}
```

**Best Practices:**
- Abstract cache layer (easy to swap implementations)
- TTL per cache type (not magic numbers)
- Handle cache misses gracefully
- Log cache operations for debugging

### Token Encryption Pattern (Phase 4)

**Encrypting Sensitive Tokens:**
```typescript
export class EncryptionService {
  private masterKey: Buffer

  constructor(keyHex: string) {
    this.masterKey = Buffer.from(keyHex, 'hex')
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
}
```

**Usage for OAuth Tokens:**
```typescript
// Store encrypted
const encryptedToken = encryptionService.encrypt(accessToken)
await prisma.connectedAccount.update({
  where: { id },
  data: { accessToken: encryptedToken }
})

// Retrieve & decrypt
const account = await prisma.connectedAccount.findUnique({ where: { id } })
const decryptedToken = encryptionService.decrypt(account.accessToken)
```

**Best Practices:**
- Algorithm: AES-256-GCM (authenticated encryption)
- IV: Random per encryption (prepended to ciphertext)
- Auth Tag: Integrity check (prevents tampering)
- Master Key: Environment variable (HSM in production)
- Never store plaintext tokens in database

### OAuth CSRF Protection Pattern (Phase 4)

**CSRF State Management:**
```typescript
// Generate authorization URL with state
async generateAuthorizationUrl(provider: string): Promise<string> {
  const state = crypto.randomBytes(32).toString('hex')
  const stateKey = `oauth:state:${state}`

  // Store state in Redis with 5min TTL
  await this.redis.setex(stateKey, 300, Date.now().toString())

  const url = new URL(`https://${provider}.example.com/oauth/authorize`)
  url.searchParams.set('state', state)
  url.searchParams.set('client_id', this.config.clientId)
  url.searchParams.set('redirect_uri', this.config.redirectUri)

  return url.toString()
}

// Validate state on callback
async validateState(state: string): Promise<boolean> {
  const stateKey = `oauth:state:${state}`
  const exists = await this.redis.exists(stateKey)

  if (!exists) return false

  // Delete state (one-time use)
  await this.redis.del(stateKey)
  return true
}
```

**Best Practices:**
- Generate cryptographically secure random state (32 bytes)
- Store in Redis with short TTL (5 minutes)
- Validate on callback (verify state exists)
- Delete after validation (one-time use only)
- Prevents cross-site request forgery in OAuth flow

## Frontend Code Patterns

### React Components

**Functional Components Only:**
```typescript
// ✓ GOOD: Functional component
interface TrendingVideoCardProps {
  video: TrendingVideoDTO
  onSelect: (video: TrendingVideoDTO) => void
}

export const TrendingVideoCard: React.FC<TrendingVideoCardProps> = ({
  video,
  onSelect,
}) => {
  return (
    <div onClick={() => onSelect(video)}>
      <img src={video.thumbnailUrl} alt={video.title} />
      <h3>{video.title}</h3>
      <p>{video.viewCount} views</p>
    </div>
  )
}
```

**Best Practices:**
- Named exports (not default)
- Explicit props interface
- Prop destructuring
- Minimal inline logic

### Custom Hooks

**Pattern:**
```typescript
interface UseTrendingVideosResult {
  videos: TrendingVideoDTO[]
  isLoading: boolean
  error: Error | null
  hasMore: boolean
  fetchNextPage: () => void
}

export const useTrendingVideos = (
  platform: Platform,
  region: string
): UseTrendingVideosResult => {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['trending', platform, region],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<TrendingVideoDTO[]>('/api/trending', {
        params: { platform, region, page: pageParam },
      }),
    getNextPageParam: (lastPage, allPages) => allPages.length + 1,
  })

  return {
    videos: data?.pages.flat() || [],
    isLoading,
    error: error instanceof Error ? error : null,
    hasMore: hasNextPage || false,
    fetchNextPage,
  }
}
```

**Best Practices:**
- Return clear interface (not generic object)
- Extract complex logic from components
- Reuse TanStack Query hooks
- Handle loading/error states

### Zustand Store

**Pattern:**
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
```

**Best Practices:**
- Typed state + actions
- Immutable updates
- Keep stores focused (auth, filters, not everything)
- Use hooks in components, not direct store access

### Conditional Rendering

**Patterns:**
```typescript
// ✓ GOOD: Early returns
if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />
if (!videos.length) return <EmptyState />

return <VideoGrid videos={videos} />

// ✓ GOOD: Ternary for simple conditions
return isLoading ? <Spinner /> : <Content />

// ✗ AVOID: && operator for side effects
return {loading && <Spinner />}  // Can hide errors
```

### Styling

**Use TailwindCSS Utility Classes:**
```typescript
export const TrendingVideoCard = ({ video }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:shadow-lg">
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-3 text-lg font-semibold">{video.title}</h3>
      <p className="text-sm text-gray-600">{video.viewCount} views</p>
    </div>
  )
}
```

**Best Practices:**
- Utility classes (not custom CSS)
- Consistent spacing (TW spacing scale)
- Responsive classes (mobile-first)
- Avoid inline styles

## API Design

### Request/Response Format

**Standard Response:**
```typescript
// Success
{
  success: true,
  data: { ... },
  meta: { timestamp: "2026-02-15T12:00:00Z" }
}

// Error
{
  success: false,
  error: "User not found",
  code: "NOT_FOUND"
}
```

**Pagination:**
```typescript
{
  success: true,
  data: {
    items: [ ... ],
    pagination: {
      page: 1,
      limit: 10,
      total: 100,
      hasMore: true
    }
  }
}
```

### Query Parameters

**Conventions:**
```
GET /api/trending?platform=youtube&region=US&page=1&limit=10
GET /api/users?search=john&status=active&sort=created_at
GET /api/videos?filter[category]=music&filter[duration]=short
```

**Best Practices:**
- Snake case for query params
- Limit result count (max 50)
- Support pagination
- Consistent filter naming

## Git & Version Control

### Commit Messages

**Format (Conventional Commits):**
```
type(scope): subject

body
footer
```

**Types:** feat, fix, docs, style, refactor, test, chore
**Example:**
```
feat(trending): add youtube adapter for video discovery

- Implement YouTube Data API v3 integration
- Add search.list fallback for mostPopular limitation
- Cache results in Redis with 30min TTL

Closes #123
```

**Best Practices:**
- One logical change per commit
- Clear subject (imperative mood)
- Reference issues with `Closes #123`
- Keep body under 72 chars width

### Branch Naming

**Convention:** `{type}/{scope}-{description}`
```
feat/trending-video-discovery
fix/auth-token-refresh
docs/api-documentation
```

## Testing Standards

### Backend Unit Tests

**Pattern (Vitest):**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('TrendingService', () => {
  let service: TrendingService
  let mockPrisma: any
  let mockRedis: any

  beforeEach(() => {
    mockPrisma = { trendingVideo: { findMany: vi.fn() } }
    mockRedis = { get: vi.fn(), set: vi.fn() }
    service = new TrendingService(mockPrisma, mockRedis, [])
  })

  it('should fetch trending videos from cache', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify([]))

    const result = await service.fetchTrending('youtube', 'US', 1)

    expect(result).toEqual([])
    expect(mockRedis.get).toHaveBeenCalled()
    expect(mockPrisma.trendingVideo.findMany).not.toHaveBeenCalled()
  })
})
```

**Best Practices:**
- Mock external dependencies (DB, cache, APIs)
- Test happy path + error cases
- Use descriptive test names
- One assertion per concept

### Frontend Component Tests

**Pattern (React Testing Library):**
```typescript
import { render, screen } from '@testing-library/react'
import { TrendingVideoCard } from './trending-video-card'

describe('TrendingVideoCard', () => {
  it('should display video title', () => {
    const video = {
      id: '1',
      title: 'Trending Video',
      viewCount: 1000,
      // ... other props
    }

    render(<TrendingVideoCard video={video} onSelect={() => {}} />)

    expect(screen.getByText('Trending Video')).toBeInTheDocument()
  })
})
```

**Best Practices:**
- Test user interactions, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility
- Mock API calls with MSW (Mock Service Worker)

## Documentation

### Code Comments

**When to Comment:**
```typescript
// ✓ GOOD: Explains "why", not "what"
// Cache trending videos for 30min to avoid API quota exhaustion
const cacheTTL = 30 * 60

// ✗ BAD: Obvious from code
// Set cache TTL to 30 minutes
const cacheTTL = 30 * 60
```

### JSDoc Comments (Functions)

```typescript
/**
 * Fetch trending videos from platform adapters
 * @param platform - Platform to fetch from (youtube | tiktok)
 * @param region - Region code (US, GB, JP, etc.)
 * @param page - Page number for pagination
 * @returns Array of trending videos
 * @throws {ApiError} When platform API fails
 */
async function fetchTrending(
  platform: Platform,
  region: string,
  page: number
): Promise<TrendingVideoDTO[]> {
  // ...
}
```

## Performance Optimization

### Backend

**Optimize Queries:**
```typescript
// ✓ GOOD: Use select to limit fields
const videos = await prisma.trendingVideo.findMany({
  select: {
    id: true,
    title: true,
    viewCount: true,
  },
})

// ✓ GOOD: Use index for filtering
const videos = await prisma.trendingVideo.findMany({
  where: { region: 'US' },  // indexed field
  take: 10,
})
```

**Caching Strategy:**
- Cache expensive operations (API calls, DB queries)
- Set appropriate TTL (not indefinite)
- Invalidate cache on data changes

### Frontend

**Code Splitting:**
```typescript
import { lazy, Suspense } from 'react'

const TrendingPage = lazy(() => import('./trending-page'))

export const Router = () => (
  <Suspense fallback={<Loading />}>
    <TrendingPage />
  </Suspense>
)
```

**Memoization (when needed):**
```typescript
// Only memoize if component re-renders frequently
const TrendingVideoCard = React.memo(({ video, onSelect }) => {
  return <div onClick={() => onSelect(video)}>{video.title}</div>
})
```

## Security Best Practices

### Input Validation

```typescript
// ✓ GOOD: Validate all inputs
const query = TrendingQuerySchema.parse(req.query)

// ✗ BAD: Use untrusted input directly
const page = req.query.page  // Could be anything
```

### Password Hashing

```typescript
// ✓ GOOD: Use bcrypt
const hashedPassword = await bcrypt.hash(password, 12)
const isValid = await bcrypt.compare(password, hashedPassword)
```

### Sensitive Data

```typescript
// ✓ GOOD: Encrypt OAuth tokens
const encrypted = crypto.encrypt(accessToken, masterKey)

// ✓ GOOD: Never log secrets
console.log({ user: email })  // OK
console.log({ apiKey })        // BAD
```

### SQL Injection Prevention

```typescript
// ✓ GOOD: Use Prisma (parameterized)
const user = await prisma.user.findUnique({ where: { email } })

// ✗ BAD: Raw query
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`)
```

## Linting & Formatting

### ESLint Configuration

**Enabled Rules:**
- `@typescript-eslint/no-unused-vars`
- `@typescript-eslint/no-explicit-any`
- `no-console` (warning in production)
- `no-var` (enforce const/let)

**Exceptions:**
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = parseJson(...)  // Justified when needed
```

### Prettier Formatting

**Style:**
- Spaces: 2
- Quote style: Single quotes
- Semicolons: Required
- Line width: 80 characters

**Run Before Commit:**
```bash
pnpm lint     # ESLint
pnpm format   # Prettier
```

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] No `any` types without justification
- [ ] Error handling present
- [ ] Validation on inputs
- [ ] No sensitive data in logs
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] No unused variables/imports
- [ ] Commit message follows conventions
- [ ] No hardcoded values (use constants/env)

## References

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- React Best Practices: https://react.dev/
- ESLint Rules: https://eslint.org/docs/rules/
- Prisma Docs: https://www.prisma.io/docs/
- Zod Validation: https://zod.dev/
