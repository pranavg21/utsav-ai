/**
 * @fileoverview Vendor Checklist Tab providing structured vendor hiring lifecycle tracking,
 * milestone due dates linked to DAG timeline, and status updates.
 */

import React, { useState, useMemo } from 'react';
import { ClipboardCheck } from 'lucide-react';
import type { VendorChecklistItem, VendorChecklistStatus, VendorChecklistSummary } from '../domain/vendors/types';
import { ChecklistItemCard } from './checklist/ChecklistItemCard';
import { CARD_CLASSES, formatINR } from '../utils/uiHelpers';

interface ChecklistTabProps {
  readonly items: readonly VendorChecklistItem[];
  readonly summary: VendorChecklistSummary;
  readonly onUpdateStatus: (
    itemId: string,
    status: VendorChecklistStatus,
    options?: { readonly advancePaid?: number | undefined; readonly bookedPrice?: number | undefined }
  ) => void;
}

export const VendorChecklistTab: React.FC<ChecklistTabProps> = ({ items, summary, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'booked' | 'overdue'>('all');

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'booked':
        return items.filter((i) => i.status === 'booked' || i.status === 'paid-advance' || i.status === 'confirmed');
      case 'pending':
        return items.filter((i) => i.status === 'not-started' || i.status === 'shortlisted' || i.status === 'quoted');
      case 'overdue':
        return items.filter((i) => (i.status === 'not-started' || i.status === 'shortlisted') && i.dueDaysBeforeEvent > 30);
      default:
        return items;
    }
  }, [items, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-400" /> Vendor Execution Checklist
          </h2>
          <p className="text-xs text-slate-400">
            Lifecycle tracking with auto-propagating deadlines and budget cross-reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {(['all', 'pending', 'booked', 'overdue'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded font-medium transition ${
                filter === opt ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className={`${CARD_CLASSES} p-3`}>
          <span className="text-slate-400 block">Total Vendors</span>
          <span className="text-lg font-bold text-white">{summary.totalItems}</span>
        </div>
        <div className={`${CARD_CLASSES} p-3`}>
          <span className="text-slate-400 block">Locked / Booked</span>
          <span className="text-lg font-bold text-emerald-400">
            {summary.bookedCount} / {summary.totalItems}
          </span>
        </div>
        <div className={`${CARD_CLASSES} p-3`}>
          <span className="text-slate-400 block">Advance Paid</span>
          <span className="text-lg font-bold text-cyan-400">{formatINR(summary.totalAdvancePaid)}</span>
        </div>
        <div className={`${CARD_CLASSES} p-3`}>
          <span className="text-slate-400 block">Committed Spend</span>
          <span className="text-lg font-bold text-indigo-400">{formatINR(summary.totalBookedAmount)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            onStatusChange={(status, price, advance) =>
              onUpdateStatus(item.id, status, { bookedPrice: price, advancePaid: advance })
            }
          />
        ))}
      </div>
    </div>
  );
};

