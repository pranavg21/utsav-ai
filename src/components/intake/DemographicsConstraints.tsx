/**
 * @fileoverview Age demographics, accessibility needs, and must-have constraints controls.
 */

import React, { useState } from 'react';
import type { AgeGroupSegment, EventContext } from '../../types/planner';
import { sanitizeUserText } from '../../utils/security';

interface DemographicsConstraintsProps {
  readonly context: EventContext;
  readonly onUpdateField: <K extends keyof EventContext>(key: K, value: EventContext[K]) => void;
}

const inputCls =
  'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-saffron-500 focus:outline-none';
const labelCls = 'mb-1 block text-xs font-medium text-slate-400';

export const DemographicsConstraints: React.FC<DemographicsConstraintsProps> = React.memo(
  ({ context, onUpdateField }) => {
    const [accessDraft, setAccessDraft] = useState(context.accessibilityNeeds.join(', '));
    const [mustHaveDraft, setMustHaveDraft] = useState(context.mustHaves.join(', '));

    const toggleAgeGroup = (group: AgeGroupSegment): void => {
      const has = context.ageGroups.includes(group);
      onUpdateField(
        'ageGroups',
        has ? context.ageGroups.filter((g) => g !== group) : [...context.ageGroups, group]
      );
    };

    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Guest Age Mix</h3>
          <div className="flex gap-3">
            {(['children', 'adults', 'seniors'] as const).map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => toggleAgeGroup(g)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  context.ageGroups.includes(g)
                    ? 'border-saffron-500 bg-saffron-500/20 text-saffron-400'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
                aria-label={`Toggle ${g}`}
                aria-pressed={context.ageGroups.includes(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="accessibility">
            Accessibility Needs (comma-separated)
          </label>
          <input
            id="accessibility"
            value={accessDraft}
            onChange={(e) => setAccessDraft(e.target.value)}
            onBlur={() => {
              const parsed = sanitizeUserText(accessDraft)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              onUpdateField('accessibilityNeeds', parsed);
            }}
            className={inputCls}
            aria-label="Accessibility needs"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="mustHaves">
            Must-Haves (comma-separated)
          </label>
          <input
            id="mustHaves"
            value={mustHaveDraft}
            onChange={(e) => setMustHaveDraft(e.target.value)}
            onBlur={() => {
              const parsed = sanitizeUserText(mustHaveDraft)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              onUpdateField('mustHaves', parsed);
            }}
            className={inputCls}
            aria-label="Must-have items"
          />
        </div>
      </div>
    );
  }
);

DemographicsConstraints.displayName = 'DemographicsConstraints';
