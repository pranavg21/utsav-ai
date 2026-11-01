/**
 * @fileoverview Ripple-Effect & Change Simulator panel with 1-click SME crisis triggers,
 * custom natural language input, and Before/After impact banner.
 */

import React, { useState, useCallback } from 'react';
import { Zap, MessageSquare } from 'lucide-react';
import type { EventContext, ChangeRequestInput } from '../types/planner';
import { sanitizeUserText } from '../utils/security';
import { CARD_CLASSES, BADGE_BASE, formatINR } from '../utils/uiHelpers';
import { ProvenanceBadge } from './ProvenanceBadge';
import { useChangeRequestAi } from '../hooks/useChangeRequestAi';

interface ShockPreset { readonly label: string; readonly input: ChangeRequestInput; }
interface RippleProps { readonly context: EventContext; readonly onApplyChange: (input: ChangeRequestInput) => void; }
interface LastAppliedState { readonly label: string; readonly summary?: string | undefined; }

const SHOCK_BTN_CLASS =
  'flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 ' +
  'text-xs font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200';

const PROMPT_INPUT_CLASS =
  'w-full rounded-lg border border-slate-600 bg-slate-900 py-2 pl-9 pr-4 text-sm ' +
  'text-slate-200 placeholder-slate-500 focus:border-saffron-500 focus:outline-none';

/** Interactive simulation panel applying natural language change requests and predefined budget/timeline shocks. */
export const RippleEffectSimulator: React.FC<RippleProps> = ({ context, onApplyChange }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [lastApplied, setLastApplied] = useState<LastAppliedState | null>(null);
  const { isPending, lastProvenance, lastResponseJson, lastSummary, applyChangeAi } = useChangeRequestAi();

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

  const handleCustomSubmit = useCallback(async (): Promise<void> => {
    if (!customPrompt.trim() || isPending) return;
    const sanitized = sanitizeUserText(customPrompt);
    setCustomPrompt('');
    setLastApplied({ label: sanitized });
    await applyChangeAi(context, sanitized, onApplyChange);
  }, [applyChangeAi, context, customPrompt, isPending, onApplyChange]);

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
              if (e.key === 'Enter') void handleCustomSubmit();
            }}
            placeholder="Describe any change in natural language…"
            className={PROMPT_INPUT_CLASS}
            aria-label="Custom change request input"
          />
        </div>
        <button
          onClick={() => { void handleCustomSubmit(); }}
          disabled={isPending}
          className="rounded-lg bg-saffron-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-saffron-500 disabled:opacity-50"
          aria-label="Apply custom change"
        >
          {isPending ? 'Analyzing…' : 'Apply'}
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
            {lastProvenance && <ProvenanceBadge provenance={lastProvenance} />}
          </div>
          <p className="text-sm font-medium text-slate-200">{lastApplied.label}</p>
          {(lastSummary ?? lastApplied.summary) && (
            <p className="mt-1 text-xs font-semibold text-emerald-400">
              {lastSummary ?? lastApplied.summary}
            </p>
          )}
          {lastResponseJson && (
            <details className="mt-2 rounded border border-slate-800 bg-slate-950 p-2 text-xs text-slate-400">
              <summary className="cursor-pointer font-medium text-slate-300">Gemini response</summary>
              <pre className="mt-1 overflow-x-auto text-[11px] text-emerald-400">{lastResponseJson}</pre>
            </details>
          )}
        </div>
      )}
    </section>
  );
};

export default RippleEffectSimulator;
