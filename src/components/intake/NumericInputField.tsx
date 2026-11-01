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
  'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 ' +
  'focus:border-saffron-500 focus:outline-none';
const labelCls = 'mb-1 block text-xs font-medium text-slate-400';

/** Accessible numeric input field with boundary validation and live error messaging. */
export const NumericInputField: React.FC<NumericInputFieldProps> = React.memo(
  ({ id, label, value, min, max, ariaLabel, onUpdate }) => {
    const [draft, setDraft] = useState(String(value));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      setDraft(String(value));
      setError(null);
    }, [value]);

    const handleCommit = (raw: string): void => {
      const parsed = Number(raw.replace(/,/g, ''));
      if (Number.isNaN(parsed)) {
        setDraft(String(value));
        setError(null);
        return;
      }
      if (parsed < min) {
        setError(`${label} must be at least ${min.toLocaleString('en-IN')}`);
      } else if (parsed > max) {
        setError(`${label} must be at most ${max.toLocaleString('en-IN')}`);
      } else {
        setError(null);
        onUpdate(validateNumericBound(parsed, min, max));
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
            if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
              setError(null);
              onUpdate(validateNumericBound(parsed, min, max));
            }
          }}
          onBlur={() => handleCommit(draft)}
          className={`${inputCls} ${error ? 'border-red-500' : ''}`}
          aria-label={ariaLabel}
          aria-invalid={error !== null}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NumericInputField.displayName = 'NumericInputField';
