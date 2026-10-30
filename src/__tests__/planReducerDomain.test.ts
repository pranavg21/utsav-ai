/**
 * @fileoverview Unit tests for quote, sub-event, and checklist domain actions in planReducer.
 */

import { describe, it, expect } from 'vitest';
import { planReducer, createInitialState } from '../state/planReducer';
import { WEDDING_PRESET } from '../data/presets';
import type { CelebrationPreset, VendorQuote } from '../types/planner';

describe('planReducer domain actions', () => {
  const initialPreset: CelebrationPreset = { id: 'test-wedding', title: 'Test Wedding', context: WEDDING_PRESET };

  it('handles ADD_QUOTE, TOGGLE_QUOTE_VERIFIED, and UPDATE_SUB_EVENT', () => {
    const state = createInitialState(initialPreset);
    const newQuote: VendorQuote = {
      id: 'quote-test-99',
      vendorName: 'Royal Decorators',
      category: 'Decor & Ambience',
      quotedPrice: 50000,
      guestCapacity: 200,
      isVerifiedQuote: false,
      inclusions: ['Mandap setup'],
      hiddenRisks: [],
      clarificationQuestions: [],
    };

    const stateWithQuote = planReducer(state, { type: 'ADD_QUOTE', payload: newQuote });
    expect(stateWithQuote.quotes[0]?.id).toBe('quote-test-99');

    const stateToggled = planReducer(stateWithQuote, {
      type: 'TOGGLE_QUOTE_VERIFIED',
      payload: { quoteId: 'quote-test-99' },
    });
    expect(stateToggled.quotes[0]?.isVerifiedQuote).toBe(true);

    if (state.subEvents.length > 0) {
      const firstSubEvent = state.subEvents[0];
      if (!firstSubEvent) throw new Error('SubEvent missing');
      const updatedSub = planReducer(state, {
        type: 'UPDATE_SUB_EVENT',
        payload: { subEventId: firstSubEvent.id, updates: { guestCount: 120 } },
      });
      expect(updatedSub.subEvents[0]?.guestCount).toBe(120);
    }

    const firstChecklist = state.checklist[0];
    if (firstChecklist) {
      const stateShortlisted = planReducer(state, {
        type: 'UPDATE_CHECKLIST_STATUS',
        payload: { itemId: firstChecklist.id, status: 'shortlisted' },
      });
      expect(stateShortlisted.checklist[0]?.status).toBe('shortlisted');

      const stateReset = planReducer(state, {
        type: 'SET_CHECKLIST',
        payload: [firstChecklist],
      });
      expect(stateReset.checklist).toHaveLength(1);
    }
  });
});

