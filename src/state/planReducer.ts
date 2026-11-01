/**
 * @fileoverview Main state management reducer for celebration planning.
 */

import type {
  CelebrationPreset,
  EventContext,
  BudgetCategoryItem,
  TimelineTask,
  VendorQuote,
} from '../types/planner';
import type { SubEvent } from '../domain/subEvents/types';
import type { VendorChecklistItem } from '../domain/vendors/types';
import { buildInitialBudgetItems } from '../domain/budget/allocation';
import { buildInitialCelebrationTasks } from '../domain/timeline/graph';
import { getPresetVendorQuotes } from '../domain/vendors/quotes';
import { getSubEventsForOccasion } from '../domain/subEvents/types';
import { getVendorChecklistTemplates, syncChecklistWithTimeline } from '../domain/vendors/checklist';
import type { PlanAction, LifecycleAction, DomainAction } from './planActions';
import {
  handleDomainBudget,
  handleDomainQuote,
  handleDomainSubEvent,
  handleDomainChecklist,
} from './domainHandlers';
import { reduceLifecycle } from './lifecycleHandlers';

/** Complete state schema of the UtsavAI celebration planning engine. */
export interface PlanState {
  readonly context: EventContext;
  readonly budgetItems: ReadonlyArray<BudgetCategoryItem>;
  readonly tasks: ReadonlyArray<TimelineTask>;
  readonly quotes: ReadonlyArray<VendorQuote>;
  readonly subEvents: ReadonlyArray<SubEvent>;
  readonly checklist: ReadonlyArray<VendorChecklistItem>;
}

/**
 * Creates the initial celebration plan state from a preset blueprint.
 * @param preset Celebration preset containing baseline event context.
 * @returns Fully populated initial PlanState.
 */
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

function isLifecycleAction(action: PlanAction): action is LifecycleAction {
  return (
    action.type === 'LOAD_PRESET' || action.type === 'UPDATE_CONTEXT' ||
    action.type === 'APPLY_CHANGE' || action.type === 'SET_TASK_STATUS'
  );
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

/**
 * Root state transition reducer processing lifecycle and domain actions.
 * @param state Current celebration plan state.
 * @param action Dispatched celebration plan action.
 * @returns Next immutable celebration plan state.
 */
export function planReducer(state: PlanState, action: PlanAction): PlanState {
  if (isLifecycleAction(action)) {
    return reduceLifecycle(state, action, (act) => createInitialState(act.payload));
  }
  return reduceDomain(state, action);
}
