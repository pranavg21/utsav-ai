/**
 * @fileoverview Basic celebration intake fields: Occasion, Name, Budget, Guests, Days, Tier.
 */

import React from 'react';
import type { EventContext } from '../../types/planner';
import { isOccasionType, isExperienceTier } from '../../utils/typeGuards';
import { sanitizeUserText } from '../../utils/security';
import { NumericInputField } from './NumericInputField';

interface BasicEventFieldsProps {
  readonly context: EventContext;
  readonly onUpdateField: <K extends keyof EventContext>(key: K, value: EventContext[K]) => void;
}

const inputCls =
  'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-saffron-500 focus:outline-none';
const labelCls = 'mb-1 block text-xs font-medium text-slate-400';

export const BasicEventFields: React.FC<BasicEventFieldsProps> = React.memo(({ context, onUpdateField }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className={labelCls} htmlFor="occasion">Occasion</label>
        <select
          id="occasion"
          value={context.occasion}
          onChange={(e) => {
            const v = e.target.value;
            if (isOccasionType(v)) onUpdateField('occasion', v);
          }}
          className={inputCls}
          aria-label="Select occasion type"
        >
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="community">Community Event</option>
        </select>
      </div>

      <div>
        <label className={labelCls} htmlFor="eventName">Event Name</label>
        <input
          id="eventName"
          value={context.eventName}
          onChange={(e) => onUpdateField('eventName', sanitizeUserText(e.target.value, 100))}
          className={inputCls}
          aria-label="Event name"
        />
      </div>

      <NumericInputField
        id="budget"
        label="Budget (₹)"
        value={context.totalBudget}
        min={10000}
        max={100000000}
        ariaLabel="Total budget in rupees"
        onUpdate={(val) => onUpdateField('totalBudget', val)}
      />

      <NumericInputField
        id="guests"
        label="Guest Count"
        value={context.guestCount}
        min={1}
        max={10000}
        ariaLabel="Number of guests"
        onUpdate={(val) => onUpdateField('guestCount', val)}
      />

      <NumericInputField
        id="days"
        label="Days Until Event"
        value={context.daysUntilEvent}
        min={1}
        max={730}
        ariaLabel="Days until event"
        onUpdate={(val) => onUpdateField('daysUntilEvent', val)}
      />

      <div>
        <label className={labelCls} htmlFor="tier">Experience Tier</label>
        <select
          id="tier"
          value={context.experienceTier}
          onChange={(e) => {
            const v = e.target.value;
            if (isExperienceTier(v)) onUpdateField('experienceTier', v);
          }}
          className={inputCls}
          aria-label="Experience tier"
        >
          <option value="intimate">Intimate</option>
          <option value="balanced">Balanced</option>
          <option value="grand">Grand</option>
        </select>
      </div>
    </div>
  );
});

BasicEventFields.displayName = 'BasicEventFields';
