/**
 * @fileoverview Timeline task templates, initialization, and topological sort.
 */

import type { EventContext, TimelineTask } from '../../types/planner';
import { type Result, okResult, errResult } from '../../types/result';
import {
  WEDDING_TASK_TEMPLATES,
  getTaskTemplatesForOccasion,
} from './templates';

export type { TaskTemplate } from './templates';
export const TASK_TEMPLATES = WEDDING_TASK_TEMPLATES;

export function buildInitialCelebrationTasks(context: EventContext): TimelineTask[] {
  const totalDays = Math.max(14, context.daysUntilEvent);
  const templates = getTaskTemplatesForOccasion(context.occasion);
  const tasks = templates.map((tmpl) => {
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
