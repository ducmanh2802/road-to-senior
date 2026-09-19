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

## Proven Migration Workflow (Phase 003 Verified)

```text
AUDIT
→ SELECT SLICE
→ MAP ROUTE/API/STATE
→ IMPLEMENT VUE VIEW
→ IMPLEMENT DATA FLOW
→ PRESERVE STATES
→ PRESERVE INTERACTIONS
→ TEST
→ E2E
→ RETIRE REACT SLICE
→ VERIFY
→ UPDATE STATE
→ COMMIT
→ STOP
```

### Proven Lessons from Phase 003
1. **State Hydration:** Shared persistent state should live in a Pinia store (`src/vue/stores/`) that reads directly from `localStorage[STORAGE_KEY]` and delegates calculations to pure TypeScript engines in `src/engines/`. No schema modifications or fake data.
2. **Reusable UI Primitives:** Extract clear, reusable components (`StatCard.vue`, `ProgressBar.vue`) into `src/vue/components/` with accessible roles (`progressbar`, labelled buttons, focus rings) for re-use in future slices.
3. **Explicit State Support:** The view must support loading (`LoadingSkeleton`), error (`ErrorState` with retry), empty (`EmptyState` without synthetic metrics), and success states.
4. **React Retirement Scoping:** Retire only the target slice view (`git rm src/components/views/<View>.tsx`). In `src/App.tsx`, replace the route case with a retired placeholder. Run ripgrep to confirm 0 lingering references before running verification.
5. **Route Resolution:** Lazy-loaded route components in Vue Router (`() => import(...)`) resolve asynchronously on `router.push()`; route assertions should inspect `router.currentRoute.value.matched[0].components.default`.

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

