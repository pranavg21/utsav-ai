/**
 * @fileoverview Default financial, tax, and logistical assumptions for event calculations.
 */

/** Configurable celebration financial assumptions and tax rates. */
export interface EventAssumptions {
  readonly headcountBufferPercent: number;
  readonly peakSeasonMultiplier: number;
  readonly gstRateServices: number;
  readonly gstRateCatering: number;
}

/** Standard baseline assumptions for celebration planning in India. */
export const DEFAULT_ASSUMPTIONS: EventAssumptions = {
  headcountBufferPercent: 10,
  peakSeasonMultiplier: 1.0,
  gstRateServices: 18,
  gstRateCatering: 5,
};
