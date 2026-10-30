/**
 * @fileoverview Unit tests for vendor checklist domain operations, occasion templates,
 * timeline synchronization, and budget reconciliation.
 */

import { describe, it, expect } from 'vitest';
import {
  getVendorChecklistTemplates,
  syncChecklistWithTimeline,
  updateChecklistItem,
  calculateChecklistSummary,
  getOverdueVendors,
} from '../domain/vendors/checklist';
import { WEDDING_PRESET } from '../data/presets';
import { buildInitialCelebrationTasks } from '../domain/timeline/graph';
import { planReducer, createInitialState } from '../state/planReducer';

describe('Vendor Checklist Domain & Integration', () => {
  it('provides comprehensive templates for all three occasion verticals', () => {
    const wedding = getVendorChecklistTemplates('wedding');
    const birthday = getVendorChecklistTemplates('birthday');
    const community = getVendorChecklistTemplates('community');

    expect(wedding.length).toBeGreaterThanOrEqual(10);
    expect(birthday.length).toBeGreaterThanOrEqual(7);
    expect(community.length).toBeGreaterThanOrEqual(8);

    // Verify community includes local authority verification
    const approvalItem = community.find((i) => i.id === 'chk-comm-approvals');
    expect(approvalItem).toBeDefined();
    expect(approvalItem?.mustAsk.some((q) => q.includes('Verify with local authority'))).toBe(true);
  });

  it('synchronizes checklist due dates with linked DAG timeline tasks', () => {
    const wedding = getVendorChecklistTemplates('wedding');
    const tasks = buildInitialCelebrationTasks(WEDDING_PRESET);
    const synced = syncChecklistWithTimeline(wedding, tasks);

    const venueItem = synced.find((i) => i.linkedTaskId === 'task-venue');
    const venueTask = tasks.find((t) => t.id === 'task-venue');

    expect(venueItem?.dueDaysBeforeEvent).toBe(venueTask?.daysBeforeEvent);
  });

  it('updates checklist item status and locks quote when booked', () => {
    const wedding = getVendorChecklistTemplates('wedding');
    const updated = updateChecklistItem(wedding, 'chk-wed-caterer', 'booked', {
      bookedPrice: 380000,
      advancePaid: 50000,
    });

    const bookedCaterer = updated.find((i) => i.id === 'chk-wed-caterer');
    expect(bookedCaterer?.status).toBe('booked');
    expect(bookedCaterer?.isVerifiedQuote).toBe(true);
    expect(bookedCaterer?.bookedPrice).toBe(380000);
    expect(bookedCaterer?.advancePaid).toBe(50000);
  });

  it('closes loop with budget: booking a vendor sets category projectedAmount and verifiedQuote', () => {
    const initialState = createInitialState({ id: 'wed', title: 'Wedding', context: WEDDING_PRESET });
    const nextState = planReducer(initialState, {
      type: 'UPDATE_CHECKLIST_STATUS',
      payload: {
        itemId: 'chk-wed-caterer',
        status: 'booked',
        bookedPrice: 420000,
        advancePaid: 100000,
      },
    });

    const cateringBudget = nextState.budgetItems.find((b) => b.category === 'Catering & Hospitality');
    expect(cateringBudget?.isVerifiedQuote).toBe(true);
    expect(cateringBudget?.projectedAmount).toBeGreaterThanOrEqual(420000);
  });

  it('calculates summary rollups and detects overdue unbooked vendors', () => {
    const birthday = getVendorChecklistTemplates('birthday');
    const updated = updateChecklistItem(birthday, 'chk-bday-cake', 'booked', {
      bookedPrice: 10000,
      advancePaid: 3000,
    });
    const summary = calculateChecklistSummary(updated, 10);

    expect(summary.totalItems).toBe(birthday.length);
    expect(summary.bookedCount).toBe(1);
    expect(summary.totalBookedAmount).toBe(10000);
    expect(summary.totalAdvancePaid).toBe(3000);

    const overdue = getOverdueVendors(birthday, 10);
    expect(overdue.length).toBeGreaterThan(0);
  });
});

