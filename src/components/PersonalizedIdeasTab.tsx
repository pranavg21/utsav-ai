/**
 * @fileoverview Personalized Ideas tab showing multi-generational theme concepts
 * with children/senior/accessibility adaptations, budget-friendly alternatives, and GenAI provenance.
 */

import React from 'react';
import { Lightbulb, Coins, Baby, HeartHandshake, Accessibility } from 'lucide-react';
import type { EventContext, PersonalizedConcept } from '../types/planner';
import { useThemes } from '../hooks/useThemes';
import { ProvenanceBadge } from './ProvenanceBadge';
import { CARD_CLASSES, BADGE_BASE } from '../utils/uiHelpers';

const COST_FIT_STYLES: Record<PersonalizedConcept['estimatedCostFit'], string> = {
  'Well Within Budget': 'bg-emerald-500/20 text-emerald-400',
  'Moderate Stretch': 'bg-amber-500/20 text-amber-400',
  'Requires Trade-Off': 'bg-red-500/20 text-red-400',
};

interface IdeasTabProps {
  readonly context: EventContext;
}

export const PersonalizedIdeasTab: React.FC<IdeasTabProps> = ({ context }) => {
  const { themes, provenance, loading, error, refreshThemes } = useThemes(context);

  return (
    <section aria-label="Personalized theme ideas" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-saffron-400" /> Personalized Theme Concepts
          </h2>
          <p className="text-xs text-slate-400">
            Multi-generational celebration styling tailored for {context.guestCount} guests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {provenance && <ProvenanceBadge provenance={provenance} />}
          <button
            type="button"
            onClick={refreshThemes}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-saffron-500 hover:text-saffron-400 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Regenerate Ideas'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && themes.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
          Crafting personalized concepts with Gemini 2.5 Flash...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <div key={theme.id} className={`${CARD_CLASSES} flex flex-col justify-between p-5 space-y-4`}>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-100">{theme.title}</h3>
                  <span className={`${BADGE_BASE} ${COST_FIT_STYLES[theme.estimatedCostFit]}`}>
                    {theme.estimatedCostFit}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{theme.atmosphereSummary}</p>
              </div>

              <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                <h4 className="font-medium text-slate-400">Multi-Generational Inclusivity:</h4>
                <div className="flex items-center gap-2 text-slate-300">
                  <Baby className="h-3.5 w-3.5 text-pink-400 shrink-0" aria-hidden="true" />
                  <span>{theme.multiGenerationalAdaptations.children}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <HeartHandshake className="h-3.5 w-3.5 text-purple-400 shrink-0" aria-hidden="true" />
                  <span>{theme.multiGenerationalAdaptations.seniors}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Accessibility className="h-3.5 w-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                  <span>{theme.multiGenerationalAdaptations.accessibility}</span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-amber-400 mb-1">
                  <Coins className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Budget-Friendly Swap:
                </div>
                <p className="text-slate-300">{theme.budgetFriendlyAlternative}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PersonalizedIdeasTab;
