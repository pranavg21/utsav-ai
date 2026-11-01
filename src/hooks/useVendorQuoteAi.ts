/**
 * @fileoverview Custom hook for AI-powered vendor quote extraction and normalization (10.3).
 */

import { useState, useCallback } from 'react';
import type { BudgetCategoryName, VendorQuote } from '../types/planner';
import { extractVendorQuoteWithAi } from '../services/gemini/vendorAi';
import { analyzeRawQuoteText, normalizeExtractedQuote } from '../domain/vendors/normalize';
import { sanitizeUserText } from '../utils/security';

export interface UseVendorQuoteAiReturn {
  readonly isAnalyzing: boolean;
  readonly analyzeQuote: (
    rawText: string,
    category: BudgetCategoryName,
    guestCount: number,
    onSuccess: (quote: VendorQuote) => void
  ) => Promise<void>;
}

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
        const aiRes = await extractVendorQuoteWithAi(sanitized, category);
        let quote: VendorQuote;
        if (aiRes.provenance.source === 'gemini') {
          quote = normalizeExtractedQuote(aiRes.data, {
            rawText: sanitized,
            category,
            defaultGuests: guestCount,
            provenance: aiRes.provenance,
          });
        } else {
          quote = analyzeRawQuoteText(sanitized, category, guestCount, aiRes.provenance);
        }
        onSuccess(quote);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isAnalyzing]
  );

  return { isAnalyzing, analyzeQuote };
}
