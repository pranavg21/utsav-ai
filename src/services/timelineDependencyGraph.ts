/**
 * @fileoverview Re-export facade for timeline DAG initialization, topological sort, and delay propagation.
 */

import type { TimelineTask } from '../types/planner';
import {
  TASK_TEMPLATES,
  buildInitialCelebrationTasks,
  getTopologicalOrder as getOrder,
} from '../domain/timeline/graph';

export {
  TASK_TEMPLATES,
  buildInitialCelebrationTasks,
  buildInitialCelebrationTasks as buildTimeline,
  getOrder as getTopologicalOrderResult,
};

export {
  propagateDelay,
  recalculateTimeline,
  compressTimeline,
} from '../domain/timeline/propagate';

/** Backward-compatible topological order returning string[]. */
export function getTopologicalOrder(tasks: TimelineTask[]): string[] {
  const result = getOrder(tasks);
  return result.ok ? result.value : tasks.map((t) => t.id);
}
