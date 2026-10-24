/**
 * @fileoverview Budget Matrix tab displaying category allocations with AI/Verified badges,
 * interactive amount editing, and 3 Trade-Off Scenario cards with 1-click Apply.
 */

import React, { useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { BudgetCategoryItem, BudgetEvaluationResult, TradeOffScenario } from '../types/planner';
import { CARD_CLASSES, BADGE_BASE, formatINR, getDeltaColorClass } from '../utils/uiHelpers';

/** Props for the BudgetMatrixTab component. */
interface BudgetMatrixProps {
  readonly evaluation: BudgetEvaluationResult;
  readonly onToggleVerified: (itemId: string) => void;
  readonly onUpdateAmount: (itemId: string, amount: number) => void;
  readonly onApplyTradeOff: (scenario: TradeOffScenario) => void;
}

/**
 * Budget matrix table with hallucination guardrail badges and trade-off scenario cards.
 *
 * @param props - Budget evaluation data and interaction handlers.
 * @returns Budget matrix section React element.
 */
const BudgetMatrixTab: React.FC<BudgetMatrixProps> = ({
  evaluation, onToggleVerified, onUpdateAmount, onApplyTradeOff,
}) => {
  const handleAmountChange = useCallback((item: BudgetCategoryItem, value: string): void => {
    const num = parseInt(value, 10);
    if (!Number.isNaN(num) && num >= 0) { onUpdateAmount(item.id, num); }
  }, [onUpdateAmount]);

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
            <tr className="border-b border-slate-700 text-left text-xs font-medium uppercase text-slate-400">
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Allocated</th>
              <th className="px-3 py-2">Projected</th>
              <th className="px-3 py-2">Delta</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Priority</th>
            </tr>
          </thead>
          <tbody>
            {evaluation.items.map((item) => {
              const delta = item.projectedAmount - item.allocatedAmount;
              return (
                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="px-3 py-2.5 font-medium text-slate-200">{item.category}</td>
                  <td className="px-3 py-2.5 text-slate-400">{formatINR(item.allocatedAmount)}</td>
                  <td className="px-3 py-2.5">
                    <input type="number" value={item.projectedAmount} onChange={(e) => handleAmountChange(item, e.target.value)} className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200 focus:border-saffron-500 focus:outline-none" aria-label={`Projected amount for ${item.category}`} />
                  </td>
                  <td className={`px-3 py-2.5 font-medium ${getDeltaColorClass(delta)}`}>
                    {delta > 0 ? '+' : ''}{formatINR(delta)}
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => onToggleVerified(item.id)} className={`${BADGE_BASE} cursor-pointer transition ${item.isVerifiedQuote ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`} aria-label={`Toggle verification for ${item.category}`} aria-pressed={item.isVerifiedQuote}>
                      {item.isVerifiedQuote ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" />Verified Quote</> : <><Shield className="h-3 w-3" aria-hidden="true" />AI Estimate</>}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-slate-400">#{item.priorityWeight}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {evaluation.tradeOffScenarios.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Priority-Aligned Trade-Off Scenarios</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {evaluation.tradeOffScenarios.map((scenario) => (
              <div key={scenario.id} className={CARD_CLASSES}>
                <h4 className="mb-1 text-sm font-bold text-saffron-400">{scenario.title}</h4>
                <p className="mb-2 text-xs text-slate-400">{scenario.strategySummary}</p>
                <p className="mb-1 text-xs text-emerald-400">Saves: {formatINR(scenario.totalSavings)}</p>
                <p className="mb-3 text-xs text-slate-300">Revised Total: {formatINR(scenario.revisedTotalSpend)}</p>
                <button onClick={() => onApplyTradeOff(scenario)} className="w-full rounded-lg bg-saffron-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-saffron-500" aria-label={`Apply trade-off: ${scenario.title}`}>
                  Apply This Scenario
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default BudgetMatrixTab;
