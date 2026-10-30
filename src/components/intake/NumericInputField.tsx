/**
 * @fileoverview Accessible controlled numeric input field supporting formatted drafts (e.g. commas).
 */

import React, { useState, useEffect } from 'react';
import { validateNumericBound } from '../../utils/security';

interface NumericInputFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly ariaLabel: string;
  readonly onUpdate: (val: number) => void;
}

const inputCls =
  'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-saffron-500 focus:outline-none';
const labelCls = 'mb-1 block text-xs font-medium text-slate-400';

export const NumericInputField: React.FC<NumericInputFieldProps> = React.memo(
  ({ id, label, value, min, max, ariaLabel, onUpdate }) => {
    const [draft, setDraft] = useState(String(value));

    useEffect(() => {
      setDraft(String(value));
    }, [value]);

    const handleCommit = (raw: string): void => {
      const parsed = Number(raw.replace(/,/g, ''));
      if (!Number.isNaN(parsed) && parsed > 0) {
        onUpdate(validateNumericBound(parsed, min, max));
      } else {
        setDraft(String(value));
      }
    };

    return (
      <div>
        <label className={labelCls} htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            const parsed = Number(e.target.value.replace(/,/g, ''));
            if (!Number.isNaN(parsed) && parsed > 0) {
              onUpdate(validateNumericBound(parsed, min, max));
            }
          }}
          onBlur={() => handleCommit(draft)}
          className={inputCls}
          aria-label={ariaLabel}
        />
      </div>
    );
  }
);

NumericInputField.displayName = 'NumericInputField';
