/**
 * @fileoverview Domain types and default presets for multi-event Indian celebration functions.
 */

import type { OccasionType } from '../../types/planner';

export type VenueType = 'home' | 'banquet' | 'lawn' | 'temple' | 'destination';

export interface SubEvent {
  readonly id: string;
  readonly name: string;
  readonly dayOffset: number;
  readonly guestCount: number;
  readonly venueType: VenueType;
  readonly budgetSharePercent: number;
}

export const WEDDING_SUB_EVENTS: readonly SubEvent[] = [
  { id: 'se-haldi', name: 'Haldi Ceremony', dayOffset: -2, guestCount: 60, venueType: 'home', budgetSharePercent: 10 },
  { id: 'se-mehendi', name: 'Mehendi & Sangeet Kickoff', dayOffset: -2, guestCount: 80, venueType: 'lawn', budgetSharePercent: 15 },
  { id: 'se-sangeet', name: 'Grand Sangeet Night', dayOffset: -1, guestCount: 150, venueType: 'banquet', budgetSharePercent: 25 },
  { id: 'se-wedding', name: 'Muhurat & Pheras', dayOffset: 0, guestCount: 200, venueType: 'temple', budgetSharePercent: 30 },
  { id: 'se-reception', name: 'Grand Reception Gala', dayOffset: 1, guestCount: 300, venueType: 'banquet', budgetSharePercent: 20 },
];

export const BIRTHDAY_SUB_EVENTS: readonly SubEvent[] = [
  { id: 'se-bday-welcome', name: 'Welcome & Magic Warmup', dayOffset: 0, guestCount: 40, venueType: 'home', budgetSharePercent: 20 },
  { id: 'se-bday-cake', name: 'Cake Cutting Ceremony', dayOffset: 0, guestCount: 50, venueType: 'banquet', budgetSharePercent: 40 },
  { id: 'se-bday-feast', name: 'Games & Birthday Feast', dayOffset: 0, guestCount: 50, venueType: 'banquet', budgetSharePercent: 40 },
];

export const COMMUNITY_SUB_EVENTS: readonly SubEvent[] = [
  { id: 'se-comm-puja', name: 'Inauguration & Ground Puja', dayOffset: -1, guestCount: 150, venueType: 'temple', budgetSharePercent: 20 },
  { id: 'se-comm-mela', name: 'Cultural Stage & Food Mela', dayOffset: 0, guestCount: 500, venueType: 'lawn', budgetSharePercent: 55 },
  { id: 'se-comm-aarti', name: 'Maha Aarti & Felicitations', dayOffset: 0, guestCount: 400, venueType: 'lawn', budgetSharePercent: 25 },
];

export function getSubEventsForOccasion(occasion: OccasionType): readonly SubEvent[] {
  switch (occasion) {
    case 'wedding':
      return WEDDING_SUB_EVENTS;
    case 'birthday':
      return BIRTHDAY_SUB_EVENTS;
    case 'community':
      return COMMUNITY_SUB_EVENTS;
  }
}
