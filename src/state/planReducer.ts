/**
 * @fileoverview Pure state reducer for UtsavAI celebration plans with immutable transitions.
 */

import type {
  BudgetCategoryItem,
  CelebrationPreset,
  EventContext,
  TimelineTask,
  VendorQuote,
} from '../types/planner';
import type { PlanAction, LifecycleAction, DomainAction } from './planActions';
import type { SubEvent } from '../domain/subEvents/types';
import { WEDDING_SUB_EVENTS } from '../domain/subEvents/types';
import { buildInitialBudgetItems, mergeBudgetAllocations } from '../domain/budget/allocation';
import { buildInitialCelebrationTasks } from '../domain/timeline/graph';
import { propagateDelay, compressTimeline } from '../domain/timeline/propagate';
import { getPresetVendorQuotes } from '../domain/vendors/quotes';
import type { ChangeRequestInput } from '../types/plannerExtended';

export interface PlanState {
  readonly context: EventContext;
  readonly budgetItems: ReadonlyArray<BudgetCategoryItem>;
  readonly tasks: ReadonlyArray<TimelineTask>;
  readonly quotes: ReadonlyArray<VendorQuote>;
  readonly subEvents: ReadonlyArray<SubEvent>;
}

export function createInitialState(preset: CelebrationPreset): PlanState {
  return {
    context: preset.context,
    budgetItems: buildInitialBudgetItems(preset.context),
    tasks: buildInitialCelebrationTasks(preset.context),
    quotes: getPresetVendorQuotes(preset.context.occasion),
    subEvents: preset.context.occasion === 'wedding' ? WEDDING_SUB_EVENTS : [],
  };
}

function handleUpdateContext(state: PlanState, updates: Partial<EventContext>): PlanState {
  const merged = { ...state.context, ...updates };
  const budgetItems = mergeBudgetAllocations(merged, state.budgetItems);
  const quotes = updates.occasion && updates.occasion !== state.context.occasion
    ? getPresetVendorQuotes(updates.occasion)
    : state.quotes;
  return { ...state, context: merged, budgetItems, quotes };
}

function handleApplyChange(state: PlanState, payload: ChangeRequestInput): PlanState {
  const { guestDelta = 0, budgetDeltaPercent = 0, costOverrunPercent = 0, timelineDeltaDays = 0 } = payload;
  const newGuests = Math.max(1, state.context.guestCount + guestDelta);
  const newBudget = Math.round(state.context.totalBudget * (1 + budgetDeltaPercent / 100));
  const newDays = Math.max(7, state.context.daysUntilEvent - timelineDeltaDays);

  const nextContext: EventContext = { ...state.context, guestCount: newGuests, totalBudget: newBudget, daysUntilEvent: newDays };
  let budgetItems = mergeBudgetAllocations(nextContext, state.budgetItems);
  if (costOverrunPercent !== 0) {
    const costMult = 1 + costOverrunPercent / 100;
    budgetItems = budgetItems.map((item) => ({ ...item, projectedAmount: Math.round(item.projectedAmount * costMult) }));
  }
  const tasks = timelineDeltaDays !== 0 ? compressTimeline(state.tasks, timelineDeltaDays) : state.tasks;
  return { ...state, context: nextContext, budgetItems, tasks };
}

function handleTaskAction(state: PlanState, action: Extract<PlanAction, { type: 'SET_TASK_STATUS' }>): PlanState {
  const { taskId, status, delayDays } = action.payload;
  const tasks = delayDays && delayDays > 0
    ? propagateDelay(state.tasks, taskId, delayDays)
    : state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
  return { ...state, tasks };
}

function isLifecycleAction(action: PlanAction): action is LifecycleAction {
  return action.type === 'LOAD_PRESET' || action.type === 'UPDATE_CONTEXT' || action.type === 'APPLY_CHANGE' || action.type === 'SET_TASK_STATUS';
}

function reduceLifecycle(state: PlanState, action: LifecycleAction): PlanState {
  switch (action.type) {
    case 'LOAD_PRESET': return createInitialState(action.payload);
    case 'UPDATE_CONTEXT': return handleUpdateContext(state, action.payload);
    case 'APPLY_CHANGE': return handleApplyChange(state, action.payload);
    case 'SET_TASK_STATUS': return handleTaskAction(state, action);
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

function reduceDomain(state: PlanState, action: DomainAction): PlanState {
  switch (action.type) {
    case 'SET_PROJECTED':
      return {
        ...state,
        budgetItems: state.budgetItems.map((item) =>
          item.id === action.payload.categoryId ? { ...item, projectedAmount: action.payload.amount } : item
        ),
      };
    case 'TOGGLE_VERIFIED':
      return {
        ...state,
        budgetItems: state.budgetItems.map((item) =>
          item.id === action.payload.categoryId ? { ...item, isVerifiedQuote: !item.isVerifiedQuote } : item
        ),
      };
    case 'APPLY_TRADEOFF': {
      const adjMap = new Map(action.payload.scenario.categoryAdjustments.map((a) => [a.category, a.revisedAmount]));
      return {
        ...state,
        budgetItems: state.budgetItems.map((item) => {
          const revised = adjMap.get(item.category);
          return revised !== undefined ? { ...item, projectedAmount: revised } : item;
        }),
      };
    }
    case 'ADD_QUOTE': return { ...state, quotes: [action.payload, ...state.quotes] };
    case 'TOGGLE_QUOTE_VERIFIED':
      return {
        ...state,
        quotes: state.quotes.map((q) => (q.id === action.payload.quoteId ? { ...q, isVerifiedQuote: !q.isVerifiedQuote } : q)),
      };
    case 'UPDATE_SUB_EVENT': {
      const { subEventId, updates } = action.payload;
      return {
        ...state,
        subEvents: state.subEvents.map((se) =>
          se.id === subEventId
            ? {
                ...se,
                ...(updates.name !== undefined && { name: updates.name }),
                ...(updates.guestCount !== undefined && { guestCount: updates.guestCount }),
                ...(updates.budgetSharePercent !== undefined && { budgetSharePercent: updates.budgetSharePercent }),
              }
            : se
        ),
      };
    }
    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

export function planReducer(state: PlanState, action: PlanAction): PlanState {
  if (isLifecycleAction(action)) return reduceLifecycle(state, action);
  return reduceDomain(state, action);
}
