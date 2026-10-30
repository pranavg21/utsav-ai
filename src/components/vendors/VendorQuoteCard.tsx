/**
 * @fileoverview Individual vendor quote card with capacity/overrun alerts and verification toggle.
 */

import React from 'react';
import { Shield, CheckCircle2, DollarSign, Users, AlertTriangle, MessageCircle } from 'lucide-react';
import type { EventContext, VendorQuote } from '../../types/planner';
import { compareQuoteToContext, calculateAllInCost } from '../../domain/vendors/normalize';
import { BADGE_BASE, CARD_CLASSES, formatINR } from '../../utils/uiHelpers';

interface VendorQuoteCardProps {
  readonly quote: VendorQuote;
  readonly context: EventContext;
  readonly budget: number;
  readonly onToggleVerified: (quoteId: string) => void;
}

export const VendorQuoteCard: React.FC<VendorQuoteCardProps> = React.memo(
  ({ quote, context, budget, onToggleVerified }) => {
    const comparison = compareQuoteToContext(quote, context, budget);
    const allIn = calculateAllInCost(quote, context.guestCount);

    return (
      <div className={CARD_CLASSES}>
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-sm font-bold text-slate-200">{quote.vendorName}</h3>
          <button
            type="button"
            onClick={() => onToggleVerified(quote.id)}
            className={`${BADGE_BASE} cursor-pointer ${
              quote.isVerifiedQuote ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}
            aria-label={`Toggle verification for ${quote.vendorName}`}
            aria-pressed={quote.isVerifiedQuote}
          >
            {quote.isVerifiedQuote ? (
              <>
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Verified
              </>
            ) : (
              <>
                <Shield className="h-3 w-3" aria-hidden="true" />
                AI Est.
              </>
            )}
          </button>
        </div>
        <p className="mb-2 text-xs text-slate-400">{quote.category}</p>
        <div className="mb-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Headline Quote:</span>
            <span className="font-medium text-slate-200">{formatINR(quote.quotedPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">All-In Cost (GST+Buf):</span>
            <span className="font-semibold text-saffron-400">{formatINR(allIn.allInCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Budget:</span>
            <span className={comparison.isBudgetOverrun ? 'text-red-400' : 'text-emerald-400'}>
              {formatINR(budget)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              <Users className="mr-1 inline h-3 w-3" aria-hidden="true" />
              Capacity:
            </span>
            <span className={comparison.isCapacityShortfall ? 'text-red-400' : 'text-slate-200'}>
              {quote.guestCapacity} {comparison.isCapacityShortfall && `(-${comparison.capacityGap} short)`}
            </span>
          </div>
        </div>
        {comparison.isBudgetOverrun && (
          <div className={`${BADGE_BASE} mb-2 bg-red-500/20 text-red-400`} role="alert">
            <DollarSign className="h-3 w-3" aria-hidden="true" />
            Over budget by {formatINR(comparison.budgetDelta)}
          </div>
        )}
        {quote.hiddenRisks.length > 0 && (
          <div className="mb-2">
            <p className="mb-1 text-xs font-medium text-amber-400">
              <AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden="true" />
              Hidden Risks:
            </p>
            <ul className="list-inside list-disc text-xs text-amber-300">
              {quote.hiddenRisks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {quote.clarificationQuestions.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-peacock-500">
              <MessageCircle className="mr-1 inline h-3 w-3" aria-hidden="true" />
              Ask Before Booking:
            </p>
            <ul className="list-inside list-disc text-xs text-slate-400">
              {quote.clarificationQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

VendorQuoteCard.displayName = 'VendorQuoteCard';
