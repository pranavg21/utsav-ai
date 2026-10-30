/**
 * @fileoverview Main layout shell orchestrating navigation tabs and planning panels.
 */

import React, { useState, lazy, Suspense } from 'react';
import { Download } from 'lucide-react';
import Header from './components/Header';
import ContextIntakePanel from './components/ContextIntakePanel';
import RippleEffectSimulator from './components/RippleEffectSimulator';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { DEFAULT_ASSUMPTIONS, type EventAssumptions } from './data/assumptions';
import { usePlan } from './hooks/usePlan';
import { downloadPlanJson } from './utils/exportPlan';

const BudgetMatrixTab = lazy(() => import('./components/BudgetMatrixTab'));
const TimelineDependencyTab = lazy(() => import('./components/TimelineDependencyTab'));
const VendorComparatorTab = lazy(() => import('./components/VendorComparatorTab'));
const PersonalizedIdeasTab = lazy(() => import('./components/PersonalizedIdeasTab'));

type TabId = 'budget' | 'timeline' | 'vendor' | 'ideas';

const TABS: ReadonlyArray<{ readonly id: TabId; readonly label: string }> = [
  { id: 'budget', label: 'Budget Matrix' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'vendor', label: 'Vendor Quotes' },
  { id: 'ideas', label: 'Theme Ideas' },
];

const TabSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading tab content"
    className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
  >
    <div className="h-6 w-1/3 rounded bg-slate-800" />
    <div className="mt-4 h-40 rounded bg-slate-800/60" />
  </div>
);

const App: React.FC = () => {
  const { state, derived, actions } = usePlan();
  const [activeTab, setActiveTab] = useState<TabId>('budget');
  const [isHighContrast, setHighContrast] = useState(false);
  const [isLargeText, setLargeText] = useState(false);
  const [assumptions, setAssumptions] = useState<EventAssumptions>(DEFAULT_ASSUMPTIONS);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${isHighContrast ? 'contrast-125' : ''} ${isLargeText ? 'text-lg' : ''}`}>
      <Header
        onSelectPreset={(ctx) => actions.loadPreset({ id: 'custom', title: ctx.eventName, context: ctx })}
        onToggleContrast={() => setHighContrast((c) => !c)}
        onToggleLargeText={() => setLargeText((l) => !l)}
        isHighContrast={isHighContrast}
        isLargeText={isLargeText}
      />
      <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => downloadPlanJson(state.context, derived.evaluation, state.tasks, state.quotes)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-saffron-500 hover:text-saffron-400"
            aria-label="Export complete celebration plan as JSON"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Plan (JSON)
          </button>
        </div>
        <ContextIntakePanel context={state.context} onUpdate={actions.updateContext} />
        <AssumptionsPanel assumptions={assumptions} onUpdate={setAssumptions} />
        <RippleEffectSimulator context={state.context} onApplyChange={actions.applyChange} />
        <nav role="tablist" aria-label="Dashboard views" className="flex border-b border-slate-700/60">
          {TABS.map((tab) => (
            <button
              type="button"
              role="tab"
              key={tab.id}
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              aria-label={`Switch to ${tab.label} tab`}
              className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition ${activeTab === tab.id ? 'border-saffron-500 text-saffron-400' : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <Suspense fallback={<TabSkeleton />}>
          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            {activeTab === 'budget' && (
              <BudgetMatrixTab
                evaluation={derived.evaluation}
                onToggleVerified={actions.toggleVerified}
                onUpdateAmount={actions.setProjected}
                onApplyTradeOff={actions.applyTradeoff}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineDependencyTab tasks={state.tasks} onToggleStatus={(id, s, d) => actions.setTaskStatus(id, s, d)} />
            )}
            {activeTab === 'vendor' && (
              <VendorComparatorTab
                quotes={state.quotes}
                context={state.context}
                categoryBudgets={derived.categoryBudgets}
                onToggleVerified={actions.toggleQuoteVerified}
                onAddQuote={actions.addQuote}
              />
            )}
            {activeTab === 'ideas' && <PersonalizedIdeasTab context={state.context} />}
          </div>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
