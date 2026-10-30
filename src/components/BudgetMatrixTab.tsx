/**
 * @fileoverview Budget Matrix tab displaying category allocations with AI/Verified badges.
 */

import React, { useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import type {
  BudgetCategoryItem,
  BudgetEvaluationResult,
  TradeOffScenario,
} from '../types/planner';
import { BADGE_BASE, formatINR, getDeltaColorClass } from '../utils/uiHelpers';
import { TradeoffScenarioCards } from './budget/TradeoffScenarioCards';

interface BudgetMatrixProps {
  readonly evaluation: BudgetEvaluationResult;
  readonly onToggleVerified: (itemId: string) => void;
  readonly onUpdateAmount: (itemId: string, amount: number) => void;
  readonly onApplyTradeOff: (scenario: TradeOffScenario) => void;
}

const BudgetMatrixTab: React.FC<BudgetMatrixProps> = React.memo(
  ({ evaluation, onToggleVerified, onUpdateAmount, onApplyTradeOff }) => {
    const handleAmountChange = useCallback(
      (item: BudgetCategoryItem, value: string): void => {
        const num = parseInt(value, 10);
        if (!Number.isNaN(num) && num >= 0) {
          onUpdateAmount(item.id, num);
        }
      },
      [onUpdateAmount]
    );

    return (
      <section aria-label="Budget matrix">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-bold text-slate-100">Budget Matrix</h2>
          {evaluation.isOverBudget && (
            <span className={`${BADGE_BASE} bg-red-500/20 text-red-400`} role="alert">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {formatINR(evaluation.overrunAmount)} Overrun (+{evaluation.overrunPercentage}%)
            </span>
          )}
          <span className="text-sm text-slate-400">
            Total: {formatINR(evaluation.totalProjected)} / {formatINR(evaluation.totalBudget)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Budget categories">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2 text-right">Allocated</th>
                <th className="px-3 py-2 text-right">Projected</th>
                <th className="px-3 py-2 text-right">Variance</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Priority</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.items.map((item) => {
                const delta = item.projectedAmount - item.allocatedAmount;
                return (
                  <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="px-3 py-2.5 font-medium text-slate-200">{item.category}</td>
                    <td className="px-3 py-2.5 text-right text-slate-300">{formatINR(item.allocatedAmount)}</td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number"
                        value={item.projectedAmount}
                        onChange={(e) => handleAmountChange(item, e.target.value)}
                        className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-right text-sm text-slate-100 focus:border-saffron-500 focus:outline-none"
                        aria-label={`Projected amount for ${item.category}`}
                      />
                    </td>
                    <td className={`px-3 py-2.5 text-right font-medium ${getDeltaColorClass(delta)}`}>
                      {delta > 0 ? `+${formatINR(delta)}` : delta < 0 ? formatINR(delta) : '₹0'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleVerified(item.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                          item.isVerifiedQuote
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        }`}
                        aria-label={`Toggle verification for ${item.category}`}
                      >
                        {item.isVerifiedQuote ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Verified Quote
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3" aria-hidden="true" />
                            AI Estimate
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-400">
                      #{item.priorityWeight}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TradeoffScenarioCards
          scenarios={evaluation.tradeOffScenarios}
          onApplyTradeOff={onApplyTradeOff}
        />
      </section>
    );
  }
);

BudgetMatrixTab.displayName = 'BudgetMatrixTab';

export default BudgetMatrixTab;
