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
