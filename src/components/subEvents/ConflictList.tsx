/**
 * @fileoverview Conflict list displaying sub-event schedule, transit, and budget conflicts.
 */

import React from 'react';
import type { SubEventConflict } from '../../domain/subEvents/conflicts';

export interface ConflictListProps {
  readonly conflicts: readonly SubEventConflict[];
}

function getSuggestedFix(conflict: SubEventConflict): string {
  switch (conflict.type) {
    case 'share':
      return 'Adjust sub-event share percentages so the sum equals 100%.';
    case 'capacity':
      return 'Reduce sub-event guest count or increase total celebration guest capacity.';
    case 'transit':
      return 'Schedule functions with at least 2 hours transit buffer or host them at the same venue.';
    case 'overlap':
      return 'Stagger function schedules to prevent overlap between functions.';
  }
}

export const ConflictList: React.FC<ConflictListProps> = ({ conflicts }) => {
  if (conflicts.length === 0) {
    return (
      <div
        role="status"
        aria-label="Coordination status"
        className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-sm text-emerald-400"
      >
        ✓ All functions are coordinated. Zero schedule, transit, or capacity conflicts detected.
      </div>
    );
  }

  return (
    <div className="space-y-3" role="region" aria-label="Detected function coordination conflicts">
      <h3 className="text-sm font-semibold text-slate-200">
        Coordination Alerts ({conflicts.length})
      </h3>
      <ul className="space-y-2">
        {conflicts.map((conflict) => {
          const isError = conflict.severity === 'error';
          return (
            <li
              key={conflict.id}
              className={`rounded-xl border p-3.5 text-xs ${
                isError
                  ? 'border-red-900/50 bg-red-950/30 text-red-200'
                  : 'border-amber-900/50 bg-amber-950/30 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{conflict.message}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isError ? 'bg-red-900/80 text-red-100' : 'bg-amber-900/80 text-amber-100'
                  }`}
                >
                  {conflict.severity}
                </span>
              </div>
              <p className="mt-1.5 text-slate-400">
                <span className="font-medium text-slate-300">Suggested Action: </span>
                {getSuggestedFix(conflict)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
