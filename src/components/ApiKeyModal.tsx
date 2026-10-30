/**
 * @fileoverview Accessible Gemini API Key BYOK modal dialog rendered via createPortal.
 */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Key, X, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  readonly isOpen: boolean;
  readonly apiKey: string;
  readonly onChangeKey: (key: string) => void;
  readonly onSave: () => void;
  readonly onClear: () => void;
  readonly onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = React.memo(
  ({ isOpen, apiKey, onChangeKey, onSave, onClear, onClose }) => {
    const handleKeyDown = useCallback(
      (e: KeyboardEvent): void => {
        if (e.key === 'Escape') onClose();
      },
      [onClose]
    );

    useEffect(() => {
      if (!isOpen) return;
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-saffron-500" aria-hidden="true" />
              <h2 id="api-modal-title" className="text-lg font-bold text-slate-100">
                Gemini 2.5 Flash API Key
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Close API key modal"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">
            Provide a Google AI Studio API key for real-time generative reasoning. If left
            blank, UtsavAI operates via the deterministic offline rule engine.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onChangeKey(e.target.value)}
            placeholder="Paste your Gemini API key here"
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-saffron-500 focus:outline-none"
            aria-label="Gemini API key input"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              aria-label="Clear active API key"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear Key
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-lg bg-saffron-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-saffron-500"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

ApiKeyModal.displayName = 'ApiKeyModal';
