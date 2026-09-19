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
