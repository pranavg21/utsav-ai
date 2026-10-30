/**
 * @fileoverview Task templates for Wedding, Birthday, and Community event execution DAGs.
 */

import type { OccasionType, TimelineTask } from '../../types/planner';

export interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly phase: TimelineTask['phase'];
  readonly timelineFraction: number;
  readonly dependsOn: readonly string[];
}

export const WEDDING_TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'task-venue', title: 'Finalize Venue & Date', phase: 'Foundation', timelineFraction: 0.9, dependsOn: [] },
  { id: 'task-budget', title: 'Lock Budget Allocation', phase: 'Foundation', timelineFraction: 0.85, dependsOn: ['task-venue'] },
  { id: 'task-caterer', title: 'Book Caterer & Hospitality', phase: 'Vendor Locking', timelineFraction: 0.75, dependsOn: ['task-venue', 'task-budget'] },
  { id: 'task-decor', title: 'Lock Mandap & Floral Decor', phase: 'Vendor Locking', timelineFraction: 0.7, dependsOn: ['task-venue'] },
  { id: 'task-photo', title: 'Book Photographer & Video', phase: 'Vendor Locking', timelineFraction: 0.65, dependsOn: ['task-venue'] },
  { id: 'task-invitations', title: 'Dispatch Wedding Invites', phase: 'Guest & Logistics', timelineFraction: 0.55, dependsOn: ['task-venue'] },
  { id: 'task-entertainment', title: 'Confirm Sangeet, Mehendi & Pandit', phase: 'Guest & Logistics', timelineFraction: 0.45, dependsOn: ['task-budget'] },
  { id: 'task-transport', title: 'Arrange Guest Logistics & Fleet', phase: 'Guest & Logistics', timelineFraction: 0.35, dependsOn: ['task-invitations'] },
  { id: 'task-rehearsal', title: 'Final Walkthrough & Tech Dry Run', phase: 'Final Execution', timelineFraction: 0.1, dependsOn: ['task-caterer', 'task-decor', 'task-entertainment'] },
  { id: 'task-dayof', title: 'Wedding Day Coordination', phase: 'Final Execution', timelineFraction: 0.02, dependsOn: ['task-rehearsal'] },
];

export const BIRTHDAY_TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'task-venue', title: 'Book Party Hall / Play Zone', phase: 'Foundation', timelineFraction: 0.9, dependsOn: [] },
  { id: 'task-caterer', title: 'Order Custom Cake & Snack Menu', phase: 'Vendor Locking', timelineFraction: 0.8, dependsOn: ['task-venue'] },
  { id: 'task-decor', title: 'Lock Theme Balloon Backdrop', phase: 'Vendor Locking', timelineFraction: 0.7, dependsOn: ['task-venue'] },
  { id: 'task-entertainment', title: 'Hire Game Host & Magician', phase: 'Vendor Locking', timelineFraction: 0.6, dependsOn: ['task-venue'] },
  { id: 'task-photo', title: 'Book Birthday Photographer', phase: 'Vendor Locking', timelineFraction: 0.5, dependsOn: ['task-venue'] },
  { id: 'task-invitations', title: 'Send Invites & Pack Return Gifts', phase: 'Guest & Logistics', timelineFraction: 0.4, dependsOn: ['task-venue'] },
  { id: 'task-rehearsal', title: 'Party Hall Walkthrough & Sound Check', phase: 'Final Execution', timelineFraction: 0.15, dependsOn: ['task-caterer', 'task-decor', 'task-entertainment'] },
  { id: 'task-dayof', title: 'Birthday Celebration & Cake Cutting', phase: 'Final Execution', timelineFraction: 0.02, dependsOn: ['task-rehearsal'] },
];

export const COMMUNITY_TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'task-approvals', title: 'Verify with local authority: Permissions & Sound NOC', phase: 'Foundation', timelineFraction: 0.95, dependsOn: [] },
  { id: 'task-venue', title: 'Sanction Community Ground / Hall', phase: 'Foundation', timelineFraction: 0.9, dependsOn: ['task-approvals'] },
  { id: 'task-decor', title: 'Erect Pandal, Seating & Barricades', phase: 'Vendor Locking', timelineFraction: 0.75, dependsOn: ['task-venue'] },
  { id: 'task-entertainment', title: 'Install PA Sound & Book Performers', phase: 'Vendor Locking', timelineFraction: 0.65, dependsOn: ['task-venue'] },
  { id: 'task-caterer', title: 'Organize Food Stalls & Drinking Water', phase: 'Vendor Locking', timelineFraction: 0.55, dependsOn: ['task-venue'] },
  { id: 'task-logistics', title: 'Deploy Sanitation & Volunteer Marshals', phase: 'Guest & Logistics', timelineFraction: 0.4, dependsOn: ['task-venue'] },
  { id: 'task-rehearsal', title: 'PA Sound Testing & Fire Safety Dry Run', phase: 'Final Execution', timelineFraction: 0.1, dependsOn: ['task-decor', 'task-entertainment', 'task-logistics'] },
  { id: 'task-dayof', title: 'Festival Inauguration & Crowd Protocol', phase: 'Final Execution', timelineFraction: 0.02, dependsOn: ['task-rehearsal'] },
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

