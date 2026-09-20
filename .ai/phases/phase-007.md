# Phase 007 – Additional slice (e.g., Review page)

## Objective
Migrate an additional real React feature to Vue 3. For this placeholder we reference a **Review page**.

## Prerequisites
- Phase 005 completed (UI slice placeholder).
- Vue routing infrastructure present.

## Scope
- Create `src/vue/pages/ReviewPage.vue` (placeholder component).
- Add `/review` route to `src/vue/router/index.ts`.
- Add a unit test `src/vue/__tests__/review.test.ts`.
- Verify type‑check, unit tests, and production build.

## Out of Scope
- Backend integration (no API calls).
- Complex state management beyond a simple Pinia store.

## Implementation Plan
1. Add placeholder Vue component with basic template.
2. Register route.
3. Write a Vitest that mounts the component and asserts it renders.
4. Run lint, test, build.

## Testing Plan
- `npm run lint`
- `npm run test` (includes the new test file)
- `npm run build`

## Verification Gates
All three commands must exit with code 0.

## Documentation Updates
- Append this file to `.ai/phases/phase-007.md`.
- Record PASS in `.ai/CURRENT.md` after verification.

## Commit Message
`phase(007): migrate Review slice placeholder`

## Success Criteria
- No TypeScript errors.
- Vitest passes.
- Vite build succeeds.

## Failure Conditions
- Any command returns non‑zero.
- Component fails to mount.

## Next Phase
Phase 008 – Backend scaffolding description.

