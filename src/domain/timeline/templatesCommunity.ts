/**
 * @fileoverview Task templates for Community event execution DAGs.
 */

import type { TaskTemplate } from './templates';

/** Task templates tailored for community cultural fests and society gatherings. */
export const COMMUNITY_TASK_TEMPLATES: readonly TaskTemplate[] = [
  {
    id: 'task-approvals',
    title: 'Verify with local authority: Permissions & Sound NOC',
    phase: 'Foundation',
    timelineFraction: 0.95,
    dependsOn: [],
  },
  {
    id: 'task-venue',
    title: 'Sanction Community Ground / Hall',
    phase: 'Foundation',
    timelineFraction: 0.9,
    dependsOn: ['task-approvals'],
  },
  {
    id: 'task-decor',
    title: 'Erect Pandal, Seating & Barricades',
    phase: 'Vendor Locking',
    timelineFraction: 0.75,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-entertainment',
    title: 'Install PA Sound & Book Performers',
    phase: 'Vendor Locking',
    timelineFraction: 0.65,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-caterer',
    title: 'Organize Food Stalls & Drinking Water',
    phase: 'Vendor Locking',
    timelineFraction: 0.55,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-photo',
    title: 'Book Event Photographer & Press Media',
    phase: 'Vendor Locking',
    timelineFraction: 0.45,
    dependsOn: ['task-venue'],
  },
  {
    id: 'task-invitations',
    title: 'Publish Society Notice & WhatsApp Circular',
    phase: 'Guest & Logistics',
    timelineFraction: 0.35,
    dependsOn: ['task-approvals'],
  },
  {
    id: 'task-rehearsal',
    title: 'Full Pandal Power & Audio Trial Run',
    phase: 'Final Execution',
    timelineFraction: 0.1,
    dependsOn: ['task-decor', 'task-entertainment'],
  },
  {
    id: 'task-dayof',
    title: 'Festival Gate Management & Crowd Flow',
    phase: 'Final Execution',
    timelineFraction: 0.02,
    dependsOn: ['task-rehearsal'],
  },
];
