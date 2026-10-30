/**
 * @fileoverview Application header with preset selection, Gemini status indicator, and accessibility controls.
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, Key, Eye, Type, Zap } from 'lucide-react';
import { ALL_PRESETS } from '../data/presets';
import {
  getGeminiStatus,
  setRuntimeApiKey,
  getActiveApiKey,
} from '../services/geminiPlannerService';
import type { EventContext } from '../types/planner';
import { BADGE_BASE } from '../utils/uiHelpers';
import { ApiKeyModal } from './ApiKeyModal';

interface HeaderProps {
  readonly onSelectPreset: (preset: EventContext) => void;
  readonly onToggleContrast: () => void;
  readonly onToggleLargeText: () => void;
  readonly isHighContrast: boolean;
  readonly isLargeText: boolean;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ onSelectPreset, onToggleContrast, onToggleLargeText, isHighContrast, isLargeText }) => {
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState(() => getActiveApiKey());
    const [isConnected, setIsConnected] = useState(() => getGeminiStatus());

    const handleSaveKey = useCallback((): void => {
      setRuntimeApiKey(apiKey);
      setIsConnected(getGeminiStatus());
      setShowKeyModal(false);
    }, [apiKey]);

    const handleClearKey = useCallback((): void => {
      setApiKey('');
      setRuntimeApiKey('');
      setIsConnected(false);
      setShowKeyModal(false);
    }, []);

    return (
      <header className="border-b border-slate-700/50 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-saffron-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-saffron-600 to-saffron-400 shadow-lg shadow-saffron-500/20">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">UtsavAI</h1>
              <p className="text-xs text-slate-400">Dynamic Celebration Execution Engine</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Presets:</span>
            {ALL_PRESETS.map((p) => (
              <button
                type="button"
                key={p.label}
                onClick={() => onSelectPreset(p.value)}
                aria-label={`Load preset: ${p.label}`}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:border-saffron-500 hover:text-saffron-400"
              >
                {p.label.split(':')[0]}
              </button>
            ))}
            <div className="ml-2 flex items-center gap-2 border-l border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => {
                  setApiKey(getActiveApiKey());
                  setShowKeyModal(true);
                }}
                className={`${BADGE_BASE} ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}
                aria-label="Configure Gemini API key"
              >
                {isConnected ? (
                  <>
                    <Zap className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                    Gemini 2.5 Active
                  </>
                ) : (
                  <>
                    <Key className="h-3 w-3" aria-hidden="true" />
                    Smart Deterministic Engine Active
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onToggleContrast}
                className={`rounded-lg border p-1.5 transition ${isHighContrast ? 'border-saffron-500 text-saffron-400' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
                aria-label="Toggle high contrast mode"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onToggleLargeText}
                className={`rounded-lg border p-1.5 transition ${isLargeText ? 'border-saffron-500 text-saffron-400' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
                aria-label="Toggle large text mode"
              >
                <Type className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <ApiKeyModal
          isOpen={showKeyModal}
          apiKey={apiKey}
          onChangeKey={setApiKey}
          onSave={handleSaveKey}
          onClear={handleClearKey}
          onClose={() => setShowKeyModal(false)}
        />
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;
