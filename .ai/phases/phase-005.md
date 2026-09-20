# Phase 005 – Higher‑Complexity Slice Migration

**Objective**: Migrate a feature that involves multiple UI states, server data, filtering, and modals. For this example we will migrate the **Review page**.

**Steps**
1. Audit the existing React `ReviewView` component (if present) and list required UI elements.
2. Create `src/vue/pages/ReviewPage.vue` using the Pinia `useLearningStore` and existing UI primitives.
3. Add a route `/review` in `src/vue/router/index.ts`.
4. Write unit tests `src/vue/__tests__/review.test.ts`.
5. Run type‑check, tests, and build.
6. Record PASS in this file and update `.ai/CURRENT.md`.

