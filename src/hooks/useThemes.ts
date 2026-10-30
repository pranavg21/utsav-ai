/**
 * @fileoverview Custom hook for fetching and managing personalized theme ideas with GenAI provenance.
 */

import { useState, useEffect, useCallback } from 'react';
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

  const loadThemes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateThemesWithAi(context);
      setThemes(result.data);
      setProvenance(result.provenance);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    void loadThemes();
  }, [loadThemes]);

  return {
    themes,
    provenance,
    loading,
    error,
    refreshThemes: loadThemes,
  };
}

