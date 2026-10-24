/**
 * @fileoverview Vendor Comparator tab with side-by-side quote comparison, raw quote paste
 * analyzer, hidden risk badges, capacity/budget warnings, and negotiation questions.
 */

import React, { useState, useCallback } from 'react';
import { Users, DollarSign, AlertTriangle, CheckCircle2, Shield, MessageCircle } from 'lucide-react';
import type { VendorQuote, BudgetCategoryName } from '../types/planner';
import { analyzeRawQuoteText, compareQuoteToContext } from '../services/vendorQuoteComparator';
import type { EventContext } from '../types/planner';
import { sanitizeUserText } from '../utils/security';
import { CARD_CLASSES, BADGE_BASE, formatINR } from '../utils/uiHelpers';

/** Props for the VendorComparatorTab component. */
interface VendorTabProps {
  readonly quotes: ReadonlyArray<VendorQuote>;
  readonly context: EventContext;
  readonly categoryBudgets: Record<string, number>;
  readonly onToggleVerified: (quoteId: string) => void;
  readonly onAddQuote: (quote: VendorQuote) => void;
}

/**
 * Side-by-side vendor quote comparator with raw text analyzer and negotiation copilot.
 *
 * @param props - Vendor quotes, context, and interaction handlers.
 * @returns Vendor comparator section React element.
 */
const VendorComparatorTab: React.FC<VendorTabProps> = ({
  quotes, context, categoryBudgets, onToggleVerified, onAddQuote,
}) => {
  const [rawText, setRawText] = useState('');
  const [parseCategory, setParseCategory] = useState<BudgetCategoryName>('Venue & Logistics');

  const handleParse = useCallback((): void => {
    if (!rawText.trim()) { return; }
    const parsed = analyzeRawQuoteText(sanitizeUserText(rawText, 5000), parseCategory);
    onAddQuote(parsed);
    setRawText('');
  }, [rawText, parseCategory, onAddQuote]);

  return (
    <section aria-label="Vendor quote comparator">
      <h2 className="mb-4 text-lg font-bold text-slate-100">Vendor Quote Comparator & Negotiation Copilot</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => {
          const budget = categoryBudgets[quote.category] ?? 0;
          const comparison = compareQuoteToContext(quote, context, budget);
          return (
            <div key={quote.id} className={CARD_CLASSES}>
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-sm font-bold text-slate-200">{quote.vendorName}</h3>
                <button onClick={() => onToggleVerified(quote.id)} className={`${BADGE_BASE} cursor-pointer ${quote.isVerifiedQuote ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`} aria-label={`Toggle verification for ${quote.vendorName}`} aria-pressed={quote.isVerifiedQuote}>
                  {quote.isVerifiedQuote ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" />Verified</> : <><Shield className="h-3 w-3" aria-hidden="true" />AI Est.</>}
                </button>
              </div>
              <p className="mb-2 text-xs text-slate-400">{quote.category}</p>
              <div className="mb-3 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Quoted:</span><span className="font-medium text-slate-200">{formatINR(quote.quotedPrice)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Budget:</span><span className={comparison.isBudgetOverrun ? 'text-red-400' : 'text-emerald-400'}>{formatINR(budget)}</span></div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400"><Users className="mr-1 inline h-3 w-3" aria-hidden="true" />Capacity:</span>
                  <span className={comparison.isCapacityShortfall ? 'text-red-400' : 'text-slate-200'}>{quote.guestCapacity} {comparison.isCapacityShortfall && `(-${comparison.capacityGap} short)`}</span>
                </div>
              </div>
              {comparison.isBudgetOverrun && (
                <div className={`${BADGE_BASE} mb-2 bg-red-500/20 text-red-400`} role="alert"><DollarSign className="h-3 w-3" aria-hidden="true" />Over budget by {formatINR(comparison.budgetDelta)}</div>
              )}
              {quote.hiddenRisks.length > 0 && (
                <div className="mb-2"><p className="mb-1 text-xs font-medium text-amber-400"><AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden="true" />Hidden Risks:</p>
                  <ul className="list-inside list-disc text-xs text-amber-300">{quote.hiddenRisks.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              {quote.clarificationQuestions.length > 0 && (
                <div><p className="mb-1 text-xs font-medium text-peacock-500"><MessageCircle className="mr-1 inline h-3 w-3" aria-hidden="true" />Ask Before Booking:</p>
                  <ul className="list-inside list-disc text-xs text-slate-400">{quote.clarificationQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={CARD_CLASSES}>
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Paste Raw Vendor Quote</h3>
        <div className="mb-2 flex gap-2">
          <select value={parseCategory} onChange={(e) => setParseCategory(e.target.value as BudgetCategoryName)} className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-saffron-500 focus:outline-none" aria-label="Quote category">
            {(['Venue & Logistics', 'Catering & Hospitality', 'Decor & Ambience', 'Photography & Media', 'Entertainment & Rituals'] as const).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} rows={3} placeholder="Paste vendor quote text here…" className="mb-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-saffron-500 focus:outline-none" aria-label="Raw vendor quote text" />
        <button onClick={handleParse} className="rounded-lg bg-saffron-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-saffron-500" aria-label="Analyze pasted quote">Analyze Quote</button>
      </div>
    </section>
  );
};

export default VendorComparatorTab;
