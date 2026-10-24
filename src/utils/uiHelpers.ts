/**
 * @fileoverview Shared UI helper constants and formatting utilities used across components.
 * Extracts common patterns to prevent code duplication (AST-level DRY compliance).
 */

import type { BudgetCategoryName } from '../types/planner';

/** Maps budget category names to Lucide icon names for consistent UI rendering. */
export const CATEGORY_ICONS: Record<BudgetCategoryName, string> = {
  'Venue & Logistics': 'building-2',
  'Catering & Hospitality': 'utensils-crossed',
  'Decor & Ambience': 'palette',
  'Photography & Media': 'camera',
  'Entertainment & Rituals': 'music',
  'Contingency Reserve': 'shield-check',
} as const;

/**
 * Formats a number as Indian Rupee currency string.
 *
 * @param amount - The numeric amount in INR.
 * @returns Formatted string like "₹8,00,000".
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Returns a CSS class string for delta values (green for savings, red for overrun).
 *
 * @param delta - Numeric delta value (negative = savings, positive = overrun).
 * @returns Tailwind CSS class string.
 */
export function getDeltaColorClass(delta: number): string {
  if (delta < 0) { return 'text-emerald-400'; }
  if (delta > 0) { return 'text-red-400'; }
  return 'text-slate-400';
}

/**
 * Extracts a safe error message string from an unknown error value.
 *
 * @param error - The caught error value of unknown type.
 * @returns A string error message.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) { return error.message; }
  return String(error);
}

/** Standard CSS classes for card containers used across dashboard tabs. */
export const CARD_CLASSES = 'rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 backdrop-blur-sm' as const;

/** Standard CSS classes for badge elements. */
export const BADGE_BASE = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium' as const;
