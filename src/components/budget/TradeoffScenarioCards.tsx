/**
 * @fileoverview Priority-aligned trade-off scenario cards with 1-click apply.
 */

import React from 'react';
import type { TradeOffScenario } from '../../types/planner';
import { CARD_CLASSES, formatINR } from '../../utils/uiHelpers';

interface TradeoffScenarioCardsProps {
  readonly scenarios: readonly TradeOffScenario[];
  readonly onApplyTradeOff: (scenario: TradeOffScenario) => void;
}

export const TradeoffScenarioCards: React.FC<TradeoffScenarioCardsProps> = React.memo(
  ({ scenarios, onApplyTradeOff }) => {
    if (scenarios.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="mb-3 text-base font-semibold text-slate-200">
          Priority-Aligned Trade-Off Scenarios
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className={CARD_CLASSES}>
              <h4 className="mb-1 text-sm font-bold text-saffron-400">{scenario.title}</h4>
              <p className="mb-2 text-xs text-slate-400">{scenario.strategySummary}</p>
              <p className="mb-1 text-xs text-emerald-400">
                Saves: {formatINR(scenario.totalSavings)}
              </p>
              <button
                type="button"
                onClick={() => onApplyTradeOff(scenario)}
                className="w-full mt-2 rounded-lg bg-saffron-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-saffron-500"
                aria-label={`Apply trade-off: ${scenario.title}`}
              >
                Apply This Scenario
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

TradeoffScenarioCards.displayName = 'TradeoffScenarioCards';
