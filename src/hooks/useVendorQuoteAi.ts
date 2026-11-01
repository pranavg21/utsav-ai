/**
 * @fileoverview Custom hook for AI-powered vendor quote extraction and normalization (10.3).
 */

import { useState, useCallback } from 'react';
import type { BudgetCategoryName, VendorQuote } from '../types/planner';
import { extractVendorQuoteWithAi } from '../services/gemini/vendorAi';
import { analyzeRawQuoteText, normalizeExtractedQuote } from '../domain/vendors/normalize';
import { sanitizeUserText } from '../utils/security';

/** Return signature for the useVendorQuoteAi quote extraction hook. */
export interface UseVendorQuoteAiReturn {
  readonly isAnalyzing: boolean;
  readonly analyzeQuote: (
    rawText: string,
    category: BudgetCategoryName,
    guestCount: number,
    onSuccess: (quote: VendorQuote) => void
  ) => Promise<void>;
}

/**
 * Custom hook providing asynchronous quote analysis through Gemini with fallback to offline extraction.
 * @returns Object with isAnalyzing loading flag and analyzeQuote callback function.
 */
export function useVendorQuoteAi(): UseVendorQuoteAiReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeQuote = useCallback(
    async (
      rawText: string,
      category: BudgetCategoryName,
      guestCount: number,
      onSuccess: (quote: VendorQuote) => void
    ): Promise<void> => {
      const trimmed = rawText.trim();
      if (!trimmed || isAnalyzing) return;
      setIsAnalyzing(true);
      try {
        const sanitized = sanitizeUserText(trimmed, 5000);
        const aiResult = await extractVendorQuoteWithAi(sanitized, category);
        const normalized =
          aiResult.provenance.source === 'gemini'
            ? normalizeExtractedQuote(aiResult.data, {
                rawText: sanitized,
                category,
                defaultGuests: guestCount,
                provenance: aiResult.provenance,
              })
            : analyzeRawQuoteText(sanitized, category, guestCount, aiResult.provenance);
        onSuccess(normalized);
      } catch {
        const fallback = analyzeRawQuoteText(trimmed, category, guestCount, {
          source: 'deterministic',
          reason: 'offline',
        });
        onSuccess(fallback);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isAnalyzing]
  );

  return { isAnalyzing, analyzeQuote };
}
