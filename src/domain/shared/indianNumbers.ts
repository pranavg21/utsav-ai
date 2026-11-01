/**
 * @fileoverview Shared Indian numerical multipliers (lakh, crore, k) for celebration budgets.
 */

export const INR_MULTIPLIERS = {
  k: 1000,
  lakh: 100000,
  lac: 100000,
  l: 100000,
  crore: 10000000,
  cr: 10000000,
} as const;

/**
 * Resolves standard numerical multiplier from Indian currency tokens.
 *
 * @param token Currency token string (e.g. "lakh", "L", "k", "cr").
 * @returns Numerical multiplier integer.
 */
export function parseIndianAmountMultiplier(token: string): number {
  const lower = token.toLowerCase();
  if (lower.includes('crore') || lower.includes('cr')) return INR_MULTIPLIERS.crore;
  if (lower.includes('lakh') || lower.includes('lac') || lower === 'l') return INR_MULTIPLIERS.lakh;
  if (lower.includes('k')) return INR_MULTIPLIERS.k;
  return 1;
}
