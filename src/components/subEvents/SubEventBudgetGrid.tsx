/**
 * @fileoverview Function x Category budget matrix grid with row and column reconciliation.
 */

import React from 'react';
import type { BudgetCategoryItem } from '../../types/planner';
import type { SubEvent } from '../../domain/subEvents/types';
import { formatINR } from '../../utils/uiHelpers';

export interface SubEventBudgetGridProps {
  readonly subEvents: ReadonlyArray<SubEvent>;
  readonly items: ReadonlyArray<BudgetCategoryItem>;
  readonly totalBudget: number;
}

export const SubEventBudgetGrid: React.FC<SubEventBudgetGridProps> = ({
  subEvents,
  items,
  totalBudget,
}) => {
  const totalProjected = items.reduce((sum, item) => sum + item.projectedAmount, 0);

  return (
    <div
      role="region"
      aria-label="Function by category budget allocation matrix"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          Function × Category Budget Matrix
        </h3>
        <span className="text-xs text-slate-400">
          Target: <strong className="text-slate-200">{formatINR(totalBudget)}</strong> | Projected:{' '}
          <strong className="text-saffron-400">{formatINR(totalProjected)}</strong>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-850 text-slate-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="p-3 font-semibold">
                Function (Share %)
              </th>
              {items.map((item) => (
                <th key={item.id} scope="col" className="p-3 text-right font-semibold">
                  {item.category.split('&')[0]?.trim()}
                </th>
              ))}
              <th scope="col" className="p-3 text-right font-semibold text-saffron-400">
                Row Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {subEvents.map((se) => {
              const rowTotal = Math.round((se.budgetSharePercent / 100) * totalProjected);
              return (
                <tr key={se.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-sans font-medium text-slate-200">
                    {se.name}
                    <span className="ml-1.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                      {se.budgetSharePercent}%
                    </span>
                  </td>
                  {items.map((item) => {
                    const cellAmount = Math.round(
                      (se.budgetSharePercent / 100) * item.projectedAmount
                    );
                    return (
                      <td key={item.id} className="p-3 text-right text-slate-300">
                        {formatINR(cellAmount)}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right font-semibold text-saffron-400">
                    {formatINR(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-700 bg-slate-900 font-semibold font-mono text-slate-200">
            <tr>
              <th scope="row" className="p-3 font-sans text-slate-100">
                Column Total (Projected)
              </th>
              {items.map((item) => (
                <td key={item.id} className="p-3 text-right text-slate-200">
                  {formatINR(item.projectedAmount)}
                </td>
              ))}
              <td className="p-3 text-right text-saffron-400">{formatINR(totalProjected)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

