/**
 * @fileoverview Type contract tests for extended planner interfaces.
 * Validates domain contracts for TimelineTask, VendorQuote, and PersonalizedConcept.
 */

import { describe, it, expect } from 'vitest';
import type { TimelineTask, VendorQuote, PersonalizedConcept } from '../types/plannerExtended';

describe('plannerExtended type contracts', () => {
  it('should conform to TimelineTask interface shape', () => {
    const task: TimelineTask = {
      id: 'task-venue',
      title: 'Book Venue',
      phase: 'Foundation',
      daysBeforeEvent: 120,
      delayDays: 0,
      status: 'pending',
      dependsOn: [],
      isBottleneck: false,
      delayImpactNote: '',
    };

    expect(task.id).toBe('task-venue');
    expect(task.phase).toBe('Foundation');
    expect(task.status).toBe('pending');
    expect(Array.isArray(task.dependsOn)).toBe(true);
  });

  it('should conform to VendorQuote interface shape', () => {
    const quote: VendorQuote = {
      id: 'quote-1',
      vendorName: 'Royal Palace',
      category: 'Venue & Logistics',
      quotedPrice: 350000,
      guestCapacity: 300,
      isVerifiedQuote: false,
      inclusions: ['Hall', 'Chairs'],
      hiddenRisks: ['Electricity surcharge'],
      clarificationQuestions: ['Is GST included?'],
    };

    expect(quote.id).toBe('quote-1');
    expect(quote.category).toBe('Venue & Logistics');
    expect(quote.inclusions.length).toBe(2);
  });

  it('should conform to PersonalizedConcept interface shape', () => {
    const concept: PersonalizedConcept = {
      id: 'theme-1',
      title: 'Royal Heritage',
      estimatedCostFit: 'Well Within Budget',
      atmosphereSummary: 'Traditional grandeur',
      multiGenerationalAdaptations: {
        children: 'Kids activity zone',
        seniors: 'Quiet seating area',
        accessibility: 'Ramps and wide pathways',
      },
      budgetFriendlyAlternative: 'Use local flowers',
    };

    expect(concept.id).toBe('theme-1');
    expect(concept.estimatedCostFit).toBe('Well Within Budget');
    expect(concept.multiGenerationalAdaptations.seniors).toBe('Quiet seating area');
  });
});
