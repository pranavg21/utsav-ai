/**
 * @fileoverview Unit tests for the usePlan hook state lifecycle and actions.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlan } from '../hooks/usePlan';
import { BIRTHDAY_PRESET } from '../data/presets';

describe('usePlan hook', () => {
  it('provides initial state, selectors, and updates context', () => {
    const { result } = renderHook(() => usePlan());

    expect(result.current.state.context.eventName).toBeDefined();
    expect(result.current.derived.evaluation).toBeDefined();
    expect(result.current.derived.bottlenecks).toBeDefined();
    expect(result.current.derived.subEventRollup).toBeDefined();

    act(() => {
      result.current.actions.updateContext({ guestCount: 250 });
    });
    expect(result.current.state.context.guestCount).toBe(250);
  });

  it('handles loadPreset, applyChange, and setProjected', () => {
    const { result } = renderHook(() => usePlan());

    act(() => {
      result.current.actions.loadPreset({
        id: 'birthday-preset',
        title: '50th Birthday',
        context: BIRTHDAY_PRESET,
      });
    });
    expect(result.current.state.context.eventName).toBe(BIRTHDAY_PRESET.eventName);

    act(() => {
      result.current.actions.applyChange({ rawPrompt: 'test shock', guestDelta: 10, budgetDeltaPercent: -5 });
    });
    expect(result.current.state.context.guestCount).toBe(BIRTHDAY_PRESET.guestCount + 10);

    const firstItem = result.current.state.budgetItems[0];
    if (firstItem) {
      act(() => {
        result.current.actions.setProjected(firstItem.id, 99000);
        result.current.actions.toggleVerified(firstItem.id);
      });
      expect(result.current.state.budgetItems[0]?.projectedAmount).toBe(99000);
      expect(result.current.state.budgetItems[0]?.isVerifiedQuote).toBe(true);
    }
  });

  it('handles addQuote, toggleQuoteVerified, and setTaskStatus', () => {
    const { result } = renderHook(() => usePlan());

    act(() => {
      result.current.actions.addQuote({
        id: 'q-new-1',
        vendorName: 'Decor Deluxe',
        category: 'Decor & Ambience',
        quotedPrice: 75000,
        guestCapacity: 150,
        inclusions: ['Decor note'],
        hiddenRisks: [],
        clarificationQuestions: [],
        isVerifiedQuote: false,
      });
    });
    expect(result.current.state.quotes.some((q) => q.id === 'q-new-1')).toBe(true);

    act(() => {
      result.current.actions.toggleQuoteVerified('q-new-1');
    });
    const quote = result.current.state.quotes.find((q) => q.id === 'q-new-1');
    expect(quote?.isVerifiedQuote).toBe(true);

    const firstTask = result.current.state.tasks[0];
    if (firstTask) {
      act(() => {
        result.current.actions.setTaskStatus(firstTask.id, 'completed');
      });
      const updated = result.current.state.tasks.find((t) => t.id === firstTask.id);
      expect(updated?.status).toBe('completed');
    }

    const firstCheck = result.current.state.checklist[0];
    if (firstCheck) {
      act(() => {
        result.current.actions.updateChecklistStatus(firstCheck.id, 'booked', {
          bookedPrice: 120000,
          advancePaid: 25000,
        });
      });
      const updatedCheck = result.current.state.checklist.find((c) => c.id === firstCheck.id);
      expect(updatedCheck?.status).toBe('booked');
      expect(updatedCheck?.bookedPrice).toBe(120000);
      expect(updatedCheck?.advancePaid).toBe(25000);

      act(() => {
        result.current.actions.setChecklist([firstCheck]);
      });
      expect(result.current.state.checklist).toHaveLength(1);
    }
  });
});
