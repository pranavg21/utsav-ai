/**
 * @fileoverview Collapsible panel for financial assumptions (headcount buffer, peak season, GST).
 */

import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import type { EventAssumptions } from '../data/assumptions';
import { CARD_CLASSES } from '../utils/uiHelpers';

interface AssumptionsPanelProps {
  readonly assumptions: EventAssumptions;
  readonly onUpdate: (updated: EventAssumptions) => void;
}

const inputCls =
  'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-saffron-500 focus:outline-none';
const labelCls = 'mb-1 block text-xs font-medium text-slate-400';

export const AssumptionsPanel: React.FC<AssumptionsPanelProps> = React.memo(
  ({ assumptions, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <section className={`${CARD_CLASSES} mb-6`} aria-label="Assumptions and rates">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={isOpen}
          aria-controls="assumptions-content"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-saffron-500" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-200">Execution Assumptions & Tax Rates</h2>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
          )}
        </button>

        {isOpen && (
          <div id="assumptions-content" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls} htmlFor="buffer-input">
                Headcount Buffer ({assumptions.headcountBufferPercent}%)
              </label>
              <input
                id="buffer-input"
                type="number"
                min={0}
                max={25}
                value={assumptions.headcountBufferPercent}
                onChange={(e) =>
                  onUpdate({ ...assumptions, headcountBufferPercent: Number(e.target.value) || 0 })
                }
                className={inputCls}
                aria-label="Headcount buffer percentage"
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="peak-input">
                Peak Season Multiplier ({assumptions.peakSeasonMultiplier}x)
              </label>
              <input
                id="peak-input"
                type="number"
                step="0.05"
                min={1.0}
                max={1.4}
                value={assumptions.peakSeasonMultiplier}
                onChange={(e) =>
                  onUpdate({ ...assumptions, peakSeasonMultiplier: Number(e.target.value) || 1.0 })
                }
                className={inputCls}
                aria-label="Peak season multiplier"
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="gst-services">
                Services GST ({assumptions.gstRateServices}%)
              </label>
              <input
                id="gst-services"
                type="number"
                value={assumptions.gstRateServices}
                onChange={(e) =>
                  onUpdate({ ...assumptions, gstRateServices: Number(e.target.value) || 18 })
                }
                className={inputCls}
                aria-label="Services GST rate"
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="gst-catering">
                Catering GST ({assumptions.gstRateCatering}%)
              </label>
              <input
                id="gst-catering"
                type="number"
                value={assumptions.gstRateCatering}
                onChange={(e) =>
                  onUpdate({ ...assumptions, gstRateCatering: Number(e.target.value) || 5 })
                }
                className={inputCls}
                aria-label="Catering GST rate"
              />
            </div>
          </div>
        )}
      </section>
    );
  }
);

AssumptionsPanel.displayName = 'AssumptionsPanel';
