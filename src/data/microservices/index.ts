/**
 * Microservices Engineering Track — curriculum exports and aggregates.
 */
export * from './types';
export * from './authoring';
export * from './compact';
export * from './phaseM1';
export * from './phaseM2';
export * from './phaseM3';
export * from './phaseM4';
export * from './phaseM5';

import { MS_M1_PHASE, MS_M1_MODULES } from './phaseM1';
import { MS_M2_PHASE, MS_M2_MODULES } from './phaseM2';
import { MS_M3_PHASE, MS_M3_MODULES } from './phaseM3';
import { MS_M4_PHASE, MS_M4_MODULES, MS_M4_SNAPSHOTS, MS_M4_INCIDENTS } from './phaseM4';
import { MS_M5_PHASE, MS_M5_MODULES, MS_M5_SNAPSHOTS, MS_M5_INCIDENTS } from './phaseM5';
import type { MsModule, MsPhaseMeta, MsCapstoneSnapshot, MsIncident } from './types';

export const ALL_MS_PHASES: MsPhaseMeta[] = [
  MS_M1_PHASE,
  MS_M2_PHASE,
  MS_M3_PHASE,
  MS_M4_PHASE,
  MS_M5_PHASE,
];

export const ALL_MS_MODULES: MsModule[] = [
  ...MS_M1_MODULES,
  ...MS_M2_MODULES,
  ...MS_M3_MODULES,
  ...MS_M4_MODULES,
  ...MS_M5_MODULES,
];

export const ALL_MS_SNAPSHOTS: MsCapstoneSnapshot[] = [
  ...MS_M4_SNAPSHOTS,
  ...MS_M5_SNAPSHOTS,
];

export const ALL_MS_INCIDENTS: MsIncident[] = [
  ...MS_M4_INCIDENTS,
  ...MS_M5_INCIDENTS,
];
