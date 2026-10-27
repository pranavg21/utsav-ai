/**
 * @fileoverview Timeline Dependency tab displaying critical-path cards with dependsOn badges,
 * Complete/Delay toggles, and bottleneck alerts with cascade impact notes.
 */

import React, { useCallback } from 'react';
import { Clock, CheckCircle, AlertTriangle, Link } from 'lucide-react';
import type { TimelineTask, TaskStatus } from '../types/planner';
import { BADGE_BASE } from '../utils/uiHelpers';

/** Props for the TimelineDependencyTab component. */
interface TimelineTabProps {
  readonly tasks: ReadonlyArray<TimelineTask>;
  readonly onToggleStatus: (taskId: string, newStatus: TaskStatus, delayDays?: number) => void;
}

/** Maps task status to CSS styling classes. */
const STATUS_STYLES: Record<TaskStatus, string> = {
  pending: 'border-slate-600 bg-slate-800/40',
  completed: 'border-emerald-500/40 bg-emerald-500/5',
  delayed: 'border-red-500/40 bg-red-500/5',
} as const;

/** Maps task status to badge styling. */
const STATUS_BADGE_STYLES: Record<TaskStatus, string> = {
  pending: 'bg-slate-500/20 text-slate-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  delayed: 'bg-red-500/20 text-red-400',
} as const;

/**
 * Displays dependency-aware timeline tasks with status toggles and bottleneck indicators.
 *
 * @param props - Tasks array and status toggle handler.
 * @returns Timeline section React element.
 */
const TimelineDependencyTab: React.FC<TimelineTabProps> = ({ tasks, onToggleStatus }) => {
  const handleCycleStatus = useCallback((task: TimelineTask): void => {
    const nextMap: Record<TaskStatus, TaskStatus> = {
      pending: 'completed',
      completed: 'delayed',
      delayed: 'pending',
    };
    const next = nextMap[task.status];
    onToggleStatus(task.id, next, next === 'delayed' ? 10 : 0);
  }, [onToggleStatus]);

  const phases = ['Foundation', 'Vendor Locking', 'Guest & Logistics', 'Final Execution'] as const;

  return (
    <section aria-label="Timeline dependency graph">
      <h2 className="mb-4 text-lg font-bold text-slate-100">Critical Path Timeline</h2>
      {phases.map((phase) => {
        const phaseTasks = tasks.filter((t) => t.phase === phase);
        if (phaseTasks.length === 0) { return null; }
        return (
          <div key={phase} className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">{phase}</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {phaseTasks.map((task) => (
                <div key={task.id} className={`rounded-xl border p-4 transition ${STATUS_STYLES[task.status]}`}>
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-200">{task.title}</h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        <span>{task.daysBeforeEvent}d before event</span>
                        {task.delayDays > 0 && (
                          <span className="text-red-400">(+{task.delayDays}d delayed)</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleCycleStatus(task)} className={`${BADGE_BASE} cursor-pointer transition ${STATUS_BADGE_STYLES[task.status]}`} aria-label={`Toggle status for ${task.title}, currently ${task.status}`}>
                      {task.status === 'completed' && <CheckCircle className="h-3 w-3" aria-hidden="true" />}
                      {task.status === 'delayed' && <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
                      {task.status}
                    </button>
                  </div>
                  {task.dependsOn.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {task.dependsOn.map((dep) => (
                        <span key={dep} className={`${BADGE_BASE} bg-peacock-500/20 text-peacock-500`}>
                          <Link className="h-2.5 w-2.5" aria-hidden="true" />
                          {dep}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.isBottleneck && (
                    <div className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-300" role="alert" aria-live="polite">
                      <AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden="true" />
                      {task.delayImpactNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default TimelineDependencyTab;
