# Code Quality Skill

Guidelines for maintaining code quality, executing quality gates, and diagnosing defects in Senior Java 180.

## Workflow

1. **Before Modifying**: Verify baseline quality state via `npm run typecheck` and `npm run test`.
2. **Incremental Verification**: Run `npm run lint:eslint` and `npm run typecheck` after localized code changes.
3. **Pre-Commit Verification**: Run the canonical master command:
   ```bash
   npm run quality
   ```
4. **Failure Classification**:
   - `CURRENT_PHASE_DEFECT`: Error introduced by the current change. Remediate immediately.
   - `PRE_EXISTING_DEFECT`: Legacy issue. Do not perform wide, unrequested refactors. Document and scope carefully.
   - `CONFIGURATION_DEFECT`: Tooling or configuration syntax issue. Correct configuration minimally.
   - `ENVIRONMENT_BLOCKER`: Missing tool or dependency required by an external service. Document transparently without faking.

## Rules

- No `@ts-ignore` or `@ts-expect-error` to suppress genuine type errors.
- Never use `|| true` or swallow exit codes.
- Do not add mock data or synthetic production fixtures to bypass tests.
- Always run `gitleaks detect` before staging changes to prevent credential leakage.
