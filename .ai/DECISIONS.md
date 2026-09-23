# Architecture Decisions

## ADR-001 — Hard cutover React → Vue 3, vertical-slice migration

Date: 2026-09-19
Status: Accepted
Decision: Replace React with Vue 3 (`<script setup lang="ts">`, Composition API) as the only
frontend. Migration proceeds in vertical slices (shell → representative page → features).
React source may remain temporarily as migration reference only; no permanent dual runtime.
Reason: approved engineering policy for the platform tracks (Vue 3 target stack).
Alternatives: keep React; side-by-side dual runtime during migration.
Trade-offs: cutover risk per slice vs. long-term single-framework simplicity.
Impact: UI layer rewritten per slice; engines/types/seed data unchanged; localStorage schema unchanged.

## ADR-002 — Keep current design palette; document mapping (do not re-theme)

Date: 2026-09-19
Status: Accepted
Decision: Phase 002 design tokens adopt the existing dark palette
(bg #0B0E14, surface #111622, elevated #151B28, border #1E293B, primary #38BDF8)
instead of the proposed #080B12/#6366F1 palette, since a good token system already exists.
Reason: "do not change an existing good palette just to match a template."
Alternatives: full re-theme to proposed palette.
Trade-offs: none material; tokens documented in .ai/design-system.md.
Impact: visual continuity; Vue components map 1:1 to existing token CSS variables.

## ADR-003 — Two storage keys during migration

Date: 2026-09-19
Status: Accepted
Decision: Vue app reads the existing localStorage key `SENIOR_JAVA_180_STATE_V1`;
certification progress later gets its own versioned key. No schema change in migration phases.
Reason: preserve existing user state and backup/import compatibility.
Alternatives: new unified schema + migration.
Trade-offs: legacy blob shape retained until a dedicated schema-migration phase.
Impact: no data loss; `validateBackupJson` semantics preserved.

## ADR-004 — TypeScript 7.0.2 (native preview) → 5.9.3 stable

Date: 2026-09-19
Status: Accepted
Decision: Downgrade devDependency `typescript` from ^7.0.2 (native-port preview) to ~5.9.3 stable.
Reason: `vue-tsc` (required for Vue SFC typecheck) is incompatible with TS7 preview
(no `./lib/tsc` export); policy requires "latest stable compatible with the ecosystem".
Alternatives: keep TS7 and skip SFC typechecking (rejected — loses type safety).
Trade-offs: version pin change; React code typechecked green on 5.9.3 (verified).
Impact: `npm run typecheck` = vue-tsc --noEmit; `npm run lint` = tsc --noEmit (both green).

## ADR-005 — npm lockfile becomes canonical (bun.lock retired)

Date: 2026-09-19
Status: Accepted
Decision: Track `package-lock.json`; remove stale `bun.lock` (cannot be regenerated —
bun is not installed in this environment).
Reason: dependency tree must have one authoritative lockfile matching the installed toolchain.
Alternatives: keep both (drift risk). Impact: npm is the canonical package manager.

## ADR-006 — English Learning Track Architecture & Integration

Date: 2026-09-19
Status: Accepted (Planning & Architecture Integration)
Decision: Integrate English as a first-class learning track with three interconnected pillars:
TOEIC (practice/examination), Practical Workplace Communication, and Technical English for Software Engineering.
Key architectural principles:
1. Reuses the existing SM-2 spaced repetition engine (`src/engines/sm2.ts`) and `ReviewCard` structure for vocabulary, grammar, and technical terms; no redundant review engine.
2. Extends `LearningTask` (`category: 'ENGLISH'`) and `EnglishSession` rather than introducing isolated schemas.
3. Fully integrated into the existing 10-stage engineering loop (LEARN → ... → EXPLAIN → DEFEND → REVIEW → INTERVIEW), specifically driving the EXPLAIN, DEFEND, and INTERVIEW stages.
4. Distinguishes practice scores and estimated performance from official certified test scores. No proprietary exam questions (original practice content only).
5. Reuses the established Vue 3 Design System (AppShell, dark palette, PageHeader, StatCard, ProgressBar, EmptyState, ErrorState, LoadingSkeleton).
6. No audio/speech AI dependencies without an approved provider; text scenario prompts, transcripts, and explicit evaluation rubrics are used.
Reason: Position Senior Java 180 as a comprehensive engineering career OS where English is an integrated engineering competency, not a generic vocabulary app.
Alternatives: Standalone English app, third-party iframe embed, generic flashcard widget.
Trade-offs: Richer data models and cross-linking to Java/AWS concepts vs. isolated learning silos.
Impact: Seamless integration with Command Center, Review, and Interview modules.
