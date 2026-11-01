/**
 * @fileoverview Main header navigation bar with celebration presets, high-contrast, and large-text toggles.
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, Eye, Type, Key, Zap } from 'lucide-react';
import type { EventContext } from '../types/planner';
import { ALL_PRESETS } from '../data/presets';
import { BADGE_BASE } from '../utils/uiHelpers';
import { useGeminiAuth } from '../hooks/useGeminiAuth';
import { ApiKeyModal } from './ApiKeyModal';

interface HeaderProps {
  readonly onSelectPreset: (context: EventContext) => void;
  readonly onToggleContrast: () => void;
  readonly onToggleLargeText: () => void;
  readonly isHighContrast: boolean;
  readonly isLargeText: boolean;
}

const SKIP_LINK_CLASS =
  'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-saffron-500 ' +
  'focus:px-4 focus:py-2 focus:text-white';

const PRESET_BTN_CLASS =
  'rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 ' +
  'hover:border-saffron-500 hover:text-saffron-400';

const LOGO_CLASS =
  'flex h-10 w-10 items-center justify-center rounded-xl ' +
  'bg-gradient-to-tr from-saffron-600 to-saffron-400 shadow-lg shadow-saffron-500/20';

function getToggleBtnClass(isActive: boolean): string {
  const active = 'border-saffron-500 text-saffron-400';
  const inactive = 'border-slate-700 text-slate-400 hover:text-slate-200';
  return `rounded-lg border p-1.5 transition ${isActive ? active : inactive}`;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ onSelectPreset, onToggleContrast, onToggleLargeText, isHighContrast, isLargeText }) => {
    const { apiKey, isConnected, saveApiKey } = useGeminiAuth();
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [keyDraft, setKeyDraft] = useState('');

    const handleSaveKey = useCallback(() => {
      saveApiKey(keyDraft);
      setShowKeyModal(false);
    }, [keyDraft, saveApiKey]);

    const handleClearKey = useCallback(() => {
      saveApiKey('');
      setKeyDraft('');
      setShowKeyModal(false);
    }, [saveApiKey]);

    return (
      <header className="border-b border-slate-700/50 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
        <a href="#main-content" className={SKIP_LINK_CLASS}>
          Skip to content
        </a>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className={LOGO_CLASS}>
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
                className={PRESET_BTN_CLASS}
              >
                {p.label.split(':')[0]}
              </button>
            ))}
            <div className="ml-2 flex items-center gap-2 border-l border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => {
                  setKeyDraft(apiKey);
                  setShowKeyModal(true);
                }}
                className={`${BADGE_BASE} ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}
                aria-label="Configure Gemini API key"
              >
                {isConnected ? (
                  <>
                    <Zap className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                    Gemini Active
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
                className={getToggleBtnClass(isHighContrast)}
                aria-label="Toggle high contrast mode"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onToggleLargeText}
                className={getToggleBtnClass(isLargeText)}
                aria-label="Toggle large text mode"
              >
                <Type className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <ApiKeyModal
          isOpen={showKeyModal}
          apiKey={keyDraft}
          onChangeKey={setKeyDraft}
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
