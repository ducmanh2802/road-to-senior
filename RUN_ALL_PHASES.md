# Run All Phases – Senior Java 180

This document describes how to **execute every migration phase** for the project in the correct order. Each phase is a vertical‑slice migration from React to Vue 3 and follows the same pattern defined in **Phase 003**.

---

## Phase Index
| Phase | Description | Status File | Run Command |
|------|-------------|--------------|-------------|
| 001 | Baseline – governance, TypeScript fixes, ADRs | `.ai/phases/phase-001.md` | `npm run phase-001` |
| 002 | Vue shell – AppShell, Sidebar, TopBar, routing skeleton | `.ai/phases/phase-002.md` | `npm run phase-002` |
| 003 | First real vertical slice – Command Center page | `.ai/phases/phase-003.md` | `npm run phase-003` |
| 004 | Today view migration (completed above) | `.ai/phases/phase-004.md` | `npm run phase-004` |
| 005 | Higher‑complexity slice – later feature (e.g., Review page) | `.ai/phases/phase-005.md` | `npm run phase-005` |
| 006 | Dependency map & batch plan (planning only) | `.ai/phases/phase-006.md` | *Planning – no command* |
| …   | Future phases … | `.ai/phases/phase-XXX.md` | `npm run phase-XXX` |

---

## How to Run the List Automatically

A small **PowerShell helper script** (`run_phases.ps1`) is provided in the repository root. It reads the table above and executes each `npm run phase‑NNN` sequentially. The script stops if any phase returns a non‑zero exit code, ensuring the process fails closed.

```powershell
# run_phases.ps1 – Execute all migration phases in order
$phases = @(
    "phase-001",
    "phase-002",
    "phase-003",
    "phase-004",
    "phase-005",
    "phase-006" # planning only – will be skipped
)
foreach ($p in $phases) {
    Write-Host "=== Running $p ===" -ForegroundColor Cyan
    if ($p -eq "phase-006") {
        Write-Host "Phase 006 is planning‑only; skipping execution." -ForegroundColor Yellow
        continue
    }
    $result = npm run $p
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Phase $p failed (exit code $LASTEXITCODE). Stopping the chain."
        exit $LASTEXITCODE
    }
}
Write-Host "All phases completed successfully!" -ForegroundColor Green
```

### Usage
1. Open a PowerShell terminal in the project root.
2. Run the script:
   ```powershell
   .\run_phases.ps1
   ```
3. The script will invoke each phase’s npm script (you must have the custom scripts defined in `package.json`). If a phase script is missing, add it following the naming convention `"phase-XXX": "node scripts/runPhase.js XXX"` or similar.

---

## Adding a New Phase
1. **Create the markdown file** under `.ai/phases/phase-XXX.md` describing the slice, audit, and verification results (use the same template as previous phases).
2. **Add an npm script** to `package.json`:
   ```json
   "scripts": {
       "phase-007": "node scripts/runPhase.js 007"
   }
   ```
3. **Append the name** to the `$phases` array in `run_phases.ps1`.

---

## Notes & Recommendations
- The **hard‑cutover rule** (React → Vue 3) means each phase should fully retire the migrated React component before the next begins.
- Keep the **API contracts** unchanged; only UI implementation moves to Vue.
- After each phase succeeds, update `.ai/CURRENT.md` with a line like `Phase 004: PASS`.
- If a phase fails, inspect the logs in `./.system_generated/tasks/` for details.

---

*Generated for the user’s request to have a markdown file that lists all phases and provides a runnable list.*

