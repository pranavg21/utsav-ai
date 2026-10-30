/**
 * @fileoverview Individual interactive card for a vendor checklist item.
 */

import React, { useState } from 'react';
import { FileText, HelpCircle, ShieldCheck } from 'lucide-react';
import type { VendorChecklistItem, VendorChecklistStatus } from '../../domain/vendors/types';
import { CARD_CLASSES } from '../../utils/uiHelpers';

interface CardProps {
  readonly item: VendorChecklistItem;
  readonly onStatusChange: (status: VendorChecklistStatus, price?: number, advance?: number) => void;
}

const STATUS_OPTS: readonly VendorChecklistStatus[] = [
  'not-started',
  'shortlisted',
  'quoted',
  'booked',
  'paid-advance',
  'confirmed',
];

function isVendorChecklistStatus(val: string): val is VendorChecklistStatus {
  return STATUS_OPTS.some((s) => s === val);
}

export const ChecklistItemCard: React.FC<CardProps> = React.memo(({ item, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [priceInput, setPriceInput] = useState(String(item.bookedPrice ?? item.estimatedCost ?? ''));
  const [advanceInput, setAdvanceInput] = useState(String(item.advancePaid ?? ''));

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const nextStatus: VendorChecklistStatus = isVendorChecklistStatus(val) ? val : item.status;
    const price = priceInput ? Number(priceInput) : undefined;
    const adv = advanceInput ? Number(advanceInput) : undefined;
    onStatusChange(nextStatus, price, adv);
  };

  return (
    <div className={`${CARD_CLASSES} p-4 space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            {item.vendorType}
            {item.isVerifiedQuote && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Locked
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            {item.category} • Target Due: {item.dueDaysBeforeEvent} days before
          </p>
        </div>
        <select
          aria-label={`Status for ${item.vendorType}`}
          value={item.status}
          onChange={handleStatusSelect}
          className="bg-slate-900 border border-slate-700 text-xs rounded px-2.5 py-1.5 text-white focus:ring-1 focus:ring-indigo-500"
        >
          {STATUS_OPTS.map((st) => (
            <option key={st} value={st}>
              {st.toUpperCase().replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-800">
        <label className="flex items-center gap-1.5 text-slate-300">
          Booked ₹:
          <input
            type="number"
            aria-label={`Booked price for ${item.vendorType}`}
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onBlur={() => onStatusChange(item.status, Number(priceInput), Number(advanceInput))}
            className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white"
            placeholder="Amount"
          />
        </label>
        <label className="flex items-center gap-1.5 text-slate-300">
          Advance ₹:
          <input
            type="number"
            aria-label={`Advance paid for ${item.vendorType}`}
            value={advanceInput}
            onChange={(e) => setAdvanceInput(e.target.value)}
            onBlur={() => onStatusChange(item.status, Number(priceInput), Number(advanceInput))}
            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-white"
            placeholder="Advance"
          />
        </label>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-indigo-400 hover:text-indigo-300 underline"
        >
          {expanded ? 'Hide Details' : 'View Must-Ask & Documents'}
        </button>
      </div>

      {expanded && (
        <div className="pt-2 grid md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded border border-slate-800">
          <div>
            <h4 className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
              <HelpCircle className="w-3.5 h-3.5" /> Must-Ask Questions
            </h4>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {item.mustAsk.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-400 flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5" /> Mandatory Documents / Permits
            </h4>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {item.documents.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});
ChecklistItemCard.displayName = 'ChecklistItemCard';

