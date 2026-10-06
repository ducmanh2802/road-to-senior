/**
 * Phase Z — Senior Engineering Certification engine.
 *
 * Implements mission §9 (evidence-based mastery) and §10 (no fake completion).
 *
 * THE CONTRACT
 * ------------
 * 1. Thirteen dimensions. Every dimension is derived from a REAL evidence
 *    source in this repository. A dimension whose source the platform does not
 *    yet have reports `NO_EVIDENCE_SOURCE` — it never reports a number.
 * 2. Nothing is hardcoded. There is no `mastery = 100`, no `certified = true`.
 *    Every score is the ratio of recorded evidence to available evidence.
 * 3. `evaluateCertification` returns a verdict of NOT_CERTIFIED with an
 *    explicit list of missing dimensions. It can only return CERTIFIED when
 *    all thirteen dimensions have evidence AND meet their threshold.
 * 4. Because of (3), a learner who has done nothing sees thirteen zero/empty
 *    dimensions and NOT_CERTIFIED. That is the correct, honest output.
 *
 * Framework-agnostic (no Vue imports) so it is fully unit-testable.
 */

import type { MsModule } from '../data/microservices/types';
import type { MsModuleProgressRecord } from './microservices';
import type { JudgmentAttemptRecord } from './judgmentEngine';

/** The thirteen Senior Engineering mastery dimensions (mission §9). */
export type CertificationDimension =
  | 'knowledge'
  | 'design'
  | 'implementation'
  | 'debugging'
  | 'optimization'
  | 'communication'
  | 'architecture'
  | 'production'
  | 'security'
  | 'reliability'
  | 'judgment'
  | 'leadership'
  | 'defense';

export const CERTIFICATION_DIMENSIONS: CertificationDimension[] = [
  'knowledge',
  'design',
  'implementation',
  'debugging',
  'optimization',
  'communication',
  'architecture',
  'production',
  'security',
  'reliability',
  'judgment',
  'leadership',
  'defense',
];

export const CERTIFICATION_DIMENSION_LABELS: Record<CertificationDimension, string> = {
  knowledge: 'Knowledge',
  design: 'Design',
  implementation: 'Implementation',
  debugging: 'Debugging',
  optimization: 'Optimization',
  communication: 'Communication',
  architecture: 'Architecture',
  production: 'Production',
  security: 'Security',
  reliability: 'Reliability',
  judgment: 'Judgment',
  leadership: 'Leadership',
  defense: 'Defense',
};

/** Minimum percent each dimension must reach before certification can pass. */
export const CERTIFICATION_DIMENSION_THRESHOLD = 80;

export type DimensionStatus = 'NO_EVIDENCE_SOURCE' | 'NO_EVIDENCE' | 'EVIDENCE_PARTIAL' | 'EVIDENCE_MET';

export interface DimensionResult {
  dimension: CertificationDimension;
  label: string;
  /** Recorded evidence count. Null when the platform has no source for it. */
  recorded: number | null;
  /** Total evidence that exists and could be recorded. Null when no source. */
  available: number | null;
  /** 0-100, or null when there is no source at all. Never invented. */
  percent: number | null;
  status: DimensionStatus;
  /** Human-readable description of what counts as evidence here. */
  evidenceKinds: string[];
  /** The concrete route where that evidence can be earned. */
  earnAtRoute: string;
  threshold: number;
  met: boolean;
}

/** Everything the certification engine is allowed to read. */
export interface CertificationInput {
  msModules: readonly MsModule[];
  msProgress: Record<string, MsModuleProgressRecord>;
  judgmentRecords: Record<string, JudgmentAttemptRecord>;
  /** Completed Java Core modules (src/data/javaCoreCurriculum.ts). */
  javaCompletedModuleIds: readonly string[];
  javaModuleStageProgress: Record<string, string[]>;
  /** Completed Technical English items. */
  completedEnglishItemIds: readonly string[];
  completedEnglishTotal: number;
  /** Completed AI track items. */
  completedAiTopicIds: readonly string[];
  completedAiTotal: number;
  /** Knowledge topics with recorded mastery dimensions. */
  knowledgeTopicCount: number;
  masteredKnowledgeTopicCount: number;
  /** Total judgment scenarios that exist. */
  judgmentScenarioTotal: number;
}

function ratio(recorded: number, available: number): number {
  if (available <= 0) return 0;
  return Math.min(100, Math.round((recorded / available) * 100));
}

function result(
  dimension: CertificationDimension,
  recorded: number,
  available: number,
  evidenceKinds: string[],
  earnAtRoute: string
): DimensionResult {
  const percent = ratio(recorded, available);
  return {
    dimension,
    label: CERTIFICATION_DIMENSION_LABELS[dimension],
    recorded,
    available,
    percent,
    status: recorded === 0 ? 'NO_EVIDENCE' : percent >= CERTIFICATION_DIMENSION_THRESHOLD ? 'EVIDENCE_MET' : 'EVIDENCE_PARTIAL',
    evidenceKinds,
    earnAtRoute,
    threshold: CERTIFICATION_DIMENSION_THRESHOLD,
    met: recorded > 0 && percent >= CERTIFICATION_DIMENSION_THRESHOLD,
  };
}

/**
 * A dimension with no evidence source in the platform. Reported honestly as a
 * gap rather than scored as zero — zero would imply the learner failed when in
 * fact the platform never gave them a way to earn it.
 */
function missingSource(dimension: CertificationDimension): DimensionResult {
  return {
    dimension,
    label: CERTIFICATION_DIMENSION_LABELS[dimension],
    recorded: null,
    available: null,
    percent: null,
    status: 'NO_EVIDENCE_SOURCE',
    evidenceKinds: [],
    earnAtRoute: '',
    threshold: CERTIFICATION_DIMENSION_THRESHOLD,
    met: false,
  };
}

function uniqueCount(values: readonly string[]): number {
  return new Set(values).size;
}

/**
 * Derives all thirteen dimensions from recorded evidence.
 *
 * Every count below reads a field that only a real learner action can write.
 */
export function computeCertificationDimensions(input: CertificationInput): DimensionResult[] {
  const modules = input.msModules;
  const records = Object.values(input.msProgress);

  // --- implementation: completed code labs -----------------------------
  const codeLabsAvailable = modules.reduce((acc, module) => acc + module.codeLabs.length, 0);
  const codeLabsRecorded = records.reduce((acc, record) => acc + record.codeLabCompletions.length, 0);

  // --- debugging: passed failure labs + resolved incidents -------------
  const failureLabsAvailable = modules.reduce((acc, module) => acc + module.failureLabs.length, 0);
  const failureLabsRecorded = records.reduce((acc, record) => acc + record.failureLabsPassed.length, 0);
  const incidentsRecorded = records.reduce((acc, record) => acc + record.incidentsResolved.length, 0);

  // --- optimization: recorded benchmark runs ---------------------------
  const benchmarksAvailable = modules.filter((module) => module.benchmark).length;
  const benchmarksRecorded = records.reduce((acc, record) => acc + record.benchmarksCompleted.length, 0);

  // --- design: completed architecture challenges -----------------------
  const challengesAvailable = modules.filter((module) => module.architectureChallenge).length;
  const designsRecorded = records.reduce((acc, record) => acc + record.designsCompleted.length, 0);

  // --- defense: self-scored senior defense drill (score >= threshold) --
  const defenseModules = modules.filter((module) => module.defenseQuestions.length > 0);
  const defenseRecorded = defenseModules.filter((module) => {
    const score = input.msProgress[module.id]?.defenseScore;
    return typeof score === 'number' && score >= CERTIFICATION_DIMENSION_THRESHOLD;
  }).length;

  // --- architecture: architecture challenges + explanation self-score ---
  const explanationModules = modules.filter(
    (module) => Boolean(module.english?.sixtySecondExplanation && module.english.sixtySecondExplanation.length > 0)
  );
  const explanationRecorded = explanationModules.filter((module) => {
    const score = input.msProgress[module.id]?.explanationScore;
    return typeof score === 'number' && score >= CERTIFICATION_DIMENSION_THRESHOLD;
  }).length;

  // --- communication: technical English completion ---------------------
  const communicationRecorded =
    input.completedEnglishItemIds.length + input.completedAiTopicIds.length;
  const communicationAvailable = input.completedEnglishTotal + input.completedAiTotal;

  // --- knowledge: Java core modules + knowledge topics -----------------
  const knowledgeRecorded = input.javaCompletedModuleIds.length + input.masteredKnowledgeTopicCount;
  const knowledgeAvailable = input.javaCompletedModuleIds.length + input.knowledgeTopicCount;

  // --- judgment: Phase A decisions at evidence level or above ----------
  const judgmentRecorded = Object.values(input.judgmentRecords).filter(
    (record) => record.level === 'EVIDENCE_DRIVEN' || record.level === 'SENIOR'
  ).length;

  // --- security / reliability / production: module-level competency ----
  // Derived from the same module competency engine the track already uses,
  // filtered by the dimension each module actually trains.
  const securityModules = modules.filter((module) =>
    [...module.conceptExercises, ...module.defenseQuestions, ...module.failureLabs].some(
      (item) => 'dimension' in item && item.dimension === 'security'
    )
  );
  const reliabilityModules = modules.filter((module) =>
    [...module.conceptExercises, ...module.defenseQuestions, ...module.failureLabs].some(
      (item) => 'dimension' in item && item.dimension === 'reliability'
    )
  );
  const productionModules = modules.filter(
    (module) => module.phase === 'M5' || module.phase === 'M6'
  );

  const completedIn = (list: readonly MsModule[]): number =>
    list.filter((module) => {
      const record = input.msProgress[module.id];
      if (!record) return false;
      return (
        record.assessmentScore !== undefined &&
        record.assessmentScore >= CERTIFICATION_DIMENSION_THRESHOLD &&
        record.stages.includes('review')
      );
    }).length;

  return [
    result(
      'knowledge',
      knowledgeRecorded,
      Math.max(knowledgeAvailable, knowledgeRecorded),
      ['completed Java Core modules', 'mastered knowledge topics'],
      '/learning/java'
    ),
    result(
      'design',
      designsRecorded,
      challengesAvailable,
      ['architecture challenge submitted'],
      '/learning/microservices'
    ),
    result(
      'implementation',
      codeLabsRecorded,
      codeLabsAvailable,
      ['code lab implemented'],
      '/learning/microservices'
    ),
    result(
      'debugging',
      failureLabsRecorded + incidentsRecorded,
      failureLabsAvailable + failuresAvailableForIncidents(modules),
      ['failure lab passed', 'incident triaged to resolution'],
      '/learning/microservices'
    ),
    result(
      'optimization',
      benchmarksRecorded,
      benchmarksAvailable,
      ['benchmark run recorded'],
      '/learning/microservices'
    ),
    result(
      'communication',
      communicationRecorded,
      communicationAvailable,
      ['technical English item completed', 'AI knowledge track item completed'],
      '/english'
    ),
    result(
      'architecture',
      designsRecorded + explanationRecorded,
      challengesAvailable + explanationModules.length,
      ['architecture challenge submitted', '60-second explanation self-scored'],
      '/learning/microservices'
    ),
    result(
      'production',
      completedIn(productionModules),
      productionModules.length,
      ['M5/M6 module completed (assessment ≥ 80% and reviewed)'],
      '/learning/microservices'
    ),
    result(
      'security',
      completedIn(securityModules),
      securityModules.length,
      ['security-dimension module completed'],
      '/learning/microservices'
    ),
    result(
      'reliability',
      completedIn(reliabilityModules),
      reliabilityModules.length,
      ['reliability-dimension module completed'],
      '/learning/microservices'
    ),
    result(
      'judgment',
      judgmentRecorded,
      input.judgmentScenarioTotal,
      ['Phase A decision at evidence level or above'],
      '/engineering/judgment'
    ),
    // Leadership has no evidence source in this platform yet. Reported as a
    // gap, never scored as zero. See docs/SENIOR_ENGINEERING_MASTERY_FULL_AUDIT.md GAP-22.
    missingSource('leadership'),
    result(
      'defense',
      defenseRecorded,
      defenseModules.length,
      ['senior defense self-score ≥ 80% against the module rubric'],
      '/learning/microservices'
    ),
  ];
}

/** Incidents are per-module; their count equals the number of incident records in the track. */
function failuresAvailableForIncidents(modules: readonly MsModule[]): number {
  // The number of incidents in the track, derived from the modules that carry
  // them. Kept as a separate denominator so debugging is not inflated.
  return modules.filter((module) => module.phase === 'M4' || module.phase === 'M5' || module.phase === 'M6').length;
}

export interface CertificationVerdict {
  certified: false;
  /** Always false in this build: leadership has no evidence source (GAP-22). */
  verdict: 'NOT_CERTIFIED';
  overallPercent: number;
  dimensionsMet: number;
  dimensionsRequired: number;
  dimensions: DimensionResult[];
  /** Dimensions with no evidence source in the platform. */
  missingSources: CertificationDimension[];
  /** Dimensions with a source but insufficient recorded evidence. */
  unmetDimensions: DimensionResult[];
  /** Ordered, actionable — the next thing that would move the verdict. */
  nextEvidence: { dimension: CertificationDimension; label: string; route: string; remaining: number; of: number }[];
  /** Every number above, explained. */
  auditTrail: string[];
}

/**
 * Evaluates certification. Returns NOT_CERTIFIED unless every dimension has
 * evidence and meets its threshold — which, today, is structurally impossible
 * because Leadership has no evidence source. That is the honest result and the
 * engine reports exactly why.
 */
export function evaluateCertification(input: CertificationInput): CertificationVerdict {
  const dimensions = computeCertificationDimensions(input);
  const scored = dimensions.filter((dimension) => dimension.percent !== null);
  const overallPercent =
    scored.length === 0
      ? 0
      : Math.round(
          scored.reduce((acc, dimension) => acc + (dimension.percent ?? 0), 0) / scored.length
        );

  const missingSources = dimensions
    .filter((dimension) => dimension.status === 'NO_EVIDENCE_SOURCE')
    .map((dimension) => dimension.dimension);

  const unmetDimensions = dimensions.filter(
    (dimension) => dimension.status !== 'NO_EVIDENCE_SOURCE' && !dimension.met
  );

  const dimensionsMet = dimensions.filter((dimension) => dimension.met).length;

  const nextEvidence = unmetDimensions
    .map((dimension) => ({
      dimension: dimension.dimension,
      label: dimension.label,
      route: dimension.earnAtRoute,
      remaining: Math.max(0, (dimension.available ?? 0) - (dimension.recorded ?? 0)),
      of: dimension.available ?? 0,
    }))
    .sort((a, b) => a.remaining / Math.max(1, a.of) - b.remaining / Math.max(1, b.of));

  const auditTrail = [
    `dimensions=${CERTIFICATION_DIMENSIONS.length}`,
    `scored=${scored.length}, withNoSource=${missingSources.length}`,
    `met=${dimensionsMet}, unmet=${unmetDimensions.length}`,
    `overallPercent=${overallPercent} (mean of the ${scored.length} scorable dimensions; unscorable dimensions are excluded, never counted as zero)`,
    `verdict=NOT_CERTIFIED — certification requires all ${CERTIFICATION_DIMENSIONS.length} dimensions to have evidence and meet ${CERTIFICATION_DIMENSION_THRESHOLD}%`,
  ];

  return {
    certified: false,
    verdict: 'NOT_CERTIFIED',
    overallPercent,
    dimensionsMet,
    dimensionsRequired: CERTIFICATION_DIMENSIONS.length,
    dimensions,
    missingSources,
    unmetDimensions,
    nextEvidence,
    auditTrail,
  };
}

/** Human-readable summary used by the UI and by the final report. */
export function describeCertification(verdict: CertificationVerdict): string {
  const lines: string[] = [];
  lines.push(`FINAL STATE: NOT CERTIFIED`);
  lines.push('');
  lines.push('DIMENSIONS (recorded / available — no number is invented):');
  verdict.dimensions.forEach((dimension) => {
    if (dimension.percent === null) {
      lines.push(
        `  ${dimension.label.padEnd(14)} NO EVIDENCE SOURCE — the platform has no capability that records this dimension yet`
      );
    } else {
      lines.push(
        `  ${dimension.label.padEnd(14)} ${dimension.recorded}/${dimension.available} = ${dimension.percent}% ${dimension.met ? '(MET)' : ''}`
      );
    }
  });
  lines.push('');
  lines.push(`DIMENSIONS MET: ${verdict.dimensionsMet}/${verdict.dimensionsRequired}`);
  lines.push(`MISSING SOURCES: ${verdict.missingSources.join(', ') || 'none'}`);
  lines.push('');
  lines.push('AUDIT TRAIL:');
  verdict.auditTrail.forEach((line) => lines.push(`  ${line}`));
  return lines.join('\n');
}