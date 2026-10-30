/**
 * @fileoverview Vendor quote comparison tab with side-by-side cards and raw quote analysis.
 */

import React, { useState, useCallback } from 'react';
import type { BudgetCategoryName, EventContext, VendorQuote } from '../types/planner';
import { analyzeRawQuoteText } from '../domain/vendors/normalize';
import { isBudgetCategoryName } from '../utils/typeGuards';
import { sanitizeUserText } from '../utils/security';
import { CARD_CLASSES } from '../utils/uiHelpers';
import { VendorQuoteCard } from './vendors/VendorQuoteCard';

interface VendorComparatorProps {
  readonly quotes: readonly VendorQuote[];
  readonly context: EventContext;
  readonly categoryBudgets: Record<string, number>;
  readonly onToggleVerified: (quoteId: string) => void;
  readonly onAddQuote: (quote: VendorQuote) => void;
}

const CATEGORIES: readonly BudgetCategoryName[] = [
  'Venue & Logistics',
  'Catering & Hospitality',
  'Decor & Ambience',
  'Photography & Media',
  'Entertainment & Rituals',
];

const VendorComparatorTab: React.FC<VendorComparatorProps> = React.memo(
  ({ quotes, context, categoryBudgets, onToggleVerified, onAddQuote }) => {
    const [rawText, setRawText] = useState('');
    const [parseCategory, setParseCategory] = useState<BudgetCategoryName>('Venue & Logistics');

    const handleParse = useCallback((): void => {
      if (!rawText.trim()) return;
      const parsed = analyzeRawQuoteText(sanitizeUserText(rawText, 5000), parseCategory);
      onAddQuote(parsed);
      setRawText('');
    }, [rawText, parseCategory, onAddQuote]);

    return (
      <section aria-label="Vendor quote comparator">
        <h2 className="mb-4 text-lg font-bold text-slate-100">
          Vendor Quote Comparator & Negotiation Copilot
        </h2>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <VendorQuoteCard
              key={quote.id}
              quote={quote}
              context={context}
              budget={categoryBudgets[quote.category] ?? 0}
              onToggleVerified={onToggleVerified}
            />
          ))}
        </div>
        <div className={CARD_CLASSES}>
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Paste Raw Vendor Quote</h3>
          <div className="mb-2 flex gap-2">
            <select
              value={parseCategory}
              onChange={(e) => {
                const v = e.target.value;
                if (isBudgetCategoryName(v)) setParseCategory(v);
              }}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-saffron-500 focus:outline-none"
              aria-label="Quote category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={3}
            placeholder="Paste vendor quote text here…"
            className="mb-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-saffron-500 focus:outline-none"
            aria-label="Raw vendor quote text"
          />
          <button
            type="button"
            onClick={handleParse}
            className="rounded-lg bg-saffron-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-saffron-500"
            aria-label="Analyze pasted quote"
          >
            Analyze Quote
          </button>
        </div>
      </section>
    );
  }
);

VendorComparatorTab.displayName = 'VendorComparatorTab';

export default VendorComparatorTab;
