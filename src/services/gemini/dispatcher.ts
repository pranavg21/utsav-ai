/**
 * @fileoverview Resilient multi-model failover dispatcher for Gemini API calls (10.5).
 */

import { extractErrorMessage } from '../../utils/uiHelpers';
import { GEMINI_MODEL_ID, GEMINI_FALLBACK_MODELS } from './config';

export interface ModelCallOutput {
  readonly text: string;
  readonly usedModel: string;
}

export interface ModelInvoker {
  readonly models: {
    readonly generateContent: (args: {
      readonly model: string;
      readonly contents: string;
      readonly config: Record<string, unknown>;
    }) => Promise<{ readonly text?: string | null | undefined }>;
  };
}

function isRetryableModelError(errMsg: string): boolean {
  return (
    errMsg.includes('503') ||
    errMsg.includes('UNAVAILABLE') ||
    errMsg.includes('429') ||
    errMsg.includes('404')
  );
}

export async function dispatchWithFailover(
  ai: ModelInvoker,
  prompt: string,
  reqConfig: Record<string, unknown>,
  signal: AbortSignal
): Promise<ModelCallOutput> {
  const candidateModels = [GEMINI_MODEL_ID, ...GEMINI_FALLBACK_MODELS];
  let lastErr: unknown;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i] ?? GEMINI_MODEL_ID;
    if (signal.aborted) break;
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: reqConfig,
      });
      return { text: response.text ?? '', usedModel: model };
    } catch (modelErr: unknown) {
      lastErr = modelErr;
      const errMsg = extractErrorMessage(modelErr);
      const hasNext = i < candidateModels.length - 1;
      if (hasNext && !signal.aborted && isRetryableModelError(errMsg)) {
        continue;
      }
      throw modelErr;
    }
  }

  throw lastErr ?? new Error('Model candidate execution aborted');
}
