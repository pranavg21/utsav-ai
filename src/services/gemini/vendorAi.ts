/**
 * @fileoverview Gemini 2.5 Flash vendor intelligence for checklists and quote extraction.
 */

import type { EventContext, BudgetCategoryName } from '../../types/planner';
import { isBudgetCategoryName } from '../../utils/typeGuards';
import { getCachedResponse, setCachedResponse, fnv1aHash, SCHEMA_VERSION } from '../../utils/cache';
import {
  buildVendorChecklistPrompt,
  buildVendorQuoteParsePrompt,
} from '../../prompts/celebrationPlannerPrompts';
import {
  AiVendorChecklistResponseSchema,
  AiVendorQuoteExtractionSchema,
  type AiVendorQuoteExtraction,
} from './schemas';
import { executeStructuredGeminiCall } from './client';
import { GEMINI_MODEL_ID, GEMINI_TEMPERATURES } from './config';
import type { AiResult } from './types';
import type { VendorChecklistItem } from '../../domain/vendors/types';
import { getVendorChecklistTemplates } from '../../domain/vendors/checklist';

export async function generateVendorChecklistWithAi(
  context: EventContext
): Promise<AiResult<readonly VendorChecklistItem[]>> {
  const fallback = getVendorChecklistTemplates(context.occasion);
  const prompt = buildVendorChecklistPrompt(context);
  const cacheKey = fnv1aHash(`${GEMINI_MODEL_ID}:v${SCHEMA_VERSION}:${prompt}`);
  const cached = getCachedResponse<AiResult<readonly VendorChecklistItem[]>>(cacheKey);
  if (cached !== null) return cached;

  const result = await executeStructuredGeminiCall(
    prompt,
    AiVendorChecklistResponseSchema,
    GEMINI_TEMPERATURES.checklist
  );

  let output: AiResult<readonly VendorChecklistItem[]>;
  if (result.success) {
    const items: VendorChecklistItem[] = result.data.items.map((i, idx) => ({
      id: `ai-chk-${idx + 1}`,
      vendorType: i.vendorType,
      category: isBudgetCategoryName(i.category) ? i.category : 'Venue & Logistics',
      status: 'not-started',
      dueDaysBeforeEvent: i.dueDaysBeforeEvent,
      linkedTaskId: 'task-venue',
      mustAsk: i.mustAsk,
      documents: i.documents,
      isVerifiedQuote: false,
    }));
    output = { data: items, provenance: { source: 'gemini', model: result.model } };
    setCachedResponse(cacheKey, output);
  } else {
    output = { data: fallback, provenance: { source: 'deterministic', reason: result.reason } };
  }

  return output;
}

export async function extractVendorQuoteWithAi(
  rawQuoteText: string,
  category: BudgetCategoryName
): Promise<AiResult<AiVendorQuoteExtraction>> {
  const fallback: AiVendorQuoteExtraction = {
    vendorName: 'Local Vendor Quote',
    category,
    quotedPrice: 0,
    guestCapacity: 100,
    inclusions: ['Base service package'],
    hiddenRisks: ['Check GST and delivery surcharge'],
    negotiationPoints: ['Ask for off-peak discount'],
  };

  const prompt = buildVendorQuoteParsePrompt(rawQuoteText, category);
  const cacheKey = fnv1aHash(`${GEMINI_MODEL_ID}:v${SCHEMA_VERSION}:${prompt}`);
  const cached = getCachedResponse<AiResult<AiVendorQuoteExtraction>>(cacheKey);
  if (cached !== null) return cached;

  const result = await executeStructuredGeminiCall(
    prompt,
    AiVendorQuoteExtractionSchema,
    GEMINI_TEMPERATURES.quotes
  );

  let output: AiResult<AiVendorQuoteExtraction>;
  if (result.success) {
    output = { data: result.data, provenance: { source: 'gemini', model: result.model } };
    setCachedResponse(cacheKey, output);
  } else {
    output = { data: fallback, provenance: { source: 'deterministic', reason: result.reason } };
  }

  return output;
}

