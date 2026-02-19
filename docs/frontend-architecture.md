# Frontend Architecture (`apps/web/`)

**Version:** 1.0.0 (Phase 8 Complete)
**Framework:** React 19 + TypeScript 5.3
**Build Tool:** Vite 6
**Routing:** React Router 7
**State Management:** Zustand (client) + TanStack Query (server)
**Design System:** Vibe Design System (v3.85.1)

## Project Structure

```
apps/web/src/
├── pages/                   # Route-level components
│   ├── auth/               # Login, Register
│   ├── trending/           # Trending discovery
│   ├── downloads/          # Download interface
│   ├── uploads/            # Upload interface
│   ├── settings/           # Connected accounts
│   ├── channels/           # Channel dashboard
│   ├── videos/             # Video detail
│   ├── analytics/          # Cross-channel analytics
│   ├── dashboard-page.tsx  # Home dashboard
│   └── index.tsx           # Route definitions
├── components/
│   ├── layout/             # App shell (header, sidebar)
│   ├── ui/                 # Reusable components
│   └── icons/              # Custom SVG icons
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── lib/                    # Utilities (API client, Socket.IO, etc.)
├── styles/                 # Global CSS + Vibe overrides
├── app.tsx                 # Root component with providers
├── router.tsx              # React Router configuration
└── main.tsx                # Entry point

package.json, vite.config.ts, tsconfig.json, ...
```

## Page Components (`pages/`)

| Page      | Route           | Phase | Features                                               |
| --------- | --------------- | ----- | ------------------------------------------------------ |
| Auth      | `/auth/*`       | 1     | Login, Register, JWT token management                  |
| Trending  | `/trending`     | 2     | Platform/region filters, infinite scroll, auto-refresh |
| Downloads | `/downloads`    | 3     | Real-time progress, history, format selection          |
| Uploads   | `/uploads`      | 4     | OAuth login, metadata editor, scheduled publishing     |
| Settings  | `/settings`     | 4     | Connected accounts, token refresh, disconnect          |
| Channels  | `/channels/:id` | 5     | Channel stats, video library, sidebar navigation       |
| Videos    | `/videos/:id`   | 5     | Video detail, stats timeline, content lifecycle        |
| Analytics | `/analytics`    | 5     | Cross-channel KPIs, comparison, trends                 |
| Dashboard | `/`             | 1     | Home page (scaffolded)                                 |

### Trending Page (`pages/trending/`)

**Structure:**

```
trending-page.tsx (main component)
├── TrendingFilters (platform, region, category)
├── TrendingAutoRefresh (toggle + interval)
└── TrendingVideoCard[] (infinite scroll)
```

**Key Implementation:**

- `use-trending-videos.ts` - TanStack Query `useInfiniteQuery` with pagination
- `use-trending-filters.ts` - Local filter state (platform, region, category)
- Infinite scroll via Intersection Observer
- Real-time content type filtering (all/shorts/regular)

### Download/Upload Pages

**Download Flow:**

1. Select video URL → `use-downloads.ts` hook
2. Fetch available formats via `GET /api/downloads/formats?url=`
3. Select format → `POST /api/downloads` (initiates job)
4. Socket.IO `download:progress` events update UI
5. Completion → file download via pre-signed MinIO URL

**Upload Flow:**

1. Authenticate via OAuth (Google, TikTok, Instagram)
2. Select downloaded video → upload form
3. Add metadata (title, description, tags, thumbnail)
4. Select platform + channel
5. `POST /api/uploads` initiates job (queued)
6. Socket.IO `upload:progress` events
7. Completion → navigation to analytics

### Channel Dashboard (`pages/channels/`)

**Components:**

- `channel-sidebar.tsx` - Channel selector with stats summary
- `channel-stats-cards.tsx` - KPI cards (views, likes, subscribers)
- `video-library-grid.tsx` - Paginated video grid
- Video cards with stats, thumbnail, duration

**Data Flow:**

- `use-channel.ts` - Fetch channel metadata
- `use-channel-videos.ts` - Paginated video list
- Recharts line chart for view trends

### Video Detail Page (`pages/videos/`)

**Features:**

- Video player (controls, fullscreen)
- Stats timeline (views, likes, comments over time)
- Content lifecycle (trending → download → upload → published)
- Metadata (creator, platform, upload date)
- Performance metrics (peak views, engagement rate)

## Layout Components (`components/layout/`)

| Component          | Purpose          | Key Features                              |
| ------------------ | ---------------- | ----------------------------------------- |
| `root-layout.tsx`  | Main app wrapper | Sidebar + header + router outlet          |
| `app-header.tsx`   | Top navigation   | Logo, search bar, theme toggle, user menu |
| `app-sidebar.tsx`  | Side navigation  | Menu links, user profile, logout          |
| `theme-toggle.tsx` | Theme switcher   | Light/dark/system dropdown                |

**Integration:**

- ThemeProvider from @vibe/core wraps root
- useThemeStore exposes `theme` and `setTheme()`
- CSS variables auto-switch on theme change

## UI Components (`components/ui/`)

| Component        | Purpose            | Implementation                         |
| ---------------- | ------------------ | -------------------------------------- |
| `vibe-card.tsx`  | Reusable card      | Vibe CSS vars, rounded corners, shadow |
| Badge components | Status/label       | Text + semantic colors                 |
| Button wrapper   | Consistent styling | Vibe tokens + hover effects            |
| Input wrapper    | Form control       | Border, focus, disabled states         |
| Select wrapper   | Dropdown           | Vibe colors, keyboard nav              |
| Skeleton         | Loading state      | Animated pulse effect                  |
| Tabs             | Tab navigation     | Vibe styling, active state             |

**SVG Icon Components (`components/icons/`):**

- 22 custom icons supplementing @vibe/icons
- Examples: `YoutubeIcon`, `TiktokIcon`, `InstagramIcon`, `DownloadIcon`, etc.
- Implement icon as SVG JSX for size/color flexibility

## Custom Hooks (`hooks/`)

### Authentication

| Hook          | Purpose                                   |
| ------------- | ----------------------------------------- |
| `use-auth.ts` | Check if user logged in, get current user |

### Data Fetching

| Hook                        | Purpose                                   | Implementation                  |
| --------------------------- | ----------------------------------------- | ------------------------------- |
| `use-trending-videos.ts`    | Paginated trending videos                 | TanStack Query useInfiniteQuery |
| `use-trending-filters.ts`   | Filter state (platform, region, category) | Zustand + URL params            |
| `use-downloads.ts`          | Download history, status                  | TanStack Query useQuery         |
| `use-uploads.ts`            | Upload history, status                    | TanStack Query useQuery         |
| `use-connected-accounts.ts` | OAuth accounts, token refresh             | TanStack Query + mutations      |
| `use-channel.ts`            | Channel metadata, stats                   | TanStack Query useQuery         |
| `use-channel-videos.ts`     | Paginated video list per channel          | TanStack Query useInfiniteQuery |
| `use-video-detail.ts`       | Video with stats timeline                 | TanStack Query useQuery         |
| `use-analytics.ts`          | Cross-channel KPIs                        | TanStack Query useQuery         |

### Real-time

| Hook                       | Purpose                       |
| -------------------------- | ----------------------------- |
| `use-download-progress.ts` | Socket.IO `download:*` events |
| `use-upload-progress.ts`   | Socket.IO `upload:*` events   |

### UI

| Hook                 | Purpose                                |
| -------------------- | -------------------------------------- |
| `use-vibe-colors.ts` | Extract CSS vars as hex (for Recharts) |

### Theme

| Hook                           | Purpose            | Details               |
| ------------------------------ | ------------------ | --------------------- |
| `useThemeStore()` (from store) | Access theme state | `theme`, `setTheme()` |

## State Management

### Zustand Stores (`stores/`)

**auth-store.ts:**

```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  setUser(user: User),
  logout(),
}
```

**theme-store.ts:**

```typescript
{
  theme: 'light' | 'dark' | 'system',
  setTheme(theme),
  // Persists to localStorage
}
```

### TanStack Query (Server State)

- Configured in `lib/query-client.ts`
- Default staleTime: 5 minutes
- Default gcTime: 10 minutes
- Used for all API data fetching (trending, downloads, uploads, analytics)

## Library Utilities (`lib/`)

| File               | Purpose               | Key Exports                                              |
| ------------------ | --------------------- | -------------------------------------------------------- |
| `api-client.ts`    | HTTP client           | Axios instance, interceptors, TanStack Query integration |
| `query-client.ts`  | TanStack Query config | QueryClient singleton                                    |
| `socket-client.ts` | Socket.IO client      | Singleton with JWT auth                                  |
| `utils.ts`         | Helpers               | Format utilities (numbers, dates, duration)              |

**API Client:**

- Base URL: `http://localhost:3001/api` (dev), set via environment
- Request interceptors: Attach JWT token
- Response interceptors: Handle errors
- Used by hooks via TanStack Query

**Socket.IO Client:**

- Auth: JWT token in handshake
- Events: `download:progress`, `upload:progress`, `oauth:*`
- Reconnection: Exponential backoff

## Styling & Theming

### Design System Architecture

**Vibe Design System (v3.85.1):**

- CSS custom properties (--primary-text-color, --positive-color, etc.)
- React components (Icon, Button, Loader, etc.)
- Automatic light/dark theme switching
- ThemeProvider manages theme attribute

**Tailwind CSS (v4 - Layout Only):**

- Flexbox/grid layout
- Spacing (margin, padding, gap)
- Sizing (width, height)
- Responsive breakpoints (sm, md, lg, xl)
- Border (without color)

**Custom Utilities (`src/styles/vibe-overrides.css`):**

- Surface classes: `.surface-primary`, `.surface-hover`
- Text classes: `.text-primary`, `.text-secondary`
- Border classes: `.border-ui`, `.border-layout`
- Semantic classes: `.text-positive`, `.bg-negative-selected`

### Styling Patterns

**Inline Styles (Vibe Tokens):**

```typescript
<div style={{
  backgroundColor: 'var(--primary-background-color)',
  color: 'var(--primary-text-color)',
  font: 'var(--font-h2-bold)',
  borderColor: 'var(--ui-border-color)',
}}>
  Content
</div>
```

**Tailwind Classes (Layout):**

```typescript
<div className="flex flex-col gap-4 p-6 sm:flex-row lg:gap-8">
  Layout content
</div>
```

**Hover Effects (Event Handlers):**

```typescript
<button
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
      'var(--primary-background-hover-color)';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
  }}
>
  Hover button
</button>
```

**Chart Colors (useVibeColors Hook):**

```typescript
const colors = useVibeColors();
<LineChart data={data}>
  <Line stroke={colors.textPrimary} />
</LineChart>
```

### Files

| File                                     | Purpose                             |
| ---------------------------------------- | ----------------------------------- |
| `src/styles/vibe-overrides.css`          | Utility classes for CSS variables   |
| `src/styles/index.css`                   | Global resets, @tailwind directives |
| `src/stores/theme-store.ts`              | Zustand theme state + persistence   |
| `src/hooks/use-vibe-colors.ts`           | Extract CSS vars as hex for charts  |
| `src/components/layout/theme-toggle.tsx` | Theme switcher UI                   |

**Import Order (Critical):**

```typescript
// main.tsx
import '@vibe/core/tokens'; // 1. Vibe tokens
import './styles/vibe-overrides.css'; // 2. Utility classes
import App from './app';
import './index.css'; // 3. Global resets
```

## Routing (`router.tsx`)

**React Router 7 Configuration:**

- Root path: `/`
- Protected routes: Auth token required (via middleware component)
- Outlet: Placed in root-layout.tsx
- Navigation: useNavigate hook

**Routes:**

```
/                           → Dashboard
/auth/login                 → Login page
/auth/register              → Register page
/auth/callback/:provider    → OAuth callback
/trending                   → Trending videos
/downloads                  → Download history
/uploads                    → Upload interface
/settings                   → Connected accounts
/channels/:channelId        → Channel detail
/videos/:videoId            → Video detail
/analytics                  → Cross-channel analytics
```

## Component Composition

**Container Pattern:**

```typescript
// Trending page container
export default function TrendingPage() {
  const { data, isLoading, error } = useTrendingVideos();
  // Data fetching + state management
  return (
    <div>
      <TrendingFilters />
      <TrendingVideoGrid videos={data} />
    </div>
  );
}

// Presentational component
function TrendingVideoCard({ video }) {
  return (
    <div style={{ backgroundColor: 'var(--primary-background-color)' }}>
      {/* Render video info */}
    </div>
  );
}
```

## Real-time Updates

**Socket.IO Integration:**

- Connected via `useEffect` in relevant components
- Events:
  - `download:started` - Job queued
  - `download:progress` - Bytes downloaded, ETA
  - `download:completed` - Download ready
  - `download:error` - Download failed
  - `upload:started` - Job queued
  - `upload:progress` - % complete, ETA
  - `upload:completed` - Video published
  - `upload:error` - Upload failed

**Example:**

```typescript
useEffect(() => {
  const socket = getSocket();

  socket.on('download:progress', (data) => {
    setProgress(data.percentage);
  });

  return () => socket.off('download:progress');
}, []);
```

## Dependencies

| Package                 | Version | Purpose                          |
| ----------------------- | ------- | -------------------------------- |
| `react`                 | ^19.0.0 | UI library                       |
| `react-router-dom`      | ^7.0.0  | Client routing                   |
| `@tanstack/react-query` | ^5.0.0  | Server state management          |
| `zustand`               | ^5.0.0  | Client state (theme, auth)       |
| `socket.io-client`      | ^4.7.0  | Real-time communication          |
| `axios`                 | ^1.0.0  | HTTP client (via TanStack Query) |
| `recharts`              | ^2.0.0  | Charts & data visualization      |
| `date-fns`              | ^4.0.0  | Date formatting                  |
| `@vibe/core`            | ^3.85.1 | Vibe UI components               |
| `@vibe/icons`           | ^1.16.0 | Vibe icons                       |
| `tailwindcss`           | ^4.0.0  | Utility CSS (layout only)        |
| `typescript`            | ^5.3.0  | Type checking                    |
| `vite`                  | ^6.0.0  | Build tool                       |

## Development Scripts

```bash
pnpm -F web dev          # Start dev server (http://localhost:5173)
pnpm -F web build        # Build for production
pnpm -F web preview      # Preview production build
pnpm -F web type-check   # TypeScript check
pnpm -F web lint         # ESLint check
pnpm -F web test         # Run tests (vitest)
```

## Configuration Files

| File             | Purpose                    |
| ---------------- | -------------------------- |
| `vite.config.ts` | Vite bundler configuration |
| `tsconfig.json`  | TypeScript configuration   |
| `package.json`   | Dependencies and scripts   |

## Best Practices

1. **Use hooks for data fetching** - Always use TanStack Query, never fetch in `useEffect`
2. **Theme-aware styling** - Use `useVibeColors()` for libraries that can't resolve CSS vars
3. **Event handlers for hover** - Don't use CSS `:hover` with inline styles
4. **Semantic HTML** - Use proper elements (button, input, label, etc.)
5. **Accessibility** - Include aria-labels, proper WCAG contrast ratios
6. **Performance** - Use React.memo for expensive components, lazy load routes
7. **Error handling** - Show meaningful error messages, implement retry logic
8. **Loading states** - Always show skeletons or loaders during data fetch

## See Also

- `/docs/design-guidelines.md` - Complete Vibe Design System styling reference
- `/README.md` - Setup and getting started
- `/docs/system-architecture.md` - Full system overview
