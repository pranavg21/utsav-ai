/**
 * @fileoverview Re-export facade for vendor quote presets, comparison, and raw parsing.
 */

export { getPresetVendorQuotes } from '../domain/vendors/quotes';
export {
  compareQuoteToContext,
  analyzeRawQuoteText,
  type QuoteComparisonResult,
} from '../domain/vendors/normalize';
