/**
 * @fileoverview Lifecycle action reducers for celebration context and change processing.
 */

import type { EventContext } from '../types/planner';
import type { ChangeRequestInput } from '../types/plannerExtended';
import { mergeBudgetAllocations } from '../domain/budget/allocation';
import { resolveChangeDeltas } from '../domain/changeRequest/aggregate';
import { compressTimeline, propagateDelay, recalculateTimeline } from '../domain/timeline/propagate';
import { getPresetVendorQuotes } from '../domain/vendors/quotes';
import { getSubEventsForOccasion } from '../domain/subEvents/types';
import { getVendorChecklistTemplates, syncChecklistWithTimeline } from '../domain/vendors/checklist';
import type { PlanState } from './planReducer';
import type { LifecycleAction } from './planActions';

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
  const d = resolveChangeDeltas(payload, state.context.totalBudget);
  const overrun = d.costOverrunPercent ?? payload.costOverrunPercent ?? 0;

  const newGuests = Math.max(1, state.context.guestCount + d.guestDelta);
  const newBudget = Math.round(state.context.totalBudget * (1 + d.budgetDeltaPercent / 100));
  const newDays = Math.max(7, state.context.daysUntilEvent - d.timelineDeltaDays);
  const nextContext: EventContext = { ...state.context, guestCount: newGuests, totalBudget: newBudget, daysUntilEvent: newDays };

  const rawBudget = mergeBudgetAllocations(nextContext, state.budgetItems);
  const budgetItems = overrun === 0 ? rawBudget : rawBudget.map((item) => ({
    ...item,
    projectedAmount: Math.round(item.projectedAmount * (1 + overrun / 100)),
  }));

  let tasks = d.timelineDeltaDays !== 0 ? compressTimeline(state.tasks, d.timelineDeltaDays) : state.tasks;
  if (d.vendorDelay && d.vendorDelay.days > 0) {
    tasks = propagateDelay(tasks, d.vendorDelay.taskId, d.vendorDelay.days);
  }
  const checklist = syncChecklistWithTimeline(state.checklist, tasks);
  return { ...state, context: nextContext, budgetItems, tasks, checklist };
}

function handleTaskAction(state: PlanState, action: Extract<LifecycleAction, { type: 'SET_TASK_STATUS' }>): PlanState {
  const { taskId, status, delayDays = 0 } = action.payload;
  const ownDelay = status === 'delayed' ? (delayDays > 0 ? delayDays : 10) : 0;
  const overrides = new Map<string, number>([[taskId, ownDelay]]);
  const updatedTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status, ownDelayDays: ownDelay } : t));
  const recalcResult = recalculateTimeline(updatedTasks, overrides);
  const tasks = recalcResult.ok ? recalcResult.value : updatedTasks;
  const checklist = syncChecklistWithTimeline(state.checklist, tasks);
  return { ...state, tasks, checklist };
}

/**
 * Handles core lifecycle actions (context updates, natural language change application, task delays).
 * @param state Current celebration plan state.
 * @param action Dispatched lifecycle action.
 * @param onPreset Function to construct initial state on LOAD_PRESET.
 * @returns Transitioned plan state.
 */
export function reduceLifecycle(
  state: PlanState,
  action: LifecycleAction,
  onPreset: (action: Extract<LifecycleAction, { type: 'LOAD_PRESET' }>) => PlanState
): PlanState {
  switch (action.type) {
    case 'LOAD_PRESET': return onPreset(action);
    case 'UPDATE_CONTEXT': return handleUpdateContext(state, action.payload);
    case 'APPLY_CHANGE': return handleApplyChange(state, action.payload);
    case 'SET_TASK_STATUS': return handleTaskAction(state, action);
  }
}
