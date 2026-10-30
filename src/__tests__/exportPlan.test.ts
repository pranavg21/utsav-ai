/**
 * @fileoverview Unit tests for exportPlan utility verifying JSON payload construction.
 * Tests metadata serialization, versioning, and payload integrity.
 */

import { describe, it, expect, vi } from 'vitest';
import { buildExportPayload, downloadPlanJson } from '../utils/exportPlan';
import { WEDDING_PRESET } from '../data/presets';
import {
  buildInitialBudgetItems,
  evaluateBudgetAndTradeoffs,
} from '../services/budgetTradeoffEngine';
import { buildTimeline } from '../services/timelineDependencyGraph';
import { getPresetVendorQuotes } from '../services/vendorQuoteComparator';

describe('exportPlan utility', () => {
  const budgetItems = buildInitialBudgetItems(WEDDING_PRESET);
  const evaluation = evaluateBudgetAndTradeoffs(WEDDING_PRESET, budgetItems);
  const timeline = buildTimeline(WEDDING_PRESET);
  const vendors = getPresetVendorQuotes(WEDDING_PRESET.occasion);

  it('should construct a complete export payload with metadata', () => {
    const payload = buildExportPayload(WEDDING_PRESET, evaluation, timeline, vendors);

    expect(payload.exportVersion).toBe('1.0.0');
    expect(payload.context.occasion).toBe('wedding');
    expect(payload.budget.items.length).toBeGreaterThan(0);
    expect(payload.timeline.length).toBeGreaterThan(0);
    expect(payload.vendors.length).toBeGreaterThan(0);
    expect(new Date(payload.exportedAt).getTime()).not.toBeNaN();
  });

  it('should trigger download without throwing in browser environment', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    expect(() => {
      downloadPlanJson(WEDDING_PRESET, evaluation, timeline, vendors);
    }).not.toThrow();

    clickSpy.mockRestore();
  });
});
