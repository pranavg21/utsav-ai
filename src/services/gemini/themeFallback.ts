/**
 * @fileoverview Dynamic deterministic theme generator adapting to demographic constraints.
 */

import type { EventContext, PersonalizedConcept } from '../../types/planner';

function buildChildrenAdaptation(ageGroups: readonly string[]): string {
  if (ageGroups.includes('children')) {
    return 'Dedicated activity zone with games, craft tables, and safe child seating';
  }
  return 'Adult-oriented sophisticated ambiance with focused seating arrangements';
}

function buildAccessibilityAdaptation(needs: readonly string[]): string {
  if (needs.length > 0) {
    return `Tailored access: ${needs.join(', ')} prioritized with ramps and dedicated assistance`;
  }
  return 'Step-free circulation pathways with universal ground-level access';
}

export function buildDeterministicThemes(ctx: EventContext): PersonalizedConcept[] {
  const perGuest = Math.round(ctx.totalBudget / Math.max(1, ctx.guestCount));
  const childAdapt = buildChildrenAdaptation(ctx.ageGroups ?? []);
  const accessAdapt = buildAccessibilityAdaptation(ctx.accessibilityNeeds ?? []);
  const tier = ctx.experienceTier ?? 'Standard';
  const mustHaves = ctx.mustHaves ?? [];
  const must1 = mustHaves[0] ? ` incorporating ${mustHaves[0]}` : '';
  const must2 = mustHaves[1] ? ` highlighting ${mustHaves[1]}` : (mustHaves[0] ? ` with ${mustHaves[0]}` : '');

  return [
    {
      id: 'theme-royal-heritage',
      title: 'Royal Heritage Elegance',
      estimatedCostFit: perGuest > 5000 ? 'Well Within Budget' : 'Moderate Stretch',
      atmosphereSummary: `Classic Indian ${tier} celebration with heritage motifs and royal decor${must1} (₹${perGuest}/guest).`,
      multiGenerationalAdaptations: {
        children: childAdapt,
        seniors: 'Spacious ritual seating with noise dampening and minimal transit',
        accessibility: accessAdapt,
      },
      budgetFriendlyAlternative: 'Use localized marigold accents instead of imported floral walls.',
    },
    {
      id: 'theme-modern-fusion',
      title: 'Modern Fusion Garden',
      estimatedCostFit: 'Moderate Stretch',
      atmosphereSummary: `Contemporary outdoor ${tier} theme blending modern chic with tradition${must2}.`,
      multiGenerationalAdaptations: {
        children: childAdapt,
        seniors: 'Acoustic lounge seating away from high-bass audio zones',
        accessibility: accessAdapt,
      },
      budgetFriendlyAlternative: 'Opt for ambient fairy light canopies over heavy trussing.',
    },
    {
      id: 'theme-intimate-soiree',
      title: 'Intimate Cultural Soirée',
      estimatedCostFit: perGuest < 3000 ? 'Requires Trade-Off' : 'Well Within Budget',
      atmosphereSummary: `Warm, close-knit gathering with regional folk artistry and curated dining for ${ctx.guestCount} guests.`,
      multiGenerationalAdaptations: {
        children: childAdapt,
        seniors: 'Reserved comfortable priority lounge near the main stage',
        accessibility: accessAdapt,
      },
      budgetFriendlyAlternative: 'Collaborate with regional indie artisans for artisanal staging.',
    },
  ];
}
