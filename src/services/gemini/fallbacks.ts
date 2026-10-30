/**
 * @fileoverview Bulletproof deterministic fallbacks for celebration themes and change requests.
 */

import type { EventContext, PersonalizedConcept } from '../../types/planner';
import type { ChangeRequestInput } from '../../types/plannerExtended';

export interface ParsedChangeResult {
  readonly guestDelta: number;
  readonly budgetDeltaPercent: number;
  readonly timelineDeltaDays: number;
  readonly impactSummary: string;
  readonly recommendedActions: readonly string[];
}

export function buildDeterministicChangeResult(input: ChangeRequestInput): ParsedChangeResult {
  return {
    guestDelta: input.guestDelta ?? 0,
    budgetDeltaPercent: input.budgetDeltaPercent ?? 0,
    timelineDeltaDays: input.timelineDeltaDays ?? 0,
    impactSummary: `Applying: ${input.rawPrompt}. Budget/guest/timeline recalculated deterministically.`,
    recommendedActions: [
      'Review updated budget matrix',
      'Check timeline for bottlenecks',
      'Verify vendor capacity',
    ],
  };
}

export function buildDeterministicThemes(ctx: EventContext): PersonalizedConcept[] {
  const perGuest = Math.round(ctx.totalBudget / Math.max(1, ctx.guestCount));
  const base = {
    children: 'Kid-friendly activity zone with safe seating',
    seniors: 'Comfortable seating with easy access to amenities',
    accessibility: 'Wheelchair-accessible layout with clear signage',
  };
  return [
    {
      id: 'theme-1',
      title: 'Royal Heritage Elegance',
      estimatedCostFit: 'Well Within Budget',
      atmosphereSummary: `Classic Indian celebration with heritage motifs (₹${perGuest}/guest).`,
      multiGenerationalAdaptations: base,
      budgetFriendlyAlternative: 'Use marigold garlands instead of imported floral arrangements',
    },
    {
      id: 'theme-2',
      title: 'Modern Fusion Garden',
      estimatedCostFit: 'Moderate Stretch',
      atmosphereSummary: 'Contemporary outdoor theme blending modern and traditional elements.',
      multiGenerationalAdaptations: base,
      budgetFriendlyAlternative: 'DIY fairy lights instead of professional LED installations',
    },
    {
      id: 'theme-3',
      title: 'Intimate Cultural Soirée',
      estimatedCostFit: perGuest < 3000 ? 'Requires Trade-Off' : 'Well Within Budget',
      atmosphereSummary: 'Warm, close-knit gathering with folk music and regional cuisine.',
      multiGenerationalAdaptations: base,
      budgetFriendlyAlternative: 'Local folk artists instead of professional entertainment troupe',
    },
  ];
}
