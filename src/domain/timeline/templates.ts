/**
 * @fileoverview Task templates for Wedding event execution DAGs and occasion dispatcher.
 */

import type { OccasionType, TimelineTask } from '../../types/planner';
import { BIRTHDAY_TASK_TEMPLATES } from './templatesBirthday';
import { COMMUNITY_TASK_TEMPLATES } from './templatesCommunity';

export { BIRTHDAY_TASK_TEMPLATES } from './templatesBirthday';
export { COMMUNITY_TASK_TEMPLATES } from './templatesCommunity';

export const VENDOR_DELAY_TASK_IDS = {
  caterer: 'task-caterer',
  venue: 'task-venue',
  photographer: 'task-photo',
  decorator: 'task-decor',
} as const;

export interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly phase: TimelineTask['phase'];
  readonly timelineFraction: number;
  readonly dependsOn: readonly string[];
}

export const WEDDING_TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'task-venue', title: 'Finalize Venue & Date', phase: 'Foundation', timelineFraction: 0.9, dependsOn: [] },
  {
    id: 'task-budget',
    title: 'Lock Budget Allocation',
    phase: 'Foundation',
    timelineFraction: 0.85,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-caterer',
    title: 'Book Caterer & Hospitality',
    phase: 'Vendor Locking',
    timelineFraction: 0.75,
    dependsOn: ['task-venue', 'task-budget'],
  },
  { id: 'task-decor', title: 'Lock Mandap & Floral Decor', phase: 'Vendor Locking', timelineFraction: 0.7, dependsOn: ['task-venue'] },
  { id: 'task-photo', title: 'Book Photographer & Video', phase: 'Vendor Locking', timelineFraction: 0.65, dependsOn: ['task-venue'] },
  {
    id: 'task-invitations',
    title: 'Dispatch Wedding Invites',
    phase: 'Guest & Logistics',
    timelineFraction: 0.55,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-entertainment',
    title: 'Confirm Sangeet, Mehendi & Pandit',
    phase: 'Guest & Logistics',
    timelineFraction: 0.45,
    dependsOn: ['task-budget'],
  },
  {
    id: 'task-transport',
    title: 'Arrange Guest Logistics & Fleet',
    phase: 'Guest & Logistics',
    timelineFraction: 0.35,
    dependsOn: ['task-invitations'],
  },
  {
    id: 'task-rehearsal',
    title: 'Final Walkthrough & Tech Dry Run',
    phase: 'Final Execution',
    timelineFraction: 0.1,
    dependsOn: ['task-caterer', 'task-decor', 'task-entertainment'],
  },
  {
    id: 'task-dayof',
    title: 'Wedding Day Coordination',
    phase: 'Final Execution',
    timelineFraction: 0.02,
    dependsOn: ['task-rehearsal'],
  },
];

export function getTaskTemplatesForOccasion(occasion: OccasionType): readonly TaskTemplate[] {
  switch (occasion) {
    case 'wedding':
      return WEDDING_TASK_TEMPLATES;
    case 'birthday':
      return BIRTHDAY_TASK_TEMPLATES;
    case 'community':
      return COMMUNITY_TASK_TEMPLATES;
  }
}
