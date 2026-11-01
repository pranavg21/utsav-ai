/**
 * @fileoverview Shared numeric constants and configuration thresholds across celebration domain models.
 */

/** 5% GST rate applicable to catering and hospitality services. */
export const GST_RATE_CATERING = 0.05;

/** 18% standard GST rate for general celebration vendor services. */
export const GST_RATE_GENERAL = 0.18;

/** Default 15% headcount buffer for variable catering overage planning. */
export const DEFAULT_HEADCOUNT_BUFFER = 0.15;

/** Threshold below which an unannotated quote price is classified as per-unit / per-plate (₹5,000). */
export const PER_UNIT_PRICE_THRESHOLD = 5000;

/** Default 45% maximum cut cap applied per category during water-filling trade-off calculations. */
export const DEFAULT_MAX_CUT_RATIO = 0.45;

/** Aggressive 55% maximum cut cap for scenarios protecting top priority categories. */
export const AGGRESSIVE_MAX_CUT_RATIO = 0.55;

/** Default fallback guest count (100) when not specified in quote text or context. */
export const DEFAULT_GUEST_COUNT = 100;

/** Debounce delay in milliseconds (600ms) for dynamic theme idea generation upon context edits. */
export const THEME_GENERATION_DEBOUNCE_MS = 600;

/** Hard client-side timeout in milliseconds (15,000ms = 15s) for GenAI calls. */
export const GEMINI_TIMEOUT_MS = 15000;

/** Target sum (1.0 = 100%) for normalized category budget share distributions. */
export const TARGET_TOTAL_SHARE = 1.0;

/** Permitted floating-point tolerance (0.001 = 0.1%) when validating total category share sums. */
export const SHARE_SUM_TOLERANCE = 0.001;
