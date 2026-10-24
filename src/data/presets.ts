/**
 * @fileoverview Preset event configurations for 1-click scenario loading.
 * Contains the SME Benchmark Scenario and two additional occasion presets.
 */

import type { EventContext } from '../types/planner';

/** Default budget category priority ranking for all presets. */
const DEFAULT_WEDDING_PRIORITIES = [
  'Catering & Hospitality',
  'Venue & Logistics',
  'Photography & Media',
  'Decor & Ambience',
  'Entertainment & Rituals',
  'Contingency Reserve',
] as const;

/**
 * SME Benchmark Scenario: ₹8,00,000 Wedding | 200 Guests | 120 Days.
 */
export const WEDDING_PRESET: EventContext = {
  occasion: 'wedding',
  eventName: 'Grand Family Wedding',
  totalBudget: 800000,
  guestCount: 200,
  daysUntilEvent: 120,
  experienceTier: 'grand',
  priorityRanking: [...DEFAULT_WEDDING_PRIORITIES],
  ageGroups: ['children', 'adults', 'seniors'],
  accessibilityNeeds: ['Wheelchair ramps', 'Senior-friendly seating'],
  mustHaves: ['Live music', 'Traditional rituals stage'],
};

/**
 * 50th Milestone Birthday: ₹2,50,000 | 80 Guests | 45 Days.
 */
export const BIRTHDAY_PRESET: EventContext = {
  occasion: 'birthday',
  eventName: '50th Milestone Birthday Celebration',
  totalBudget: 250000,
  guestCount: 80,
  daysUntilEvent: 45,
  experienceTier: 'balanced',
  priorityRanking: [
    'Catering & Hospitality',
    'Entertainment & Rituals',
    'Venue & Logistics',
    'Photography & Media',
    'Decor & Ambience',
    'Contingency Reserve',
  ],
  ageGroups: ['adults', 'seniors'],
  accessibilityNeeds: ['Elder-friendly low seating'],
  mustHaves: ['Photo montage slideshow', 'Custom birthday cake'],
};

/**
 * Community Cultural Fest: ₹5,00,000 | 350 Guests | 60 Days.
 */
export const COMMUNITY_PRESET: EventContext = {
  occasion: 'community',
  eventName: 'Community Cultural Fest',
  totalBudget: 500000,
  guestCount: 350,
  daysUntilEvent: 60,
  experienceTier: 'balanced',
  priorityRanking: [
    'Venue & Logistics',
    'Catering & Hospitality',
    'Entertainment & Rituals',
    'Decor & Ambience',
    'Photography & Media',
    'Contingency Reserve',
  ],
  ageGroups: ['children', 'adults', 'seniors'],
  accessibilityNeeds: ['Open-ground wheelchair access', 'Shaded seating for seniors'],
  mustHaves: ['Cultural performances stage', 'Food stalls variety'],
};

/** All available presets for quick selection. */
export const ALL_PRESETS = [
  { label: 'SME Benchmark: ₹8L Wedding | 200 Guests | 120 Days', value: WEDDING_PRESET },
  { label: '50th Birthday: ₹2.5L | 80 Guests | 45 Days', value: BIRTHDAY_PRESET },
  { label: 'Cultural Fest: ₹5L | 350 Guests | 60 Days', value: COMMUNITY_PRESET },
] as const;
