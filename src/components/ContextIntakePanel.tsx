/**
 * @fileoverview Context-First Diagnostic Intake panel for configuring event parameters.
 * Captures occasion, budget, guests, timeline, experience tier, priority ranking,
 * age groups, accessibility needs, and must-haves.
 */

import React, { useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { EventContext, OccasionType, ExperienceTier, AgeGroupSegment, BudgetCategoryName } from '../types/planner';
import { sanitizeUserText, validateNumericBound } from '../utils/security';
import { CARD_CLASSES } from '../utils/uiHelpers';

/** All available budget categories for the priority ranker. */
const ALL_CATEGORIES: BudgetCategoryName[] = [
  'Venue & Logistics', 'Catering & Hospitality', 'Decor & Ambience',
  'Photography & Media', 'Entertainment & Rituals', 'Contingency Reserve',
];

/** Props for the ContextIntakePanel component. */
interface IntakePanelProps {
  readonly context: EventContext;
  readonly onUpdate: (ctx: EventContext) => void;
}

/**
 * Interactive diagnostic intake form for full event configuration.
 *
 * @param props - Panel props with current context and update callback.
 * @returns Form section React element.
 */
const ContextIntakePanel: React.FC<IntakePanelProps> = ({ context, onUpdate }) => {
  const updateField = useCallback(<K extends keyof EventContext>(key: K, value: EventContext[K]): void => {
    onUpdate({ ...context, [key]: value });
  }, [context, onUpdate]);

  const movePriority = useCallback((idx: number, dir: -1 | 1): void => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= context.priorityRanking.length) { return; }
    const updated = [...context.priorityRanking];
    const temp = updated[idx]!;
    updated[idx] = updated[newIdx]!;
    updated[newIdx] = temp;
    updateField('priorityRanking', updated);
  }, [context.priorityRanking, updateField]);

  const toggleAgeGroup = useCallback((group: AgeGroupSegment): void => {
    const has = context.ageGroups.includes(group);
    updateField('ageGroups', has ? context.ageGroups.filter((g) => g !== group) : [...context.ageGroups, group]);
  }, [context.ageGroups, updateField]);

  const inputCls = 'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-saffron-500 focus:outline-none';
  const labelCls = 'mb-1 block text-xs font-medium text-slate-400';

  return (
    <section className={CARD_CLASSES} aria-label="Event configuration">
      <h2 className="mb-4 text-lg font-bold text-slate-100">Context-First Diagnostic Intake</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="occasion">Occasion</label>
          <select id="occasion" value={context.occasion} onChange={(e) => updateField('occasion', e.target.value as OccasionType)} className={inputCls} aria-label="Select occasion type">
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="community">Community Event</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="eventName">Event Name</label>
          <input id="eventName" value={context.eventName} onChange={(e) => updateField('eventName', sanitizeUserText(e.target.value, 100))} className={inputCls} aria-label="Event name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="budget">Budget (₹)</label>
          <input id="budget" type="number" value={context.totalBudget} onChange={(e) => updateField('totalBudget', validateNumericBound(Number(e.target.value), 10000, 100000000))} className={inputCls} aria-label="Total budget in rupees" />
        </div>
        <div>
          <label className={labelCls} htmlFor="guests">Guest Count</label>
          <input id="guests" type="number" value={context.guestCount} onChange={(e) => updateField('guestCount', validateNumericBound(Number(e.target.value), 1, 10000))} className={inputCls} aria-label="Number of guests" />
        </div>
        <div>
          <label className={labelCls} htmlFor="days">Days Until Event</label>
          <input id="days" type="number" value={context.daysUntilEvent} onChange={(e) => updateField('daysUntilEvent', validateNumericBound(Number(e.target.value), 1, 730))} className={inputCls} aria-label="Days until event" />
        </div>
        <div>
          <label className={labelCls} htmlFor="tier">Experience Tier</label>
          <select id="tier" value={context.experienceTier} onChange={(e) => updateField('experienceTier', e.target.value as ExperienceTier)} className={inputCls} aria-label="Experience tier">
            <option value="intimate">Intimate</option>
            <option value="balanced">Balanced</option>
            <option value="grand">Grand</option>
          </select>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Priority Ranking (drag to reorder)</h3>
          <div className="space-y-1">
            {context.priorityRanking.map((cat, idx) => (
              <div key={cat} className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-1.5 text-sm text-slate-300">
                <span className="w-5 text-xs font-bold text-saffron-500">#{idx + 1}</span>
                <span className="flex-1">{cat}</span>
                <button onClick={() => movePriority(idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-500 hover:text-saffron-400 disabled:opacity-30" aria-label={`Move ${cat} up`}><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => movePriority(idx, 1)} disabled={idx === ALL_CATEGORIES.length - 1} className="p-0.5 text-slate-500 hover:text-saffron-400 disabled:opacity-30" aria-label={`Move ${cat} down`}><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-300">Guest Age Mix</h3>
            <div className="flex gap-3">
              {(['children', 'adults', 'seniors'] as const).map((g) => (
                <button key={g} onClick={() => toggleAgeGroup(g)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${context.ageGroups.includes(g) ? 'border-saffron-500 bg-saffron-500/20 text-saffron-400' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`} aria-label={`Toggle ${g}`} aria-pressed={context.ageGroups.includes(g)}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="accessibility">Accessibility Needs (comma-separated)</label>
            <input id="accessibility" value={context.accessibilityNeeds.join(', ')} onChange={(e) => updateField('accessibilityNeeds', sanitizeUserText(e.target.value).split(',').map((s) => s.trim()).filter(Boolean))} className={inputCls} aria-label="Accessibility needs" />
          </div>
          <div>
            <label className={labelCls} htmlFor="mustHaves">Must-Haves (comma-separated)</label>
            <input id="mustHaves" value={context.mustHaves.join(', ')} onChange={(e) => updateField('mustHaves', sanitizeUserText(e.target.value).split(',').map((s) => s.trim()).filter(Boolean))} className={inputCls} aria-label="Must-have items" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContextIntakePanel;
