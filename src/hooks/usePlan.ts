/**
 * @fileoverview Custom hook managing core celebration plan state, derived selectors, and actions.
 */

import { useReducer, useMemo, useCallback } from 'react';
import type {
  BudgetEvaluationResult,
  CelebrationPreset,
  EventContext,
  TaskStatus,
  TimelineTask,
  TradeOffScenario,
  VendorQuote,
} from '../types/planner';
import type { ChangeRequestInput } from '../types/plannerExtended';
import { WEDDING_PRESET } from '../data/presets';
import { planReducer, createInitialState, type PlanState } from '../state/planReducer';
import {
  selectEvaluation,
  selectCategoryBudgets,
  selectBottlenecks,
  selectSubEventRollup,
  selectChecklistSummary,
  selectOverdueVendors,
} from '../state/selectors';
import type { VendorChecklistItem, VendorChecklistStatus, VendorChecklistSummary } from '../domain/vendors/types';

export interface UsePlanReturn {
  readonly state: PlanState;
  readonly derived: {
    readonly evaluation: BudgetEvaluationResult;
    readonly categoryBudgets: Record<string, number>;
    readonly bottlenecks: TimelineTask[];
    readonly subEventRollup: { readonly totalSubEventGuests: number; readonly totalSharePercent: number };
    readonly checklistSummary: VendorChecklistSummary;
    readonly overdueVendors: readonly VendorChecklistItem[];
  };
  readonly actions: {
    readonly loadPreset: (preset: CelebrationPreset) => void;
    readonly updateContext: (updates: Partial<EventContext>) => void;
    readonly applyChange: (change: ChangeRequestInput) => void;
    readonly setProjected: (categoryId: string, amount: number) => void;
    readonly toggleVerified: (categoryId: string) => void;
    readonly applyTradeoff: (scenario: TradeOffScenario) => void;
    readonly setTaskStatus: (taskId: string, status: TaskStatus, delayDays?: number) => void;
    readonly addQuote: (quote: VendorQuote) => void;
    readonly toggleQuoteVerified: (quoteId: string) => void;
    readonly updateChecklistStatus: (
      itemId: string,
      status: VendorChecklistStatus,
      options?: { readonly advancePaid?: number | undefined; readonly bookedPrice?: number | undefined }
    ) => void;
    readonly setChecklist: (checklist: readonly VendorChecklistItem[]) => void;
  };
}

export function usePlan(
  initialPreset: CelebrationPreset = { id: 'default', title: 'Default', context: WEDDING_PRESET }
): UsePlanReturn {
  const [state, dispatch] = useReducer(planReducer, initialPreset, createInitialState);

  const evaluation = useMemo(() => selectEvaluation(state), [state]);
  const categoryBudgets = useMemo(() => selectCategoryBudgets(state), [state]);
  const bottlenecks = useMemo(() => selectBottlenecks(state), [state]);
  const subEventRollup = useMemo(() => selectSubEventRollup(state), [state]);
  const checklistSummary = useMemo(() => selectChecklistSummary(state), [state]);
  const overdueVendors = useMemo(() => selectOverdueVendors(state), [state]);

  const loadPreset = useCallback((preset: CelebrationPreset) => dispatch({ type: 'LOAD_PRESET', payload: preset }), []);
  const updateContext = useCallback((updates: Partial<EventContext>) => dispatch({ type: 'UPDATE_CONTEXT', payload: updates }), []);
  const applyChange = useCallback((change: ChangeRequestInput) => dispatch({ type: 'APPLY_CHANGE', payload: change }), []);
  const setProjected = useCallback((categoryId: string, amount: number) => dispatch({ type: 'SET_PROJECTED', payload: { categoryId, amount } }), []);
  const toggleVerified = useCallback((categoryId: string) => dispatch({ type: 'TOGGLE_VERIFIED', payload: { categoryId } }), []);
  const applyTradeoff = useCallback((scenario: TradeOffScenario) => dispatch({ type: 'APPLY_TRADEOFF', payload: { scenario } }), []);
  const setTaskStatus = useCallback((taskId: string, status: TaskStatus, delayDays?: number) => dispatch({ type: 'SET_TASK_STATUS', payload: { taskId, status, delayDays } }), []);
  const addQuote = useCallback((quote: VendorQuote) => dispatch({ type: 'ADD_QUOTE', payload: quote }), []);
  const toggleQuoteVerified = useCallback((quoteId: string) => dispatch({ type: 'TOGGLE_QUOTE_VERIFIED', payload: { quoteId } }), []);

  const updateChecklistStatus = useCallback(
    (
      itemId: string,
      status: VendorChecklistStatus,
      options?: { readonly advancePaid?: number | undefined; readonly bookedPrice?: number | undefined }
    ) => {
      dispatch({
        type: 'UPDATE_CHECKLIST_STATUS',
        payload: { itemId, status, advancePaid: options?.advancePaid, bookedPrice: options?.bookedPrice },
      });
    },
    []
  );

  const setChecklist = useCallback((checklist: readonly VendorChecklistItem[]) => dispatch({ type: 'SET_CHECKLIST', payload: checklist }), []);

  return {
    state,
    derived: { evaluation, categoryBudgets, bottlenecks, subEventRollup, checklistSummary, overdueVendors },
    actions: {
      loadPreset,
      updateContext,
      applyChange,
      setProjected,
      toggleVerified,
      applyTradeoff,
      setTaskStatus,
      addQuote,
      toggleQuoteVerified,
      updateChecklistStatus,
      setChecklist,
    },
  };
}
