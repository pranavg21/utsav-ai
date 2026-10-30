/**
 * @fileoverview Re-export facade for budget allocation and trade-off engine.
 * Implements priority-weighted calculations and iterative water-filling trade-offs.
 */

export {
  BASE_CATEGORY_SHARES,
  buildInitialBudgetItems,
  mergeBudgetAllocations,
} from '../domain/budget/allocation';

export {
  evaluateBudgetAndTradeoffs,
  buildWaterFillingScenario,
} from '../domain/budget/tradeoffs';
