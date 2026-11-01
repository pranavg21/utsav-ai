/**
 * @fileoverview Smoke test script for Gemini 3.8 Flash live integration.
 * Reads GEMINI_API_KEY from environment and tests all 5 core GenAI capabilities.
 *
 * Usage:
 *   GEMINI_API_KEY="your-key" node scripts/smoke-gemini.mjs
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  GEMINI_MODEL_ID,
  GEMINI_FALLBACK_MODELS,
  GEMINI_SYSTEM_INSTRUCTION,
} from '../src/services/gemini/config.ts';

const apiKey = process.env.GEMINI_API_KEY ?? '';
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is required.');
  console.error('Usage: GEMINI_API_KEY="your-key" node scripts/smoke-gemini.mjs');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODEL_ID = process.env.GEMINI_MODEL_ID ?? GEMINI_MODEL_ID;
const candidateModels = [MODEL_ID, ...GEMINI_FALLBACK_MODELS];
const SYSTEM_INSTRUCTION = GEMINI_SYSTEM_INSTRUCTION;

async function testCapability(name, prompt, schema) {
  console.log(`\nTesting capability: [${name}]...`);
  try {
    const jsonSchema = z.toJSONSchema(schema);
    const reqConfig = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseJsonSchema: jsonSchema,
    };

    let usedModel = MODEL_ID;
    let response;
    let lastErr = null;
    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      try {
        usedModel = model;
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: reqConfig,
        });
        lastErr = null;
        break;
      } catch (modelErr) {
        lastErr = modelErr;
        const msg = modelErr.message ?? String(modelErr);
        const isRetryable =
          msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') || msg.includes('404');
        if (i < candidateModels.length - 1 && isRetryable) {
          console.log(`  ℹ Model ${model} unavailable (${msg.slice(0, 45)}...), failing over to ${candidateModels[i + 1]}`);
          continue;
        }
        throw modelErr;
      }
    }
    if (lastErr) throw lastErr;

    const text = response.text ?? '';
    const parsed = schema.safeParse(JSON.parse(text));
    if (parsed.success) {
      console.log(`  ✓ SUCCESS: source=gemini, model=${usedModel}`);
      return true;
    } else {
      console.error(`  ✗ SCHEMA VALIDATION ERROR:`, parsed.error.issues);
      return false;
    }
  } catch (err) {
    console.error(`  ✗ API ERROR:`, err.message ?? err);
    return false;
  }
}

async function runSmokeTests() {
  console.log('=== UtsavAI Live Gemini Smoke Test ===');
  console.log(`Target Model: ${MODEL_ID}`);

  // 1. Full plan generation
  const planSchema = z.object({
    budgetAllocations: z.array(z.object({ category: z.string(), percentage: z.number() })),
    subEvents: z.array(z.object({ name: z.string(), guestCount: z.number() })),
    timelineTasks: z.array(z.object({ title: z.string(), daysBeforeEvent: z.number() })),
  });
  await testCapability(
    '1. Full Plan Generation',
    'Generate an initial celebration plan for a 150-guest wedding with budget Rs 8,00,000.',
    planSchema
  );

  // 2. Change Request Parsing
  const changeSchema = z.object({
    changeType: z.enum(['guest_count', 'budget_shift', 'timeline_delay', 'vendor_switch', 'scope_tradeoff']),
    sentiment: z.number(),
    reasoning: z.string(),
  });
  await testCapability(
    '2. Natural Language Change Parsing',
    'Analyze change request: "50 more guests and cut budget by 10%".',
    changeSchema
  );

  // 3. Vendor Checklist Generation
  const checklistSchema = z.object({
    items: z.array(z.object({
      vendorType: z.string(),
      category: z.string(),
      dueDaysBeforeEvent: z.number(),
      mustAsk: z.array(z.string()),
      documents: z.array(z.string()),
    })),
  });
  await testCapability(
    '3. Vendor Checklist Generation',
    'Generate vendor checklist for a 100-person birthday celebration.',
    checklistSchema
  );

  // 4. Vendor Quote Extraction
  const quoteSchema = z.object({
    vendorName: z.string(),
    category: z.string(),
    quotedPrice: z.number(),
    guestCapacity: z.number(),
  });
  await testCapability(
    '4. Vendor Quote Extraction',
    'Extract quote: "Royal Banquet hall Rs. 3,50,000 for 250 guests including AC".',
    quoteSchema
  );

  // 5. Personalized Ideas
  const ideasSchema = z.array(z.object({
    title: z.string(),
    description: z.string(),
    culturalSignificance: z.string(),
    estimatedCostFit: z.enum(['Well Within Budget', 'Moderate Stretch', 'Requires Trade-Off']),
  }));
  await testCapability(
    '5. Personalized Ideas Generation',
    'Generate 2 creative theme concepts for an Indian community Diwali mela.',
    ideasSchema
  );

  console.log('\n=== Smoke tests complete ===');
}

runSmokeTests();

