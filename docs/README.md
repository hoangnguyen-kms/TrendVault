# TrendVault Documentation

Complete documentation for the TrendVault cross-platform trending video discovery, download, and re-upload application.

**Project Status:** Phase 2 Complete (Trending Video Discovery)
**Last Updated:** 2026-02-15

## Documentation Guide

### Start Here

**New to TrendVault?** Start with this reading order:

1. **[project-overview-pdr.md](./project-overview-pdr.md)** — Project vision, goals, phases, and decisions
2. **[codebase-summary.md](./codebase-summary.md)** — Codebase structure and Phase 2 implementation
3. **[system-architecture.md](./system-architecture.md)** — Architecture, components, and data flow

### By Role

**Project Managers:**

- [project-overview-pdr.md](./project-overview-pdr.md) — Goals, timeline, risks
- [development-roadmap.md](./development-roadmap.md) — Phase breakdown, milestones, dependencies

**Developers (Onboarding):**

- [project-overview-pdr.md](./project-overview-pdr.md) — Context and scope
- [codebase-summary.md](./codebase-summary.md) — Where to find code
- [code-standards.md](./code-standards.md) — How to write code

**Developers (Implementation):**

- [code-standards.md](./code-standards.md) — Patterns and best practices
- [system-architecture.md](./system-architecture.md) — Architecture and design
- [development-roadmap.md](./development-roadmap.md) — Next phase details

**Architects:**

- [system-architecture.md](./system-architecture.md) — Full architecture design
- [project-overview-pdr.md](./project-overview-pdr.md) — Decisions and rationale
- [development-roadmap.md](./development-roadmap.md) — Future phases and scaling

**Code Reviewers:**

- [code-standards.md](./code-standards.md) — Quality standards and patterns
- [system-architecture.md](./system-architecture.md) — Design patterns
- [codebase-summary.md](./codebase-summary.md) — File organization

## Document Overview

### project-overview-pdr.md (295 LOC)

**Purpose:** High-level project overview and Product Development Requirements

**Contains:**

- Executive summary & value proposition
- Goals and success criteria
- Technology stack
- Phase breakdown (1-6)
- Functional & non-functional requirements
- Data models
- API endpoints
- Risk assessment
- Critical dependencies
- Validation decisions log

**Best For:** Understanding project scope, goals, and design decisions

---

### system-architecture.md (652 LOC)

**Purpose:** Complete system architecture and component design

**Contains:**

- Architecture overview diagram
- Frontend layer (React 19, hooks, stores)
- Backend layer (Express 5, modules, services)
- Trending module deep-dive (adapters, cache, jobs)
- Data layer (PostgreSQL, Redis, MinIO)
- API design and endpoints
- Data flow diagrams
- Security architecture
- Performance optimization strategies
- Deployment architecture

**Best For:** Understanding how components interact and system design decisions

---

### codebase-summary.md (481 LOC)

**Purpose:** Complete guide to codebase structure and file organization

**Contains:**

- Full directory structure
- Backend module breakdown
- Frontend pages and components
- Shared packages
- Database schema and migrations
- Dependencies and scripts
- Phase 2 implementation details
- Code quality standards
- Architectural decisions

**Best For:** Finding code, understanding file organization, onboarding

---

### development-roadmap.md (434 LOC)

**Purpose:** Project timeline, milestones, and phase planning

**Contains:**

- Timeline overview (19 weeks total)
- Phase 1 completion details
- Phase 2 completion details (current)
- Phase 3 plan (Download Engine)
- Phase 4 plan (Upload & OAuth)
- Phase 5 plan (Analytics)
- Phase 6 plan (Launch)
- Critical path and dependencies
- Success metrics by phase
- Known assumptions

**Best For:** Planning, progress tracking, understanding upcoming work

---

### code-standards.md (836 LOC)

**Purpose:** Coding standards, patterns, and best practices

**Contains:**

- General principles (DRY, YAGNI, KISS, SRP)
- File organization and naming conventions
- TypeScript standards
- Backend patterns (services, controllers, middleware)
- Frontend patterns (components, hooks, stores)
- API design conventions
- Git workflow
- Testing standards
- Security best practices
- Performance optimization
- Code review checklist

**Best For:** Writing consistent, high-quality code that matches project standards

---

## Quick Links

| Question                      | Document                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| What is TrendVault?           | [project-overview-pdr.md](./project-overview-pdr.md)                                          |
| How is it structured?         | [codebase-summary.md](./codebase-summary.md)                                                  |
| How does it work?             | [system-architecture.md](./system-architecture.md)                                            |
| What's the timeline?          | [development-roadmap.md](./development-roadmap.md)                                            |
| How do I write code?          | [code-standards.md](./code-standards.md)                                                      |
| Where is file X?              | [codebase-summary.md](./codebase-summary.md)                                                  |
| How do I implement feature Y? | [code-standards.md](./code-standards.md) + [system-architecture.md](./system-architecture.md) |

## Phase Status

| Phase | Title                          | Status      | Completion |
| ----- | ------------------------------ | ----------- | ---------- |
| 1     | Foundation & Scaffolding       | COMPLETE    | 100%       |
| 2     | Trending Video Discovery       | COMPLETE    | 100%       |
| 3     | Download Engine                | IN PROGRESS | 0%         |
| 4     | Upload & OAuth                 | PENDING     | 0%         |
| 5     | Channel Management & Analytics | PENDING     | 0%         |
| 6     | Polish & Launch                | PENDING     | 0%         |

See [development-roadmap.md](./development-roadmap.md) for detailed timeline.

## Technology Stack

| Layer    | Technology                                 |
| -------- | ------------------------------------------ |
| Frontend | React 19, Vite 6, TailwindCSS 4, shadcn/ui |
| Backend  | Node.js 22, Express 5, Prisma 6, BullMQ 5  |
| Database | PostgreSQL 17, Redis 7, MinIO              |
| Monorepo | Turborepo, pnpm workspaces                 |

## Getting Started

### Development Setup

See `/README.md` in project root for setup instructions.

### Development Scripts

```bash
pnpm dev              # Start all apps
pnpm build            # Build all packages
pnpm type-check       # Type-check
pnpm lint             # Lint all packages
pnpm test             # Run tests
pnpm docker:up        # Start Docker services
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed test data
```

## Key Architectural Decisions

1. **Platform Adapter Pattern** — Strategy pattern for YouTube/TikTok
2. **Redis Caching** — TTL per platform (YouTube 30min, TikTok 15min)
3. **Background Jobs** — BullMQ warm cache every 30 minutes
4. **Service Layer** — Clear separation: router → controller → service → DB
5. **Monorepo** — Shared types, unified tooling
6. **TypeScript** — Strict mode, type-safe across frontend/backend

See [system-architecture.md](./system-architecture.md) for full architecture.

## Common Tasks

### Onboarding as Developer

1. Read [project-overview-pdr.md](./project-overview-pdr.md)
2. Skim [codebase-summary.md](./codebase-summary.md)
3. Review [code-standards.md](./code-standards.md)
4. Clone and run `pnpm dev`

### Implementing a Feature

1. Check [development-roadmap.md](./development-roadmap.md) for phase details
2. Review [system-architecture.md](./system-architecture.md) for component interactions
3. Follow patterns in [code-standards.md](./code-standards.md)
4. Write code matching established file organization

### Reviewing Code

1. Check [code-standards.md](./code-standards.md) for standards
2. Use review checklist (end of code-standards.md)
3. Verify patterns match [system-architecture.md](./system-architecture.md)

### Planning Next Phase

1. Read current phase completion in [development-roadmap.md](./development-roadmap.md)
2. Review next phase deliverables and database changes
3. Identify critical dependencies
4. Update documentation as work progresses

## Documentation Maintenance

These docs are living documents updated as the project progresses.

**Update Schedule:**

- `project-overview-pdr.md` — On phase completion (every 3-4 weeks)
- `development-roadmap.md` — Weekly with progress updates
- `system-architecture.md` — When major components added
- `codebase-summary.md` — Monthly with new modules
- `code-standards.md` — As standards evolve (less frequent)

**How to Contribute:**

1. Follow the established structure and formatting
2. Keep files focused (one document = one concern)
3. Use clear headings and tables for readability
4. Include code examples where helpful
5. Link to related documentation
6. Update timestamps when making changes

## Questions?

- **Architecture Question?** → [system-architecture.md](./system-architecture.md)
- **Code Style Question?** → [code-standards.md](./code-standards.md)
- **Project Timeline Question?** → [development-roadmap.md](./development-roadmap.md)
- **File Location Question?** → [codebase-summary.md](./codebase-summary.md)
- **Requirements Question?** → [project-overview-pdr.md](./project-overview-pdr.md)

## See Also

- **Implementation Plans:** `/plans/260214-2218-trendvault-implementation/`
- **Project README:** `/README.md`
- **Development Rules:** `/.claude/rules/development-rules.md`

---

**Last Updated:** 2026-02-15
**Phase Status:** Phase 2 Complete, Phase 3 Ready
