# Prisma v6 → v7 Migration Guide

## Overview

Prisma v7 removes the Rust query engine sidecar, replacing it with direct driver adapters. This improves cold starts, reduces bundle size, and gives full control over connection pooling.

## Breaking Changes

| Area                 | v6                               | v7                                                                         |
| -------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| Datasource URL       | `schema.prisma` datasource block | `prisma.config.ts`                                                         |
| Generator provider   | `prisma-client-js`               | `prisma-client`                                                            |
| Client output        | `node_modules/.prisma/client`    | Custom `output` path (e.g., `../src/generated/prisma`)                     |
| Client import        | `@prisma/client`                 | `../generated/prisma/client.js` (via barrel at `src/lib/prisma-client.ts`) |
| Client instantiation | `new PrismaClient()`             | `new PrismaClient({ adapter })` with `@prisma/adapter-pg`                  |
| Engine               | Rust binary sidecar              | No engine (direct driver)                                                  |

## Migration Steps

### 1. Update Dependencies

```bash
pnpm --filter api remove @prisma/client prisma
pnpm --filter api add @prisma/client@^7.0 @prisma/adapter-pg
pnpm --filter api add -D prisma@^7.0
```

### 2. Create `prisma.config.ts`

```typescript
// apps/api/prisma.config.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // process.env used instead of env() so `prisma generate` works without DATABASE_URL.
    // For migrations, set DATABASE_URL via --env-file or export.
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/placeholder',
  },
});
```

### 3. Update `schema.prisma`

```diff
 generator client {
-  provider = "prisma-client-js"
+  provider = "prisma-client"
+  output   = "../src/generated/prisma"
 }

 datasource db {
   provider = "postgresql"
-  url      = env("DATABASE_URL")
 }
```

### 4. Update Client Instantiation (`src/lib/prisma-client.ts`)

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Re-export all types/enums from one barrel
export { PrismaClient, Prisma } from '../generated/prisma/client.js';
export { Platform, DownloadStatus, UploadStatus } from '../generated/prisma/client.js';
export type { DownloadedVideo } from '../generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

### 5. Update All Imports

Replace all `import { ... } from '@prisma/client'` with imports from `../../lib/prisma-client.js` (barrel). This centralizes Prisma dependency to one file.

### 6. Reconcile Migration History

Phase 4/5 tables were applied via `db push` without migration files. Before running new migrations:

```bash
cd apps/api

# Mark the Phase 4/5 baseline as already applied (tables exist in DB)
node --env-file=../../.env ./node_modules/.bin/prisma migrate resolve --applied 20260215_phase4_phase5_baseline

# Apply the refresh tokens migration
node --env-file=../../.env ./node_modules/.bin/prisma migrate resolve --applied 20260215_add_refresh_tokens
# OR if refresh_tokens table doesn't exist yet:
node --env-file=../../.env ./node_modules/.bin/prisma migrate dev
```

### 7. Regenerate Client

```bash
pnpm --filter api exec prisma generate
```

### 8. Add Generated Output to .gitignore

```
# Prisma generated client
apps/api/src/generated/
```

## Troubleshooting

- **"datasource url no longer supported"**: Ensure `url` is removed from `schema.prisma` datasource block and defined in `prisma.config.ts`
- **"Cannot resolve environment variable: DATABASE_URL"**: Use `process.env.DATABASE_URL` with fallback in `prisma.config.ts` instead of `env()` helper
- **Import errors after generate**: Check `output` path in generator config matches import paths; all types should come through the barrel at `src/lib/prisma-client.ts`
- **env vars for CLI**: Use `node --env-file=../../.env ./node_modules/.bin/prisma <command>` for all prisma CLI operations
