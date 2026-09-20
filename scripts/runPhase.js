// scripts/runPhase.js
// Simple runner for migration phases. Executes lint, tests, and build for UI phases.
// Usage: node scripts/runPhase.js <phase-number>

const { execSync } = require('child_process');
const phase = process.argv[2];
if (!phase) {
  console.error('No phase supplied');
  process.exit(1);
}
console.log(`Running Phase ${phase}...`);

// Define which phases need full verification (UI slices)
const uiPhases = ['005', '007'];
if (uiPhases.includes(phase)) {
  try {
    console.log('Running lint');
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('Running tests');
    execSync('npm run test', { stdio: 'inherit' });
    console.log('Running build');
    execSync('npm run build', { stdio: 'inherit' });
  } catch (e) {
    console.error(`Phase ${phase} failed`);
    process.exit(1);
  }
} else {
  console.log('No additional commands for this phase (placeholder).');
}
process.exit(0);

