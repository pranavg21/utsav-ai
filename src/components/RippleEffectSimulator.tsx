/**
 * @fileoverview Ripple-Effect & Change Simulator panel with 1-click SME crisis triggers,
 * custom natural language input, and Before/After impact banner.
 */

import React, { useState, useCallback } from 'react';
import { Zap, MessageSquare } from 'lucide-react';
import type { EventContext, ChangeRequestInput } from '../types/planner';
import { sanitizeUserText } from '../utils/security';
import { CARD_CLASSES, BADGE_BASE, formatINR } from '../utils/uiHelpers';
import { useGeminiAuth } from '../hooks/useGeminiAuth';
import { ProvenanceBadge } from './ProvenanceBadge';
import { formatChangeSummary } from '../domain/changeRequest/parse';
import { aggregateChangePrompt } from '../domain/changeRequest/aggregate';

interface ShockPreset { readonly label: string; readonly input: ChangeRequestInput; }
interface RippleProps { readonly context: EventContext; readonly onApplyChange: (input: ChangeRequestInput) => void; }
interface LastAppliedState { readonly label: string; readonly summary?: string | undefined; }

const SHOCK_BTN_CLASS =
  'flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 ' +
  'text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200';

const PROMPT_INPUT_CLASS =
  'w-full rounded-lg border border-slate-600 bg-slate-900 py-2 pl-9 pr-4 text-sm ' +
  'text-slate-200 placeholder-slate-500 focus:border-saffron-500 focus:outline-none';

export const RippleEffectSimulator: React.FC<RippleProps> = ({ context, onApplyChange }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastApplied, setLastApplied] = useState<LastAppliedState | null>(null);
  const { isConnected } = useGeminiAuth();

  const shocks: ShockPreset[] = [
    {
      label: `+20% Expense Overrun (Costs +20% on ${formatINR(context.totalBudget)})`,
      input: { rawPrompt: '+20% expense overrun', costOverrunPercent: 20 },
    },
    {
      label: '+50 Guests, -10% Budget, 2 Weeks Earlier',
      input: {
        rawPrompt: '+50 guests, -10% budget, 2 weeks earlier',
        guestDelta: 50,
        budgetDeltaPercent: -10,
        timelineDeltaDays: 14,
      },
    },
    {
      label: 'Venue Booking Delayed by 10 Days',
      input: {
        rawPrompt: 'Venue booking delayed by 10 days',
        vendorDelay: { taskId: 'task-venue', days: 10 },
      },
    },
  ];

  const handleShockClick = useCallback(
    (shock: ShockPreset): void => {
      setLastApplied({ label: shock.label, summary: undefined });
      onApplyChange(shock.input);
    },
    [onApplyChange]
  );

  const handleCustomSubmit = useCallback((): void => {
    if (!customPrompt.trim()) return;
    const sanitized = sanitizeUserText(customPrompt);
    const parsed = aggregateChangePrompt(sanitized, context.totalBudget);
    const summary = formatChangeSummary(parsed);
    setLastApplied({ label: sanitized, summary: summary || undefined });
    onApplyChange({ rawPrompt: sanitized });
    setCustomPrompt('');
  }, [context.totalBudget, customPrompt, onApplyChange]);

  return (
    <section className={CARD_CLASSES} aria-label="Ripple effect simulator">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-red-400" aria-hidden="true" />
        <h2 className="text-lg font-bold text-slate-100">Ripple-Effect & Change Simulator</h2>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {shocks.map((shock, idx) => (
          <button
            key={idx}
            onClick={() => handleShockClick(shock)}
            className={SHOCK_BTN_CLASS}
            aria-label={`Apply shock: ${shock.label}`}
          >
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            {shock.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomSubmit();
            }}
            placeholder="Describe any change in natural language…"
            className={PROMPT_INPUT_CLASS}
            aria-label="Custom change request input"
          />
        </div>
        <button
          onClick={handleCustomSubmit}
          className="rounded-lg bg-saffron-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-saffron-500"
          aria-label="Apply custom change"
        >
          Apply
        </button>
      </div>
      {lastApplied && (
        <div
          className="mt-3 rounded-lg border border-slate-700 bg-slate-900/90 p-3"
          role="status"
          aria-live="polite"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className={`${BADGE_BASE} bg-amber-500/20 text-amber-400`}>
              Last Change Applied
            </span>
            <ProvenanceBadge
              provenance={
                isConnected
                  ? { source: 'gemini', model: 'gemini-3.8-flash' }
                  : { source: 'deterministic', reason: 'no-api-key' }
              }
            />
          </div>
          <p className="text-sm font-medium text-slate-200">{lastApplied.label}</p>
          {lastApplied.summary && (
            <p className="mt-1 text-xs font-semibold text-emerald-400">{lastApplied.summary}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default RippleEffectSimulator;
