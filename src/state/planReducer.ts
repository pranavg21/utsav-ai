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
import { getSubEventsForOccasion } from '../domain/subEvents/types';
import { buildInitialBudgetItems, mergeBudgetAllocations } from '../domain/budget/allocation';
import { buildInitialCelebrationTasks } from '../domain/timeline/graph';
import { propagateDelay, compressTimeline } from '../domain/timeline/propagate';
import { getPresetVendorQuotes } from '../domain/vendors/quotes';
import type { ChangeRequestInput } from '../types/plannerExtended';
import type { VendorChecklistItem } from '../domain/vendors/types';
import { getVendorChecklistTemplates, syncChecklistWithTimeline } from '../domain/vendors/checklist';
import {
  handleDomainBudget,
  handleDomainQuote,
  handleDomainSubEvent,
  handleDomainChecklist,
} from './domainHandlers';

export interface PlanState {
  readonly context: EventContext;
  readonly budgetItems: ReadonlyArray<BudgetCategoryItem>;
  readonly tasks: ReadonlyArray<TimelineTask>;
  readonly quotes: ReadonlyArray<VendorQuote>;
  readonly subEvents: ReadonlyArray<SubEvent>;
  readonly checklist: ReadonlyArray<VendorChecklistItem>;
}

export function createInitialState(preset: CelebrationPreset): PlanState {
  const tasks = buildInitialCelebrationTasks(preset.context);
  const checklist = syncChecklistWithTimeline(
    getVendorChecklistTemplates(preset.context.occasion),
    tasks
  );

  return {
    context: preset.context,
    budgetItems: buildInitialBudgetItems(preset.context),
    tasks,
    quotes: getPresetVendorQuotes(preset.context.occasion),
    subEvents: getSubEventsForOccasion(preset.context.occasion),
    checklist,
  };
}

function handleUpdateContext(state: PlanState, updates: Partial<EventContext>): PlanState {
  const merged = { ...state.context, ...updates };
  const budgetItems = mergeBudgetAllocations(merged, state.budgetItems);
  const occasionChanged = updates.occasion && updates.occasion !== state.context.occasion;
  const quotes = occasionChanged ? getPresetVendorQuotes(updates.occasion) : state.quotes;
  const subEvents = occasionChanged ? getSubEventsForOccasion(updates.occasion) : state.subEvents;
  const checklist = occasionChanged
    ? syncChecklistWithTimeline(getVendorChecklistTemplates(updates.occasion), state.tasks)
    : state.checklist;

  return { ...state, context: merged, budgetItems, quotes, subEvents, checklist };
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
  const checklist = syncChecklistWithTimeline(state.checklist, tasks);
  return { ...state, context: nextContext, budgetItems, tasks, checklist };
}

function handleTaskAction(state: PlanState, action: Extract<PlanAction, { type: 'SET_TASK_STATUS' }>): PlanState {
  const { taskId, status, delayDays } = action.payload;
  const tasks = delayDays && delayDays > 0
    ? propagateDelay(state.tasks, taskId, delayDays)
    : state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
  const checklist = syncChecklistWithTimeline(state.checklist, tasks);
  return { ...state, tasks, checklist };
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
  }
}

function reduceDomain(state: PlanState, action: DomainAction): PlanState {
  switch (action.type) {
    case 'SET_PROJECTED':
    case 'TOGGLE_VERIFIED':
    case 'APPLY_TRADEOFF':
      return handleDomainBudget(state, action);
    case 'ADD_QUOTE':
    case 'TOGGLE_QUOTE_VERIFIED':
      return handleDomainQuote(state, action);
    case 'UPDATE_SUB_EVENT':
      return handleDomainSubEvent(state, action);
    case 'UPDATE_CHECKLIST_STATUS':
    case 'SET_CHECKLIST':
      return handleDomainChecklist(state, action);
  }
}

export function planReducer(state: PlanState, action: PlanAction): PlanState {
  if (isLifecycleAction(action)) return reduceLifecycle(state, action);
  return reduceDomain(state, action);
}
