/**
 * @fileoverview Application header with preset selection, Gemini connection indicator,
 * API key modal, and accessibility toggles (high-contrast + large-text).
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, Key, Eye, Type, Zap } from 'lucide-react';
import { ALL_PRESETS } from '../data/presets';
import { getGeminiStatus, setRuntimeApiKey } from '../services/geminiPlannerService';
import type { EventContext } from '../types/planner';
import { BADGE_BASE } from '../utils/uiHelpers';

/** Props for the Header component. */
interface HeaderProps {
  readonly onSelectPreset: (preset: EventContext) => void;
  readonly onToggleContrast: () => void;
  readonly onToggleLargeText: () => void;
  readonly isHighContrast: boolean;
  readonly isLargeText: boolean;
}

/**
 * Top-level header with persona presets, API status, key input, and a11y toggles.
 *
 * @param props - Header configuration props.
 * @returns Header React element.
 */
const Header: React.FC<HeaderProps> = ({
  onSelectPreset, onToggleContrast, onToggleLargeText, isHighContrast, isLargeText,
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const isConnected = getGeminiStatus();

  const handleSaveKey = useCallback((): void => {
    setRuntimeApiKey(apiKey);
    setShowKeyModal(false);
  }, [apiKey]);

  const handlePresetClick = useCallback((preset: EventContext): void => {
    onSelectPreset(preset);
  }, [onSelectPreset]);

  return (
    <header className="border-b border-slate-700/50 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-saffron-500 focus:px-4 focus:py-2 focus:text-white" aria-label="Skip to main content">
        Skip to content
      </a>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-saffron-500" aria-hidden="true" />
          <h1 className="bg-gradient-to-r from-saffron-500 to-marigold-400 bg-clip-text text-2xl font-extrabold text-transparent">
            UtsavAI
          </h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Quick presets">
          {ALL_PRESETS.map((p, i) => (
            <button key={i} onClick={() => handlePresetClick(p.value)} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-saffron-500 hover:text-saffron-400" aria-label={`Load preset: ${p.label}`}>
              {p.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className={`${BADGE_BASE} ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`} aria-live="polite">
            <Zap className="h-3 w-3" aria-hidden="true" />
            {isConnected ? 'Live Gemini 2.5 Flash Connected' : 'Smart Deterministic Engine Active'}
          </span>
          <button onClick={() => setShowKeyModal(true)} className="rounded-lg border border-slate-600 p-2 text-slate-400 transition hover:text-saffron-400" aria-label="Set Gemini API key">
            <Key className="h-4 w-4" aria-hidden="true" />
          </button>
          <button onClick={onToggleContrast} className={`rounded-lg border p-2 transition ${isHighContrast ? 'border-saffron-500 text-saffron-400' : 'border-slate-600 text-slate-400 hover:text-saffron-400'}`} aria-label="Toggle high contrast mode" aria-pressed={isHighContrast}>
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button onClick={onToggleLargeText} className={`rounded-lg border p-2 transition ${isLargeText ? 'border-saffron-500 text-saffron-400' : 'border-slate-600 text-slate-400 hover:text-saffron-400'}`} aria-label="Toggle large text mode" aria-pressed={isLargeText}>
            <Type className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-label="Enter Gemini API key">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-100">Enter Gemini API Key</h2>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste your VITE_GEMINI_API_KEY here" className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-saffron-500 focus:outline-none" aria-label="Gemini API key input" />
            <div className="flex gap-3">
              <button onClick={handleSaveKey} className="rounded-lg bg-saffron-600 px-4 py-2 font-medium text-white transition hover:bg-saffron-500" aria-label="Save API key">Save</button>
              <button onClick={() => setShowKeyModal(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-slate-400 transition hover:text-slate-200" aria-label="Cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
