# run_phases.ps1 – Execute all migration phases in order
$phases = @(
    "phase-001",
    "phase-002",
    "phase-003",
    "phase-004",
    "phase-005",
    "phase-006",
    "phase-007",
    "phase-008",
    "phase-009",
    "phase-010",
    "phase-011"
)
foreach ($p in $phases) {
    Write-Host "=== Running $p ===" -ForegroundColor Cyan
    if ($p -eq "phase-006") {
        Write-Host "Phase 006 is planning‑only; skipping execution." -ForegroundColor Yellow
        continue
    }
    npm run $p
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Phase $p failed (exit code $LASTEXITCODE). Stopping the chain."
        exit $LASTEXITCODE
    }
}
Write-Host "All phases completed successfully!" -ForegroundColor Green

