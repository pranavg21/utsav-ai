/**
 * @fileoverview Priority ranking reordering list with accessible keyboard controls.
 */

import React, { useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { BudgetCategoryName } from '../../types/planner';

interface PriorityRankingListProps {
  readonly priorityRanking: readonly BudgetCategoryName[];
  readonly onUpdateRanking: (updated: BudgetCategoryName[]) => void;
}

export const PriorityRankingList: React.FC<PriorityRankingListProps> = React.memo(
  ({ priorityRanking, onUpdateRanking }) => {
    const movePriority = useCallback(
      (idx: number, dir: -1 | 1): void => {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= priorityRanking.length) return;
        const updated = [...priorityRanking];
        const temp = updated[idx];
        const target = updated[newIdx];
        if (temp !== undefined && target !== undefined) {
          updated[idx] = target;
          updated[newIdx] = temp;
          onUpdateRanking(updated);
        }
      },
      [priorityRanking, onUpdateRanking]
    );

    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-300">
          Priority Ranking (use buttons to reorder)
        </h3>
        <div className="space-y-1" role="list" aria-label="Priority category order">
          {priorityRanking.map((cat, idx) => (
            <div
              key={cat}
              role="listitem"
              className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-1.5 text-sm text-slate-300"
            >
              <span className="w-5 text-xs font-bold text-saffron-500">#{idx + 1}</span>
              <span className="flex-1">{cat}</span>
              <button
                type="button"
                onClick={() => movePriority(idx, -1)}
                disabled={idx === 0}
                className="p-0.5 text-slate-500 hover:text-saffron-400 disabled:opacity-30"
                aria-label={`Move ${cat} up`}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => movePriority(idx, 1)}
                disabled={idx === priorityRanking.length - 1}
                className="p-0.5 text-slate-500 hover:text-saffron-400 disabled:opacity-30"
                aria-label={`Move ${cat} down`}
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PriorityRankingList.displayName = 'PriorityRankingList';
