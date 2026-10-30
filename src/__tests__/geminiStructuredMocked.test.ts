/**
 * @fileoverview Mocked unit tests for Gemini 2.5 Flash native structured output and error classifications.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeStructuredGeminiCall, setRuntimeApiKey } from '../services/gemini/client';
import { AiChangeRequestResponseSchema } from '../services/gemini/schemas';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe('Gemini 2.5 Flash Structured Call Engine (Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setRuntimeApiKey('test-mock-key');
  });

  it('fails gracefully with no-api-key when key is empty', async () => {
    setRuntimeApiKey('');
    const result = await executeStructuredGeminiCall('test prompt', AiChangeRequestResponseSchema, 0.1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('no-api-key');
    }
  });

  it('successfully parses valid native JSON matching Zod schema', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerate = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        changeType: 'budget_shift',
        amountDelta: 50000,
        sentiment: 0.5,
        reasoning: 'Increasing catering allocation',
      }),
    });
    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerate },
    }) as unknown as InstanceType<typeof GoogleGenAI>);

    const result = await executeStructuredGeminiCall('prompt', AiChangeRequestResponseSchema, 0.1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.changeType).toBe('budget_shift');
      expect(result.model).toBe('gemini-2.5-flash');
    }
  });

  it('classifies schema violation as invalid-output', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerate = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        changeType: 'invalid_type_not_in_enum',
        sentiment: 10, // exceeds max 1
      }),
    });
    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerate },
    }) as unknown as InstanceType<typeof GoogleGenAI>);

    const result = await executeStructuredGeminiCall('prompt', AiChangeRequestResponseSchema, 0.1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('invalid-output');
    }
  });

  it('classifies HTTP 429 / quota exceeded as quota-exceeded', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerate = vi.fn().mockRejectedValue(new Error('429 Resource has been exhausted'));
    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerate },
    }) as unknown as InstanceType<typeof GoogleGenAI>);

    const result = await executeStructuredGeminiCall('prompt', AiChangeRequestResponseSchema, 0.1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('quota-exceeded');
    }
  });

  it('classifies abort signal trigger as timeout', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerate = vi.fn().mockRejectedValue(new Error('The operation was aborted due to timeout'));
    vi.mocked(GoogleGenAI).mockImplementation(() => ({
      models: { generateContent: mockGenerate },
    }) as unknown as InstanceType<typeof GoogleGenAI>);

    const result = await executeStructuredGeminiCall('prompt', AiChangeRequestResponseSchema, 0.1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('timeout');
    }
  });
});

