/**
 * @fileoverview Discriminated union of all actions supported by the UtsavAI plan reducer.
 */

import type {
  CelebrationPreset,
  EventContext,
  TaskStatus,
  TradeOffScenario,
  VendorQuote,
} from '../types/planner';
import type { ChangeRequestInput } from '../types/plannerExtended';

export type LifecycleAction =
  | { readonly type: 'LOAD_PRESET'; readonly payload: CelebrationPreset }
  | { readonly type: 'UPDATE_CONTEXT'; readonly payload: Partial<EventContext> }
  | { readonly type: 'APPLY_CHANGE'; readonly payload: ChangeRequestInput }
  | {
      readonly type: 'SET_TASK_STATUS';
      readonly payload: {
        readonly taskId: string;
        readonly status: TaskStatus;
        readonly delayDays?: number | undefined;
      };
    };

export type DomainAction =
  | { readonly type: 'SET_PROJECTED'; readonly payload: { readonly categoryId: string; readonly amount: number } }
  | { readonly type: 'TOGGLE_VERIFIED'; readonly payload: { readonly categoryId: string } }
  | { readonly type: 'APPLY_TRADEOFF'; readonly payload: { readonly scenario: TradeOffScenario } }
  | { readonly type: 'ADD_QUOTE'; readonly payload: VendorQuote }
  | { readonly type: 'TOGGLE_QUOTE_VERIFIED'; readonly payload: { readonly quoteId: string } }
  | {
      readonly type: 'UPDATE_SUB_EVENT';
      readonly payload: {
        readonly subEventId: string;
        readonly updates: {
          readonly name?: string | undefined;
          readonly guestCount?: number | undefined;
          readonly budgetSharePercent?: number | undefined;
        };
      };
    };

export type PlanAction = LifecycleAction | DomainAction;
