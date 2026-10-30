/**
 * @fileoverview Timeline task templates, initialization, and topological sort.
 */

import type { EventContext, TimelineTask } from '../../types/planner';
import { type Result, okResult, errResult } from '../../types/result';

export interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly phase: TimelineTask['phase'];
  readonly timelineFraction: number;
  readonly dependsOn: readonly string[];
}

export const TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'task-venue', title: 'Finalize Venue & Date', phase: 'Foundation', timelineFraction: 0.9, dependsOn: [] },
  { id: 'task-budget', title: 'Lock Budget Allocation', phase: 'Foundation', timelineFraction: 0.85, dependsOn: ['task-venue'] },
  { id: 'task-caterer', title: 'Book Caterer', phase: 'Vendor Locking', timelineFraction: 0.75, dependsOn: ['task-venue', 'task-budget'] },
  { id: 'task-decor', title: 'Lock Decor Concept', phase: 'Vendor Locking', timelineFraction: 0.7, dependsOn: ['task-venue'] },
  { id: 'task-photo', title: 'Book Photographer & Videographer', phase: 'Vendor Locking', timelineFraction: 0.65, dependsOn: ['task-venue'] },
  { id: 'task-invite', title: 'Send Invitations', phase: 'Guest & Logistics', timelineFraction: 0.55, dependsOn: ['task-venue'] },
  { id: 'task-entertain', title: 'Confirm Entertainment & Rituals', phase: 'Guest & Logistics', timelineFraction: 0.45, dependsOn: ['task-budget'] },
  { id: 'task-logistics', title: 'Arrange Transport & Accommodation', phase: 'Guest & Logistics', timelineFraction: 0.35, dependsOn: ['task-invite'] },
  { id: 'task-rehearsal', title: 'Final Rehearsal & Vendor Walkthrough', phase: 'Final Execution', timelineFraction: 0.1, dependsOn: ['task-caterer', 'task-decor', 'task-entertain'] },
  { id: 'task-dayof', title: 'Event Day Coordination', phase: 'Final Execution', timelineFraction: 0.02, dependsOn: ['task-rehearsal'] },
];

export function buildInitialCelebrationTasks(context: EventContext): TimelineTask[] {
  const totalDays = Math.max(14, context.daysUntilEvent);
  const tasks = TASK_TEMPLATES.map((tmpl) => {
    const baseline = Math.max(1, Math.round(totalDays * tmpl.timelineFraction));
    return {
      id: tmpl.id,
      title: tmpl.title,
      phase: tmpl.phase,
      daysBeforeEvent: baseline,
      baselineDaysBeforeEvent: baseline,
      delayDays: 0,
      ownDelayDays: 0,
      status: 'pending' as const,
      dependsOn: [...tmpl.dependsOn],
      isBottleneck: false,
      delayImpactNote: '',
      isInfeasible: false,
    };
  });

  if (context.accessibilityNeeds.length > 0) {
    const accessDays = Math.min(30, Math.max(7, Math.round(totalDays * 0.3)));
    tasks.push({
      id: 'task-accessibility',
      title: 'Accessibility Audit & Mobility Setup',
      phase: 'Guest & Logistics',
      daysBeforeEvent: accessDays,
      baselineDaysBeforeEvent: accessDays,
      delayDays: 0,
      ownDelayDays: 0,
      status: 'pending',
      dependsOn: ['task-venue'],
      isBottleneck: false,
      delayImpactNote: '',
      isInfeasible: false,
    });
  }

  return tasks;
}

function buildGraph(tasks: ReadonlyArray<TimelineTask>): {
  inDegree: Map<string, number>;
  graph: Map<string, string[]>;
} {
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  for (const t of tasks) {
    inDegree.set(t.id, 0);
    graph.set(t.id, []);
  }

  for (const t of tasks) {
    for (const depId of t.dependsOn) {
      const neighbors = graph.get(depId);
      if (neighbors) {
        neighbors.push(t.id);
        inDegree.set(t.id, (inDegree.get(t.id) ?? 0) + 1);
      }
    }
  }

  return { inDegree, graph };
}

export function getTopologicalOrder(tasks: ReadonlyArray<TimelineTask>): Result<string[], string> {
  const { inDegree, graph } = buildGraph(tasks);
  const queue = tasks.filter((t) => inDegree.get(t.id) === 0).map((t) => t.id);
  const order: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    order.push(current);

    const neighbors = graph.get(current) ?? [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (order.length === tasks.length) {
    return okResult(order);
  }

  const cyclicTasks = tasks.filter((t) => (inDegree.get(t.id) ?? 0) > 0).map((t) => t.id);
  return errResult(`Cycle detected in task dependencies: ${cyclicTasks.join(' -> ')}`);
}
