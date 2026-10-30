/**
 * @fileoverview Domain types and default presets for multi-event Indian celebration functions.
 */

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
