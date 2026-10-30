/**
 * @fileoverview Main diagnostic context intake panel composed of sub-sections.
 */

import React, { useCallback } from 'react';
import type { BudgetCategoryName, EventContext } from '../types/planner';
import { CARD_CLASSES } from '../utils/uiHelpers';
import { BasicEventFields } from './intake/BasicEventFields';
import { PriorityRankingList } from './intake/PriorityRankingList';
import { DemographicsConstraints } from './intake/DemographicsConstraints';

interface IntakePanelProps {
  readonly context: EventContext;
  readonly onUpdate: (updated: EventContext) => void;
}

const ContextIntakePanel: React.FC<IntakePanelProps> = React.memo(({ context, onUpdate }) => {
  const handleUpdateField = useCallback(
    <K extends keyof EventContext>(key: K, value: EventContext[K]): void => {
      onUpdate({ ...context, [key]: value });
    },
    [context, onUpdate]
  );

  const handleUpdateRanking = useCallback(
    (updatedRanking: BudgetCategoryName[]): void => {
      onUpdate({ ...context, priorityRanking: updatedRanking });
    },
    [context, onUpdate]
  );

  return (
    <section className={CARD_CLASSES} aria-label="Event configuration">
      <h2 className="mb-4 text-lg font-bold text-slate-100">Context-First Diagnostic Intake</h2>
      <BasicEventFields context={context} onUpdateField={handleUpdateField} />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PriorityRankingList
          priorityRanking={context.priorityRanking}
          onUpdateRanking={handleUpdateRanking}
        />
        <DemographicsConstraints context={context} onUpdateField={handleUpdateField} />
      </div>
    </section>
  );
});

ContextIntakePanel.displayName = 'ContextIntakePanel';

export default ContextIntakePanel;
