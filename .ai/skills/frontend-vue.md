# SKILL: frontend-vue (React → Vue vertical slice)

## When To Use
Migrating one React slice to Vue 3 (one phase = one slice). NOT for new standalone features.

## Required Reads
.ai/CURRENT.md · .ai/ui-architecture.md · .ai/component-contracts.md ·
.ai/design-system.md · target React slice file(s) · matching seed data.

## Execution steps

### Step 1 — inspect React slice
Identify route/view, state reads (context), data source (seedData/engines),
user interactions, tests covering it.

### Step 2 — implement Vue slice
Vue 3 `<script setup lang="ts">` under src/vue/pages|components; reuse engines/types/seed
as plain TS; compose shared UI primitives; no business logic in components; no `any`.

### Step 3 — preserve behavior
Same data, same interactions, same localStorage semantics. No feature drift.

### Step 4 — test
Vitest + @vue/test-utils: render, navigation, main interaction, loading/empty/error
(if applicable). Reuse locator style (roles/labels, minimal data-testid).

### Step 5 — verify responsive + accessibility
Keyboard access, focus ring, aria-current, responsive classes per design-system.md.

### Step 6 — retire React slice
Remove the React route/view + its imports ONLY if no other slice references it.
Update navigation registries (Sidebar config derives from router table).

### Step 7 — update CURRENT
State: slice done, React surface remaining (shrinking list).

## Verification
typecheck (vue-tsc + tsc) · vitest (affected files) · vite build · git diff scoped.

## Failure conditions
Slice depends on unmigrated shared React component → migrate dependency first or block.
>20 unrelated errors → BLOCKED report (fail closed).

## STOP condition
Commit done → STOP. Never migrate extra slices in the same phase.

## Output
STATUS / slice map / files changed / tests / commit / next slice.

## Token Rules
Read only the slice + its direct dependencies. Summarize diffs.
