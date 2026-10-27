/**
 * @fileoverview Type guard utilities for safe type narrowing without `as` casts.
 * Provides runtime validation for union string types used across the application.
 */

import type { OccasionType, ExperienceTier, BudgetCategoryName } from '../types/planner';

/** All valid occasion type values. */
const VALID_OCCASIONS: readonly string[] = ['wedding', 'birthday', 'community'];

/** All valid experience tier values. */
const VALID_TIERS: readonly string[] = ['intimate', 'balanced', 'grand'];

/** All valid budget category name values. */
const VALID_CATEGORIES: readonly string[] = [
  'Venue & Logistics', 'Catering & Hospitality', 'Decor & Ambience',
  'Photography & Media', 'Entertainment & Rituals', 'Contingency Reserve',
];

/**
 * Validates whether a string is a valid OccasionType.
 *
 * @param value - The string to validate.
 * @returns True if the value is a valid OccasionType.
 */
export function isOccasionType(value: string): value is OccasionType {
  return VALID_OCCASIONS.includes(value);
}

/**
 * Validates whether a string is a valid ExperienceTier.
 *
 * @param value - The string to validate.
 * @returns True if the value is a valid ExperienceTier.
 */
export function isExperienceTier(value: string): value is ExperienceTier {
  return VALID_TIERS.includes(value);
}

/**
 * Validates whether a string is a valid BudgetCategoryName.
 *
 * @param value - The string to validate.
 * @returns True if the value is a valid BudgetCategoryName.
 */
export function isBudgetCategoryName(value: string): value is BudgetCategoryName {
  return VALID_CATEGORIES.includes(value);
}

/**
 * Type-safe alternative to Object.keys() for objects with known string literal keys.
 * Returns keys typed to the union of the object's key type.
 *
 * @param obj - The object whose keys to extract.
 * @returns Array of typed keys.
 */
export function typedKeys<K extends string>(obj: Record<K, unknown>): K[] {
  return Object.keys(obj) as K[];
}

/**
 * Safely parses a JSON string with unknown type, returning null on failure.
 *
 * @param text - The JSON string to parse.
 * @returns The parsed value or null if parsing fails.
 */
export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
