/**
 * @fileoverview Custom hook for fetching and managing personalized theme ideas with GenAI provenance.
 * Features 600ms debounce and stale response discard (10.8).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { EventContext, PersonalizedConcept } from '../types/planner';
import type { ProvenanceBadgeData } from '../types/plannerExtended';
import { generateThemesWithAi } from '../services/gemini/planner';
import { extractErrorMessage } from '../utils/uiHelpers';

export interface UseThemesReturn {
  readonly themes: readonly PersonalizedConcept[];
  readonly provenance: ProvenanceBadgeData | null;
  readonly loading: boolean;
  readonly error: string;
  readonly refreshThemes: () => void;
}

export function useThemes(context: EventContext): UseThemesReturn {
  const [themes, setThemes] = useState<readonly PersonalizedConcept[]>([]);
  const [provenance, setProvenance] = useState<ProvenanceBadgeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const fetchThemes = useCallback(async (currentRequestId: number, ctx: EventContext) => {
    setLoading(true);
    setError('');
    try {
      const result = await generateThemesWithAi(ctx);
      if (requestIdRef.current === currentRequestId) {
        setThemes(result.data);
        setProvenance(result.provenance);
      }
    } catch (err: unknown) {
      if (requestIdRef.current === currentRequestId) {
        setError(extractErrorMessage(err));
      }
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, []);

  const refreshThemes = useCallback(() => {
    requestIdRef.current += 1;
    void fetchThemes(requestIdRef.current, context);
  }, [fetchThemes, context]);

  useEffect(() => {
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    const timer = setTimeout(() => {
      void fetchThemes(currentRequestId, context);
    }, 600);
    return () => clearTimeout(timer);
  }, [fetchThemes, context]);

  return {
    themes,
    provenance,
    loading,
    error,
    refreshThemes,
  };
}
