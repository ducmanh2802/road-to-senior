#!/usr/bin/env node
/**
 * Quality Scanner runner for Senior Java 180.
 * Runs ESLint, Gitleaks, Vitest Coverage, and checks SonarQube/Semgrep availability.
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';

function runStep(name, command, args) {
  console.log(`\n▶ [SCAN] ${name}...`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`✖ [SCAN] ${name} FAILED with code ${result.status}`);
    return false;
  }
  console.log(`✔ [SCAN] ${name} PASSED`);
  return true;
}

console.log('==================================================');
console.log('SENIOR JAVA 180 — QUALITY SCAN');
console.log('==================================================');

let hasFailure = false;

// 1. ESLint Static Analysis
if (!runStep('ESLint (Vue 3 + TypeScript)', 'npx', ['eslint', '.'])) {
  hasFailure = true;
}

// 2. Secret Scan (Gitleaks)
const hasGitleaks = spawnSync('which', ['gitleaks'], { shell: true }).status === 0;
if (hasGitleaks) {
  if (!runStep('Secret Scan (Gitleaks)', 'gitleaks', ['detect', '--no-banner', '--redact', '-v'])) {
    hasFailure = true;
  }
} else {
  console.log('ℹ [SCAN] Gitleaks binary not found in PATH.');
}

// 3. Vitest Coverage Collection
if (!runStep('Test Coverage Collection', 'npx', ['vitest', 'run', '--coverage'])) {
  hasFailure = true;
}

// 4. Semgrep Static Analysis Check
const hasSemgrep = spawnSync('which', ['semgrep'], { shell: true }).status === 0;
if (hasSemgrep) {
  if (!runStep('Static Analysis (Semgrep)', 'semgrep', ['scan', '--config=auto', 'src/'])) {
    hasFailure = true;
  }
} else {
  console.log('ℹ [SCAN] STATIC ANALYSIS (Semgrep): NOT AVAILABLE / NOT CONFIGURED in environment');
}

// 5. SonarQube Scanner Check
const sonarUrl = process.env.SONAR_HOST_URL;
if (sonarUrl) {
  console.log(`ℹ [SCAN] SonarQube configured at ${sonarUrl}`);
  // If sonar-scanner binary exists, execute it
  const hasSonarScanner = spawnSync('which', ['sonar-scanner'], { shell: true }).status === 0;
  if (hasSonarScanner) {
    if (!runStep('SonarQube Scanner', 'sonar-scanner', [])) {
      hasFailure = true;
    }
  } else {
    console.log('ℹ [SCAN] sonar-scanner CLI not installed; reporting SonarQube unexecuted.');
  }
} else {
  console.log('ℹ [SCAN] SonarQube: NOT CONFIGURED in environment.');
}

console.log('\n==================================================');
if (hasFailure) {
  console.error('✖ QUALITY SCAN FAILED');
  process.exit(1);
} else {
  console.log('✔ QUALITY SCAN COMPLETED SUCCESSFULLY');
  process.exit(0);
}
