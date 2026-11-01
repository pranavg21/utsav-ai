/**
 * @fileoverview Sub-events coordination tab managing multi-function schedules, capacity, and budgets.
 */

import React, { useMemo } from 'react';
import type { BudgetCategoryItem } from '../../types/planner';
import type { SubEvent } from '../../domain/subEvents/types';
import { detectSubEventConflicts } from '../../domain/subEvents/conflicts';
import { SubEventRow } from './SubEventRow';
import { ConflictList } from './ConflictList';
import { SubEventBudgetGrid } from './SubEventBudgetGrid';

/** Props for SubEventsTab. */
export interface SubEventsTabProps {
  readonly subEvents: ReadonlyArray<SubEvent>;
  readonly totalBudget: number;
  readonly totalGuests: number;
  readonly items: ReadonlyArray<BudgetCategoryItem>;
  readonly onUpdateSubEvent: (
    subEventId: string,
    updates: {
      readonly name?: string;
      readonly guestCount?: number;
      readonly budgetSharePercent?: number;
    }
  ) => void;
}

const HEADER_CARD_CLASS =
  'flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 ' +
  'sm:flex-row sm:items-center sm:justify-between';

/** Tab panel coordinating celebration sub-events, budget allocations, and venue transit conflict detection. */
export const SubEventsTab: React.FC<SubEventsTabProps> = ({
  subEvents,
  totalBudget,
  totalGuests,
  items,
  onUpdateSubEvent,
}) => {
  const conflicts = useMemo(
    () => detectSubEventConflicts(subEvents, totalGuests),
    [subEvents, totalGuests]
  );

  const totalShare = useMemo(
    () => subEvents.reduce((sum, se) => sum + se.budgetSharePercent, 0),
    [subEvents]
  );

  return (
    <div className="space-y-6" role="tabpanel" aria-label="Sub-Events and Multi-Function Coordination">
      <div className={HEADER_CARD_CLASS}>
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Multi-Function Event Coordination
          </h2>
          <p className="text-xs text-slate-400">
            Coordinate sub-event schedules, guest capacities, transit buffers, and function budget splits.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-800/60 px-3.5 py-2 text-right">
            <span className="block text-[11px] font-medium text-slate-400">Total Share</span>
            <span
              className={`text-sm font-bold ${
                totalShare === 100 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {totalShare}% / 100%
            </span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-800/60 px-3.5 py-2 text-right">
            <span className="block text-[11px] font-medium text-slate-400">Base Guests</span>
            <span className="text-sm font-bold text-slate-200">{totalGuests} pax</span>
          </div>
        </div>
      </div>

      <ConflictList conflicts={conflicts} />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Functions & Guest Split ({subEvents.length})
        </h3>
        <div className="space-y-2">
          {subEvents.map((se) => (
            <SubEventRow
              key={se.id}
              subEvent={se}
              totalBudget={totalBudget}
              onUpdate={onUpdateSubEvent}
            />
          ))}
        </div>
      </div>

      <SubEventBudgetGrid subEvents={subEvents} items={items} totalBudget={totalBudget} />
    </div>
  );
};

export default SubEventsTab;
