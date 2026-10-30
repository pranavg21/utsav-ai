/**
 * @fileoverview Idempotent DAG delay propagation and timeline compression engine.
 */

import type { TimelineTask } from '../../types/planner';
import { type Result, okResult, errResult } from '../../types/result';
import { getTopologicalOrder } from './graph';

export function propagateDelay(
  tasks: ReadonlyArray<TimelineTask>,
  delayedTaskId: string,
  delayDays = 10
): TimelineTask[] {
  const result = recalculateTimeline(tasks, new Map([[delayedTaskId, delayDays]]));
  return result.ok ? result.value : [...tasks];
}

function computeEffectiveShift(
  task: TimelineTask,
  delayOverrides: ReadonlyMap<string, number> | undefined,
  effectiveShifts: ReadonlyMap<string, number>
): number {
  const baseOwnDelay = delayOverrides?.get(task.id) ?? task.ownDelayDays ?? 0;
  let maxPrereqShift = 0;
  for (const depId of task.dependsOn) {
    const depShift = effectiveShifts.get(depId) ?? 0;
    if (depShift > maxPrereqShift) maxPrereqShift = depShift;
  }
  return Math.max(baseOwnDelay, maxPrereqShift);
}

function applyShiftToTask(task: TimelineTask, shift: number, ownDelay: number): void {
  const baseline = task.baselineDaysBeforeEvent ?? task.daysBeforeEvent;
  const newDeadline = baseline - shift;
  const isInfeasible = newDeadline < 1;
  task.baselineDaysBeforeEvent = baseline;
  task.ownDelayDays = ownDelay;
  task.delayDays = shift;
  task.daysBeforeEvent = Math.max(1, newDeadline);
  task.isBottleneck = shift > 0;
  task.isInfeasible = isInfeasible;
  task.minimumNoticeDays = isInfeasible ? shift + 1 : undefined;
  task.delayImpactNote =
    shift > 0
      ? ownDelay > 0
        ? `Delayed by ${ownDelay}d — downstream tasks shifted ${shift}d.`
        : `Shifted by ${shift}d due to prerequisite delays.`
      : '';
  task.status = shift > 0 && task.status === 'pending' ? 'delayed' : task.status;
}

export function recalculateTimeline(
  tasks: ReadonlyArray<TimelineTask>,
  delayOverrides?: ReadonlyMap<string, number> | undefined
): Result<TimelineTask[], string> {
  const orderResult = getTopologicalOrder(tasks);
  if (!orderResult.ok) return errResult(orderResult.error);

  const taskMap = new Map(tasks.map((t) => [t.id, { ...t }]));
  const effectiveShifts = new Map<string, number>();

  for (const taskId of orderResult.value) {
    const task = taskMap.get(taskId);
    if (!task) continue;
    const baseOwnDelay = delayOverrides?.get(taskId) ?? task.ownDelayDays ?? 0;
    const shift = computeEffectiveShift(task, delayOverrides, effectiveShifts);
    effectiveShifts.set(taskId, shift);
    applyShiftToTask(task, shift, baseOwnDelay);
  }

  return okResult(Array.from(taskMap.values()));
}

export function compressTimeline(
  tasks: ReadonlyArray<TimelineTask>,
  compressionDays: number
): TimelineTask[] {
  return tasks.map((t) => {
    const newDays = t.daysBeforeEvent - compressionDays;
    const isInfeasible = newDays < 1;
    return {
      ...t,
      daysBeforeEvent: Math.max(1, newDays),
      isInfeasible,
      minimumNoticeDays: isInfeasible ? compressionDays + 1 : undefined,
      delayImpactNote:
        t.status === 'pending'
          ? `Timeline compressed by ${compressionDays} days.`
          : t.delayImpactNote,
    };
  });
}
