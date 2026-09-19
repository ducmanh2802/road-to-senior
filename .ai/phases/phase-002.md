# PHASE 002 — Vue Application Shell

## Objective
Vue 3 hard-cutover foundation: App Shell (Sidebar/TopBar), design tokens, routing,
command palette, state primitives, one representative vertical slice.

## Completed
- Vue 3.5 + TypeScript + Vite + Vue Router + Pinia installed (hard cutover — index.html
  entry switched to /src/vue/main.ts; React source kept as migration reference only)
- AppShell / Sidebar (IA per §8) / TopBar (breadcrumb + ⌘K) with mobile drawer
- Canonical route table (22 routes incl. placeholders + catch-all)
- CommandPalette (Ctrl/Cmd+K, filter, ArrowUp/Down wrap, Enter, Esc, focus restore,
  honest "Search is not available yet")
- Primitives: PageHeader, EmptyState, ErrorState, LoadingSkeleton
- Representative vertical slice: /learning/java (LearningJavaPage)
- TypeScript 7.0.2 → 5.9.3 (vue-tsc incompatible with TS7 preview; ADR-004)

## Components
AppShell, Sidebar, TopBar, CommandPalette, PageHeader, EmptyState, ErrorState,
LoadingSkeleton, PagePlaceholder, LearningJavaPage + useActiveRoute composable.

## Routes
/, /learning, /learning/{java,spring,microservices,kafka,redis,databases,system-design},
/build{,/projects,/break-debug}, /architecture{,/aws-patterns,/decisions},
/certifications{,/aws/aif-c01}, /interview, /review{,/mistakes,/flashcards,/progress}, catch-all.
Unimplemented routes render honest PagePlaceholder.

## Design System
.ai/design-system.md — existing palette kept (ADR-002), typography/spacing/radius/
breakpoints/motion/a11y rules documented.

## Accessibility
Semantic nav/header/main, single aria-current, focus-ring, palette dialog with
combobox/listbox roles, Esc close, focus restore, real buttons, no emoji icons.

## Responsive QA
Not browser-verified (no browser tooling in env) — responsive structure implemented
(md: sidebar switch, mobile drawer, compact topbar); component tests pass in jsdom.

## Tests
6 files / 68 tests PASS (12 new Vue tests: shell, nav active state, palette keyboard,
states, slice; 56 existing React tests still green).

## Build
vue-tsc --noEmit PASS; tsc --noEmit PASS; vite build PASS (117.88 kB JS, gzip 45.31 kB
— down from 480 kB React baseline).

## Known Limitations
- Visual QA not performed in a real browser (§30 fallback used).
- No Pinia store yet (none needed for shell; registered and ready).
- React code remains as migration reference until slices complete.

## Files Changed
vite.config.ts, vitest.config.ts, tsconfig.json, package.json, index.html,
src/vue/** (new: main, App, layouts×3, components×6, pages×2, router, composable,
config, shims), .ai/{design-system,ui-architecture,component-contracts,phases/phase-002}.md,
.ai/CURRENT.md, bun.lock (vue deps).

## Commit
c997ba9

## Next Phase
Phase 003 — Command Center page
