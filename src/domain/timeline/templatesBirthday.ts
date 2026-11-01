/**
 * @fileoverview Task templates for Birthday celebration execution DAGs.
 */

import type { TaskTemplate } from './templates';

/** Task templates tailored for milestone and kids' birthday celebrations. */
export const BIRTHDAY_TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'task-venue', title: 'Book Party Hall / Play Zone', phase: 'Foundation', timelineFraction: 0.9, dependsOn: [] },
  {
    id: 'task-caterer',
    title: 'Order Custom Cake & Snack Menu',
    phase: 'Vendor Locking',
    timelineFraction: 0.8,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-decor',
    title: 'Lock Theme Balloon Backdrop',
    phase: 'Vendor Locking',
    timelineFraction: 0.7,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-entertainment',
    title: 'Hire Game Host & Magician',
    phase: 'Vendor Locking',
    timelineFraction: 0.6,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-photo',
    title: 'Book Birthday Photographer',
    phase: 'Vendor Locking',
    timelineFraction: 0.5,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-invitations',
    title: 'Send Invites & Pack Return Gifts',
    phase: 'Guest & Logistics',
    timelineFraction: 0.4,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-rehearsal',
    title: 'Party Hall Walkthrough & Sound Check',
    phase: 'Final Execution',
    timelineFraction: 0.15,
    dependsOn: ['task-caterer', 'task-decor', 'task-entertainment'],
  },
  {
    id: 'task-dayof',
    title: 'Cake Cutting & Party Run',
    phase: 'Final Execution',
    timelineFraction: 0.05,
    dependsOn: ['task-rehearsal'],
  },
];
