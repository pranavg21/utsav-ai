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

const REGEN_BTN_CLASS =
  'rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium ' +
  'text-slate-300 transition hover:border-saffron-500 hover:text-saffron-400 disabled:opacity-50';

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
            className={REGEN_BTN_CLASS}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <article
            key={theme.id}
            className={`${CARD_CLASSES} flex flex-col justify-between`}
            aria-labelledby={`theme-title-${theme.id}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`${BADGE_BASE} ${COST_FIT_STYLES[theme.estimatedCostFit]}`}>
                  <Coins className="w-3 h-3" /> {theme.estimatedCostFit}
                </span>
              </div>
              <h3 id={`theme-title-${theme.id}`} className="text-base font-bold text-slate-100">
                {theme.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{theme.atmosphereSummary}</p>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <Baby className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Kids:</strong> {theme.multiGenerationalAdaptations.children}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Seniors:</strong> {theme.multiGenerationalAdaptations.seniors}</span>
                </div>
                {theme.multiGenerationalAdaptations.accessibility && (
                  <div className="flex items-start gap-2 text-slate-300">
                    <Accessibility className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Access:</strong> {theme.multiGenerationalAdaptations.accessibility}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 -mx-4 -mb-4 p-3 rounded-b-xl">
              <p className="text-[11px] text-emerald-400">
                <strong>Budget alternative:</strong> {theme.budgetFriendlyAlternative}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PersonalizedIdeasTab;
