/**
 * @fileoverview Dependency-aware critical-path timeline generator and delay propagation engine.
 * Tasks use explicit `dependsOn` links so delaying a prerequisite automatically cascades
 * downstream deadlines and flags bottleneck tasks.
 */

import type { EventContext, TimelineTask } from '../types/planner';

/** Default delay days when a task is marked as delayed without a custom value. */
const DEFAULT_DELAY_DAYS = 10;

/**
 * Template definition for a timeline task before context-specific dates are computed.
 */
interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly phase: TimelineTask['phase'];
  /** Fraction of total timeline to schedule this task before the event. */
  readonly timelineFraction: number;
  readonly dependsOn: string[];
}

/** Master task template list ordered by planning phase. */
const TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'task-venue', title: 'Finalize Venue & Date', phase: 'Foundation', timelineFraction: 0.90, dependsOn: [] },
  { id: 'task-budget', title: 'Lock Budget Allocation', phase: 'Foundation', timelineFraction: 0.85, dependsOn: ['task-venue'] },
  { id: 'task-caterer', title: 'Book Caterer', phase: 'Vendor Locking', timelineFraction: 0.75, dependsOn: ['task-venue', 'task-budget'] },
  { id: 'task-decor', title: 'Lock Decor Concept', phase: 'Vendor Locking', timelineFraction: 0.70, dependsOn: ['task-venue'] },
  { id: 'task-photo', title: 'Book Photographer & Videographer', phase: 'Vendor Locking', timelineFraction: 0.65, dependsOn: ['task-venue'] },
  { id: 'task-invite', title: 'Send Invitations', phase: 'Guest & Logistics', timelineFraction: 0.55, dependsOn: ['task-venue'] },
  { id: 'task-entertain', title: 'Confirm Entertainment & Rituals', phase: 'Guest & Logistics', timelineFraction: 0.45, dependsOn: ['task-budget'] },
  { id: 'task-logistics', title: 'Arrange Transport & Accommodation', phase: 'Guest & Logistics', timelineFraction: 0.35, dependsOn: ['task-invite'] },
  { id: 'task-rehearsal', title: 'Final Rehearsal & Vendor Walkthrough', phase: 'Final Execution', timelineFraction: 0.10, dependsOn: ['task-caterer', 'task-decor', 'task-entertain'] },
  { id: 'task-dayof', title: 'Event Day Coordination', phase: 'Final Execution', timelineFraction: 0.02, dependsOn: ['task-rehearsal'] },
] as const;

/**
 * Generates a dependency-aware timeline from the event context with computed deadlines.
 *
 * @param context - The active event diagnostic context.
 * @returns Array of TimelineTask nodes with calculated `daysBeforeEvent`.
 */
export function buildTimeline(context: EventContext): TimelineTask[] {
  return TASK_TEMPLATES.map((tpl) => ({
    id: tpl.id,
    title: tpl.title,
    phase: tpl.phase,
    daysBeforeEvent: Math.max(1, Math.round(context.daysUntilEvent * tpl.timelineFraction)),
    delayDays: 0,
    status: 'pending' as const,
    dependsOn: [...tpl.dependsOn],
    isBottleneck: false,
    delayImpactNote: '',
  }));
}

/**
 * Propagates delay from a specified task through all dependent downstream tasks.
 * Marks impacted tasks as bottlenecks with descriptive delay notes.
 *
 * @param tasks - Mutable array of timeline tasks.
 * @param delayedTaskId - ID of the task being delayed.
 * @param delayDays - Number of days to add as delay (defaults to 10).
 * @returns Updated array with cascaded delays and bottleneck flags.
 */
export function propagateDelay(
  tasks: TimelineTask[],
  delayedTaskId: string,
  delayDays: number = DEFAULT_DELAY_DAYS
): TimelineTask[] {
  const taskMap = new Map(tasks.map((t) => [t.id, { ...t }]));
  const source = taskMap.get(delayedTaskId);
  if (!source) { return tasks; }

  source.status = 'delayed';
  source.delayDays = delayDays;
  source.delayImpactNote = `Delayed by ${delayDays} days — downstream tasks will shift.`;

  const visited = new Set<string>();
  const queue = [delayedTaskId];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) { continue; }
    visited.add(currentId);

    for (const [, task] of taskMap) {
      if (task.dependsOn.includes(currentId) && !visited.has(task.id)) {
        task.daysBeforeEvent = Math.max(1, task.daysBeforeEvent - delayDays);
        task.isBottleneck = true;
        task.delayImpactNote = `Shifted ${delayDays}d due to "${source.title}" delay.`;
        queue.push(task.id);
      }
    }
  }
  return Array.from(taskMap.values());
}

/**
 * Compresses all pending task deadlines by a specified number of days.
 *
 * @param tasks - Array of timeline tasks.
 * @param compressionDays - Number of days to subtract from each pending deadline.
 * @returns Updated tasks with compressed timelines.
 */
export function compressTimeline(tasks: TimelineTask[], compressionDays: number): TimelineTask[] {
  return tasks.map((t) => ({
    ...t,
    daysBeforeEvent: Math.max(1, t.daysBeforeEvent - compressionDays),
    delayImpactNote: t.status === 'pending'
      ? `Timeline compressed by ${compressionDays} days.`
      : t.delayImpactNote,
  }));
}

/**
 * Returns task IDs in topological dependency order (prerequisites first).
 *
 * @param tasks - Array of timeline tasks.
 * @returns Array of task IDs sorted in dependency order.
 */
export function getTopologicalOrder(tasks: TimelineTask[]): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  const visit = (id: string): void => {
    if (visited.has(id)) { return; }
    visited.add(id);
    const task = taskMap.get(id);
    if (task) {
      for (const dep of task.dependsOn) { visit(dep); }
    }
    result.push(id);
  };

  for (const t of tasks) { visit(t.id); }
  return result;
}
