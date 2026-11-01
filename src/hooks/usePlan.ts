/**
 * @fileoverview Custom hook managing core celebration plan state, derived selectors, and actions.
 */

import { useReducer, useMemo, useCallback } from 'react';
import type {
  CelebrationPreset,
  EventContext,
  TaskStatus,
  TradeOffScenario,
  VendorQuote,
} from '../types/planner';
import type { ChangeRequestInput } from '../types/plannerExtended';
import { WEDDING_PRESET } from '../data/presets';
import { planReducer, createInitialState } from '../state/planReducer';
import {
  selectEvaluation,
  selectCategoryBudgets,
  selectBottlenecks,
  selectSubEventRollup,
  selectChecklistSummary,
  selectOverdueVendors,
} from '../state/selectors';
import type { VendorChecklistItem, VendorChecklistStatus } from '../domain/vendors/types';
import type { UsePlanReturn } from './usePlanTypes';

export type { UsePlanReturn } from './usePlanTypes';

/**
 * Primary React hook managing state, selectors, and dispatchers for celebration planning.
 * @param initialPreset Initial preset to bootstrap state from.
 * @returns State, memoized selector results, and action callback dispatchers.
 */
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
  const setProjected = useCallback(
    (categoryId: string, amount: number) => dispatch({ type: 'SET_PROJECTED', payload: { categoryId, amount } }),
    []
  );
  const toggleVerified = useCallback(
    (categoryId: string) => dispatch({ type: 'TOGGLE_VERIFIED', payload: { categoryId } }),
    []
  );
  const applyTradeoff = useCallback(
    (scenario: TradeOffScenario) => dispatch({ type: 'APPLY_TRADEOFF', payload: { scenario } }),
    []
  );
  const setTaskStatus = useCallback(
    (taskId: string, status: TaskStatus, delayDays?: number) =>
      dispatch({ type: 'SET_TASK_STATUS', payload: { taskId, status, delayDays } }),
    []
  );
  const addQuote = useCallback((quote: VendorQuote) => dispatch({ type: 'ADD_QUOTE', payload: quote }), []);
  const toggleQuoteVerified = useCallback(
    (quoteId: string) => dispatch({ type: 'TOGGLE_QUOTE_VERIFIED', payload: { quoteId } }),
    []
  );
  const updateChecklistStatus = useCallback(
    (
      itemId: string,
      status: VendorChecklistStatus,
      options?: { readonly advancePaid?: number | undefined; readonly bookedPrice?: number | undefined }
    ) =>
      dispatch({
        type: 'UPDATE_CHECKLIST_STATUS',
        payload: {
          itemId,
          status,
          ...(options?.advancePaid !== undefined && { advancePaid: options.advancePaid }),
          ...(options?.bookedPrice !== undefined && { bookedPrice: options.bookedPrice }),
        },
      }),
    []
  );
  const setChecklist = useCallback(
    (checklist: readonly VendorChecklistItem[]) => dispatch({ type: 'SET_CHECKLIST', payload: checklist }),
    []
  );
  const updateSubEvent = useCallback(
    (
      subEventId: string,
      updates: {
        readonly name?: string | undefined;
        readonly guestCount?: number | undefined;
        readonly budgetSharePercent?: number | undefined;
      }
    ) =>
      dispatch({
        type: 'UPDATE_SUB_EVENT',
        payload: { subEventId, updates },
      }),
    []
  );

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
      updateSubEvent,
    },
  };
}
