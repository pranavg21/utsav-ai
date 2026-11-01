/**
 * @fileoverview Dynamic deterministic theme generator adapting to demographic constraints (10.6).
 */

import type { EventContext, PersonalizedConcept } from '../../types/planner';

function buildChildrenAdaptation(ageGroups: readonly string[]): string {
  if (ageGroups.includes('children')) {
    return 'Dedicated kids zone with games, craft tables, and safe child seating';
  }
  return 'Adult-oriented sophisticated ambiance with focused priority seating';
}

function buildAccessibilityAdaptation(needs: readonly string[]): string {
  if (needs.length > 0) {
    return `Tailored access for "${needs.join(', ')}" prioritized with step-free ramps and assistance`;
  }
  return 'Step-free circulation pathways with universal ground-level access';
}

function formatMustHaves(mustHaves: readonly string[], index: number): string {
  if (mustHaves.length === 0) return '';
  const item = mustHaves[index % mustHaves.length];
  return item ? ` featuring ${item}` : '';
}

export function buildDeterministicThemes(ctx: EventContext): PersonalizedConcept[] {
  const perGuest = Math.round(ctx.totalBudget / Math.max(1, ctx.guestCount));
  const childAdapt = buildChildrenAdaptation(ctx.ageGroups ?? []);
  const accessAdapt = buildAccessibilityAdaptation(ctx.accessibilityNeeds ?? []);
  const tier = ctx.experienceTier ?? 'Standard';
  const mustHaves = ctx.mustHaves ?? [];

  return [
    {
      id: 'theme-royal-heritage',
      title: 'Royal Heritage Elegance',
      estimatedCostFit: perGuest > 5000 ? 'Well Within Budget' : 'Moderate Stretch',
      atmosphereSummary:
        `Classic Indian ${tier} celebration with heritage motifs and royal decor` +
        `${formatMustHaves(mustHaves, 0)} (₹${perGuest}/guest).`,
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
      atmosphereSummary:
        `Contemporary outdoor ${tier} theme blending modern chic with tradition` +
        `${formatMustHaves(mustHaves, 1)} (₹${perGuest}/guest).`,
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
      atmosphereSummary:
        `Warm ${tier} gathering with regional folk artistry and curated dining for ${ctx.guestCount} guests` +
        `${formatMustHaves(mustHaves, 2)}.`,
      multiGenerationalAdaptations: {
        children: childAdapt,
        seniors: 'Reserved comfortable priority lounge near the main stage',
        accessibility: accessAdapt,
      },
      budgetFriendlyAlternative: 'Collaborate with regional indie artisans for artisanal staging.',
    },
  ];
}
