import { readFileSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Load root .env so Prisma CLI commands (migrate, seed) have DATABASE_URL
// without needing to manually export it. Node --env-file is not available here.
try {
  const envContent = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env may not exist in CI or Docker — fall back to existing env vars
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/placeholder',
  },
});
