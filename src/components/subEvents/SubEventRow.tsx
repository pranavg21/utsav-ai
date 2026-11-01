/**
 * @fileoverview Row component for an individual sub-event with editable guests and budget share.
 */

import React from 'react';
import type { SubEvent } from '../../domain/subEvents/types';
import { formatINR } from '../../utils/uiHelpers';

/** Props for SubEventRow. */
export interface SubEventRowProps {
  readonly subEvent: SubEvent;
  readonly totalBudget: number;
  readonly onUpdate: (
    subEventId: string,
    updates: {
      readonly name?: string;
      readonly guestCount?: number;
      readonly budgetSharePercent?: number;
    }
  ) => void;
}

const ROW_CLASS =
  'flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition ' +
  'hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between';

const GUEST_INPUT_CLASS =
  'w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 ' +
  'focus:border-saffron-500 focus:outline-none';

const SHARE_INPUT_CLASS =
  'w-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 ' +
  'focus:border-saffron-500 focus:outline-none';

/** Interactive row allowing guest headcount and budget share adjustment for a sub-event ceremony. */
export const SubEventRow: React.FC<SubEventRowProps> = ({
  subEvent,
  totalBudget,
  onUpdate,
}) => {
  const allocatedAmount = Math.round((totalBudget * subEvent.budgetSharePercent) / 100);
  const offsetLabel =
    subEvent.dayOffset === 0
      ? 'Main Event Day'
      : `${subEvent.dayOffset > 0 ? `+${subEvent.dayOffset}` : subEvent.dayOffset} Day${Math.abs(subEvent.dayOffset) > 1 ? 's' : ''}`;

  return (
    <div
      role="region"
      aria-label={`${subEvent.name} configuration`}
      className={ROW_CLASS}
    >
      <div className="space-y-1 sm:max-w-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100">{subEvent.name}</span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
            {subEvent.venueType}
          </span>
        </div>
        <p className="text-xs text-slate-400">Schedule: {offsetLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-6">
        <div>
          <label
            htmlFor={`guests-${subEvent.id}`}
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Guests
          </label>
          <input
            id={`guests-${subEvent.id}`}
            type="number"
            min={0}
            value={subEvent.guestCount}
            onChange={(e) =>
              onUpdate(subEvent.id, {
                guestCount: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            aria-label={`${subEvent.name} guest count`}
            className={GUEST_INPUT_CLASS}
          />
        </div>

        <div>
          <label
            htmlFor={`share-${subEvent.id}`}
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Budget Share (%)
          </label>
          <div className="flex items-center gap-1">
            <input
              id={`share-${subEvent.id}`}
              type="number"
              min={0}
              max={100}
              value={subEvent.budgetSharePercent}
              onChange={(e) =>
                onUpdate(subEvent.id, {
                  budgetSharePercent: Math.max(
                    0,
                    Math.min(100, parseInt(e.target.value, 10) || 0)
                  ),
                })
              }
              aria-label={`${subEvent.name} budget share percentage`}
              className={SHARE_INPUT_CLASS}
            />
            <span className="text-xs text-slate-400">%</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-auto sm:text-right">
          <span className="block text-xs font-medium text-slate-400 mb-1">Allocated Budget</span>
          <span className="text-sm font-semibold text-saffron-400">
            {formatINR(allocatedAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
