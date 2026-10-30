/**
 * @fileoverview Default financial, tax, and logistical assumptions for event calculations.
 */

export interface EventAssumptions {
  readonly headcountBufferPercent: number;
  readonly peakSeasonMultiplier: number;
  readonly gstRateServices: number;
  readonly gstRateCatering: number;
}

export const DEFAULT_ASSUMPTIONS: EventAssumptions = {
  headcountBufferPercent: 10,
  peakSeasonMultiplier: 1.0,
  gstRateServices: 18,
  gstRateCatering: 5,
};
