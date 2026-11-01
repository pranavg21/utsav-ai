/**
 * @fileoverview Idempotent DAG delay propagation and timeline compression engine.
 */

import type { TimelineTask, TaskStatus } from '../../types/planner';
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
  const baseOwnDelay = delayOverrides?.has(task.id)
    ? (delayOverrides.get(task.id) ?? 0)
    : (task.ownDelayDays ?? 0);
  let maxPrereqShift = 0;
  for (const depId of task.dependsOn) {
    const depShift = effectiveShifts.get(depId) ?? 0;
    if (depShift > maxPrereqShift) maxPrereqShift = depShift;
  }
  return Math.max(baseOwnDelay, maxPrereqShift);
}

function formatImpactNote(shift: number, ownDelay: number, currentNote: string): string {
  if (shift <= 0) return currentNote;
  return ownDelay > 0
    ? `Delayed by ${ownDelay}d — downstream tasks shifted ${shift}d.`
    : `Shifted by ${shift}d due to prerequisite delays.`;
}

function resolveTaskStatus(currentStatus: TaskStatus, ownDelay: number): TaskStatus {
  if (ownDelay > 0) return 'delayed';
  if (currentStatus === 'delayed') return 'pending';
  return currentStatus;
}

function applyShiftToTask(task: TimelineTask, shift: number, ownDelay: number): void {
  const baseline = task.baselineDaysBeforeEvent ?? task.daysBeforeEvent;
  const newDeadline = baseline - shift;
  const isInfeasible = Boolean(task.isInfeasible) || newDeadline < 1;
  task.baselineDaysBeforeEvent = baseline;
  task.ownDelayDays = ownDelay;
  task.delayDays = shift;
  task.daysBeforeEvent = Math.max(1, newDeadline);
  task.isBottleneck = shift > 0 || task.isBottleneck;
  task.isInfeasible = isInfeasible;
  task.minimumNoticeDays = task.minimumNoticeDays ?? (newDeadline < 1 ? shift + 1 : undefined);
  task.delayImpactNote = formatImpactNote(shift, ownDelay, task.delayImpactNote);
  task.isImpacted = shift > 0 && ownDelay === 0;
  task.status = resolveTaskStatus(task.status, ownDelay);
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
    const baseOwnDelay = delayOverrides?.has(taskId)
      ? (delayOverrides.get(taskId) ?? 0)
      : (task.ownDelayDays ?? 0);
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
  const shifted = tasks.map((t) => {
    const currentBaseline = t.baselineDaysBeforeEvent ?? t.daysBeforeEvent;
    const rawBaseline = currentBaseline - compressionDays;
    const rawDays = t.daysBeforeEvent - compressionDays;
    const isInfeasible = rawDays < 1;
    return {
      ...t,
      baselineDaysBeforeEvent: Math.max(1, rawBaseline),
      daysBeforeEvent: Math.max(1, rawDays),
      isInfeasible,
      minimumNoticeDays: isInfeasible ? compressionDays + 1 : undefined,
      delayImpactNote:
        t.status === 'pending'
          ? `Timeline compressed by ${compressionDays} days.`
          : t.delayImpactNote,
    };
  });
  const res = recalculateTimeline(shifted);
  return res.ok ? res.value : shifted;
}
