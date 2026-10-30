/**
 * @fileoverview Provenance and execution metadata types for Gemini AI generation.
 */

import type { ProvenanceBadgeData, DeterministicReason } from '../../types/plannerExtended';

export type { ProvenanceBadgeData, DeterministicReason };

export type ProvenanceSource = 'gemini' | 'deterministic';

/** Strongly typed envelope wrapping domain payloads with verified provenance. */
export interface AiResult<T> {
  readonly data: T;
  readonly provenance: ProvenanceBadgeData;
}
