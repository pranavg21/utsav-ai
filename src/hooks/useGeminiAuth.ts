/**
 * @fileoverview Custom hook managing Gemini API key state, runtime overrides, and connectivity status.
 */

import { useState, useCallback } from 'react';
import {
  getActiveApiKey,
  getGeminiStatus,
  setRuntimeApiKey,
} from '../services/gemini/client';

/** Return signature for the useGeminiAuth API key hook. */
export interface UseGeminiAuthReturn {
  readonly apiKey: string;
  readonly isConnected: boolean;
  readonly saveApiKey: (key: string) => void;
}

/**
 * Manages Gemini API key storage and connectivity status for BYOK runtime.
 * @returns Object with active API key, connectivity status boolean, and save callback.
 */
export function useGeminiAuth(): UseGeminiAuthReturn {
  const [apiKey, setApiKey] = useState(() => getActiveApiKey());
  const [isConnected, setIsConnected] = useState(() => getGeminiStatus());

  const saveApiKey = useCallback((key: string) => {
    setRuntimeApiKey(key);
    setApiKey(key);
    setIsConnected(getGeminiStatus());
  }, []);

  return { apiKey, isConnected, saveApiKey };
}
