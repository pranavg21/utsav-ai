/**
 * @fileoverview Domain action handlers for budget adjustments, sub-events, and vendor checklists.
 */

import type { PlanState } from './planReducer';
import type { DomainAction } from './planActions';
import { updateChecklistItem } from '../domain/vendors/checklist';

/**
 * Handles budget category domain actions (projected edits, verified lock toggle, trade-offs).
 * @param state Current celebration plan state.
 * @param action Dispatched domain action.
 * @returns Updated plan state with recalculated budget item amounts.
 */
export function handleDomainBudget(state: PlanState, action: DomainAction): PlanState {
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
    default:
      return state;
  }
}

/**
 * Handles vendor quote management actions (adding parsed quotes, toggling verification).
 * @param state Current celebration plan state.
 * @param action Dispatched domain action.
 * @returns Updated plan state with modified quotes list.
 */
export function handleDomainQuote(state: PlanState, action: DomainAction): PlanState {
  switch (action.type) {
    case 'ADD_QUOTE':
      return { ...state, quotes: [action.payload, ...state.quotes] };
    case 'TOGGLE_QUOTE_VERIFIED':
      return {
        ...state,
        quotes: state.quotes.map((q) =>
          q.id === action.payload.quoteId ? { ...q, isVerifiedQuote: !q.isVerifiedQuote } : q
        ),
      };
    default:
      return state;
  }
}

/**
 * Handles ceremony sub-event updates (guest headcount, budget share).
 * @param state Current celebration plan state.
 * @param action Dispatched domain action.
 * @returns Updated plan state with revised sub-events.
 */
export function handleDomainSubEvent(state: PlanState, action: DomainAction): PlanState {
  if (action.type !== 'UPDATE_SUB_EVENT') return state;
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

/**
 * Handles vendor checklist status transitions and auto-locks budget items upon booking.
 * @param state Current celebration plan state.
 * @param action Dispatched domain action.
 * @returns Updated plan state with updated checklist and locked budget items.
 */
export function handleDomainChecklist(state: PlanState, action: DomainAction): PlanState {
  if (action.type === 'SET_CHECKLIST') {
    return { ...state, checklist: action.payload };
  }
  if (action.type !== 'UPDATE_CHECKLIST_STATUS') return state;

  const { itemId, status, advancePaid, bookedPrice } = action.payload;
  const updatedChecklist = updateChecklistItem(state.checklist, itemId, status, { advancePaid, bookedPrice });
  const targetItem = updatedChecklist.find((item) => item.id === itemId);

  const isBooked = status === 'booked' || status === 'paid-advance' || status === 'confirmed';
  if (!isBooked || !targetItem || !targetItem.bookedPrice) {
    return { ...state, checklist: updatedChecklist };
  }

  // Update budget item projectedAmount and mark as verified quote
  const categoryToUpdate = targetItem.category;
  const bookedTotalForCategory = updatedChecklist
    .filter((i) => i.category === categoryToUpdate && (i.status === 'booked' || i.status === 'paid-advance' || i.status === 'confirmed'))
    .reduce((sum, i) => sum + (i.bookedPrice ?? i.estimatedCost ?? 0), 0);

  const budgetItems = state.budgetItems.map((b) => {
    if (b.category !== categoryToUpdate) return b;
    return {
      ...b,
      projectedAmount: Math.max(b.projectedAmount, bookedTotalForCategory),
      isVerifiedQuote: true,
    };
  });

  return { ...state, checklist: updatedChecklist, budgetItems };
}
