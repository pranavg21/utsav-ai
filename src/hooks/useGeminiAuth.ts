/**
 * @fileoverview Custom hook managing Gemini API key state, runtime overrides, and connectivity status.
 */

import { useState, useCallback } from 'react';
import {
  getActiveApiKey,
  getGeminiStatus,
  setRuntimeApiKey,
} from '../services/gemini/client';

export interface UseGeminiAuthReturn {
  readonly apiKey: string;
  readonly isConnected: boolean;
  readonly saveApiKey: (key: string) => void;
}

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

