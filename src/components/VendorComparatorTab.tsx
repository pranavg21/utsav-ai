/**
 * @fileoverview Vendor quote comparator tab with pasted quote analysis and comparison cards.
 */

import React, { useState, useMemo, useCallback } from 'react';
import type { BudgetCategoryName, EventContext, VendorQuote } from '../types/planner';
import { CARD_CLASSES } from '../utils/uiHelpers';
import { useVendorQuoteAi } from '../hooks/useVendorQuoteAi';
import { isBudgetCategoryName } from '../utils/typeGuards';
import { VendorQuoteCard } from './vendors/VendorQuoteCard';

interface VendorComparatorProps {
  readonly quotes: ReadonlyArray<VendorQuote>;
  readonly context: EventContext;
  readonly categoryBudgets: Record<string, number>;
  readonly onToggleVerified: (quoteId: string) => void;
  readonly onAddQuote: (quote: VendorQuote) => void;
}

const CATEGORIES: BudgetCategoryName[] = [
  'Venue & Logistics',
  'Catering & Hospitality',
  'Decor & Ambience',
  'Photography & Media',
  'Entertainment & Rituals',
  'Contingency Reserve',
];

const SELECT_CLASS =
  'rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 ' +
  'focus:border-saffron-500 focus:outline-none';

const TEXTAREA_CLASS =
  'mb-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm ' +
  'text-slate-200 placeholder-slate-500 focus:border-saffron-500 focus:outline-none';

const BUTTON_CLASS =
  'rounded-lg bg-saffron-600 px-4 py-2 text-xs font-medium text-white ' +
  'transition hover:bg-saffron-500 disabled:opacity-50';

const VendorComparatorTab: React.FC<VendorComparatorProps> = React.memo(
  ({ quotes, context, categoryBudgets, onToggleVerified, onAddQuote }) => {
    const [rawText, setRawText] = useState('');
    const [parseCategory, setParseCategory] = useState<BudgetCategoryName>('Venue & Logistics');
    const { isAnalyzing, analyzeQuote } = useVendorQuoteAi();

    const handleParse = useCallback(async (): Promise<void> => {
      await analyzeQuote(rawText, parseCategory, context.guestCount, (quote) => {
        onAddQuote(quote);
        setRawText('');
      });
    }, [analyzeQuote, rawText, parseCategory, context.guestCount, onAddQuote]);

    const renderedQuotes = useMemo(() => quotes, [quotes]);

    return (
      <section aria-label="Vendor quote comparator">
        <h2 className="mb-4 text-lg font-bold text-slate-100">
          Vendor Quote Comparator & Negotiation Copilot
        </h2>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {renderedQuotes.map((q) => (
            <VendorQuoteCard
              key={q.id}
              quote={q}
              context={context}
              budget={categoryBudgets[q.category] ?? 0}
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
              className={SELECT_CLASS}
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
            className={TEXTAREA_CLASS}
            aria-label="Raw vendor quote text"
          />
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleParse}
            className={BUTTON_CLASS}
            aria-label="Analyze pasted quote"
          >
            {isAnalyzing ? 'Analyzing…' : 'Analyze Quote'}
          </button>
        </div>
      </section>
    );
  }
);

VendorComparatorTab.displayName = 'VendorComparatorTab';

export default VendorComparatorTab;
