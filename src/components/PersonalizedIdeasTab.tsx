/**
 * @fileoverview Personalized Ideas tab showing multi-generational theme concepts
 * with children/senior/accessibility adaptations and budget-friendly alternatives.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Lightbulb, Coins, Baby, HeartHandshake, Accessibility } from 'lucide-react';
import type { EventContext, PersonalizedConcept } from '../types/planner';
import { generateThemes } from '../services/geminiPlannerService';
import { CARD_CLASSES, BADGE_BASE } from '../utils/uiHelpers';
import { extractErrorMessage } from '../utils/uiHelpers';

/** Cost fit badge color mapping. */
const COST_FIT_STYLES: Record<PersonalizedConcept['estimatedCostFit'], string> = {
  'Well Within Budget': 'bg-emerald-500/20 text-emerald-400',
  'Moderate Stretch': 'bg-amber-500/20 text-amber-400',
  'Requires Trade-Off': 'bg-red-500/20 text-red-400',
} as const;

/** Props for the PersonalizedIdeasTab component. */
interface IdeasTabProps {
  readonly context: EventContext;
}

/**
 * Displays AI-generated or deterministic personalized theme concepts.
 *
 * @param props - Event context for theme generation.
 * @returns Personalized ideas section React element.
 */
const PersonalizedIdeasTab: React.FC<IdeasTabProps> = ({ context }) => {
  const [themes, setThemes] = useState<PersonalizedConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadThemes = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const result = await generateThemes(context);
      setThemes(result);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => { void loadThemes(); }, [loadThemes]);

  return (
    <section aria-label="Personalized theme ideas">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">Personalized Theme Ideas</h2>
        <button onClick={() => void loadThemes()} disabled={loading} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-saffron-500 hover:text-saffron-400 disabled:opacity-50" aria-label="Regenerate theme ideas">
          {loading ? 'Generating…' : 'Regenerate'}
        </button>
      </div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300" role="alert">{error}</div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {themes.map((theme) => (
          <div key={theme.id} className={CARD_CLASSES}>
            <div className="mb-2 flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 text-marigold-400" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-200">{theme.title}</h3>
            </div>
            <span className={`${BADGE_BASE} mb-2 ${COST_FIT_STYLES[theme.estimatedCostFit]}`}>
              <Coins className="h-3 w-3" aria-hidden="true" />
              {theme.estimatedCostFit}
            </span>
            <p className="mb-3 text-xs text-slate-400">{theme.atmosphereSummary}</p>
            <div className="space-y-2 border-t border-slate-700 pt-3">
              <h4 className="text-xs font-semibold text-slate-300">Multi-Generational Adaptations</h4>
              <div className="flex items-start gap-1.5 text-xs text-slate-400">
                <Baby className="mt-0.5 h-3 w-3 text-pink-400" aria-hidden="true" />
                <span><strong className="text-pink-300">Children:</strong> {theme.multiGenerationalAdaptations.children}</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-slate-400">
                <HeartHandshake className="mt-0.5 h-3 w-3 text-blue-400" aria-hidden="true" />
                <span><strong className="text-blue-300">Seniors:</strong> {theme.multiGenerationalAdaptations.seniors}</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-slate-400">
                <Accessibility className="mt-0.5 h-3 w-3 text-purple-400" aria-hidden="true" />
                <span><strong className="text-purple-300">Accessibility:</strong> {theme.multiGenerationalAdaptations.accessibility}</span>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-300">
              <strong>Budget-Friendly Swap:</strong> {theme.budgetFriendlyAlternative}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PersonalizedIdeasTab;
