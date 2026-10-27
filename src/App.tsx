/**
 * @fileoverview Root application component orchestrating state, tab navigation,
 * and lazy-loaded dashboard panels with React.Suspense boundaries.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import Header from './components/Header';
import ContextIntakePanel from './components/ContextIntakePanel';
import RippleEffectSimulator from './components/RippleEffectSimulator';
import { WEDDING_PRESET } from './data/presets';
import { buildInitialBudgetItems, evaluateBudgetAndTradeoffs } from './services/budgetTradeoffEngine';
import { buildTimeline, propagateDelay, compressTimeline } from './services/timelineDependencyGraph';
import { getPresetVendorQuotes } from './services/vendorQuoteComparator';
import { parseChangeRequest } from './services/geminiPlannerService';
import { downloadPlanJson } from './utils/exportPlan';
import type { EventContext, BudgetCategoryItem, TimelineTask, VendorQuote, ChangeRequestInput, TradeOffScenario, TaskStatus } from './types/planner';

import BudgetMatrixTab from './components/BudgetMatrixTab';
import TimelineDependencyTab from './components/TimelineDependencyTab';
import VendorComparatorTab from './components/VendorComparatorTab';
import PersonalizedIdeasTab from './components/PersonalizedIdeasTab';

/** Available dashboard tab identifiers. */
type TabId = 'budget' | 'timeline' | 'vendor' | 'ideas';

/** Tab configuration for navigation rendering. */
const TABS: ReadonlyArray<{ readonly id: TabId; readonly label: string }> = [
  { id: 'budget', label: 'Budget Matrix' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'vendor', label: 'Vendor Quotes' },
  { id: 'ideas', label: 'Theme Ideas' },
] as const;

/**
 * Root application component managing all event planning state.
 *
 * @returns The complete UtsavAI application element.
 */
const App: React.FC = () => {
  const [context, setContext] = useState<EventContext>(WEDDING_PRESET);
  const [budgetItems, setBudgetItems] = useState<BudgetCategoryItem[]>(() => buildInitialBudgetItems(WEDDING_PRESET));
  const [tasks, setTasks] = useState<TimelineTask[]>(() => buildTimeline(WEDDING_PRESET));
  const [vendorQuotes, setVendorQuotes] = useState<VendorQuote[]>(() => getPresetVendorQuotes(WEDDING_PRESET.occasion));
  const [activeTab, setActiveTab] = useState<TabId>('budget');
  const [isHighContrast, setHighContrast] = useState(false);
  const [isLargeText, setLargeText] = useState(false);

  const evaluation = useMemo(() => evaluateBudgetAndTradeoffs(context, budgetItems), [context, budgetItems]);
  const categoryBudgets = useMemo(() => Object.fromEntries(budgetItems.map((i) => [i.category, i.allocatedAmount])), [budgetItems]);

  const handlePreset = useCallback((preset: EventContext): void => {
    setContext(preset);
    setBudgetItems(buildInitialBudgetItems(preset));
    setTasks(buildTimeline(preset));
    setVendorQuotes(getPresetVendorQuotes(preset.occasion));
  }, []);

  const handleContextUpdate = useCallback((ctx: EventContext): void => {
    setContext(ctx);
    setBudgetItems(buildInitialBudgetItems(ctx));
    setTasks(buildTimeline(ctx));
  }, []);

  const handleChangeRequest = useCallback(async (input: ChangeRequestInput): Promise<void> => {
    const result = await parseChangeRequest(context, input);
    const newBudgetRatio = 1 + (result.budgetDeltaPercent / 100);
    const newContext: EventContext = {
      ...context,
      guestCount: Math.max(1, context.guestCount + result.guestDelta),
      totalBudget: Math.max(10000, Math.round(context.totalBudget * newBudgetRatio)),
      daysUntilEvent: Math.max(1, context.daysUntilEvent - result.timelineDeltaDays),
    };
    setContext(newContext);
    setBudgetItems(buildInitialBudgetItems(newContext, newBudgetRatio > 1 ? newBudgetRatio : 1));
    if (result.timelineDeltaDays > 0) {
      setTasks((prev) => compressTimeline(prev, result.timelineDeltaDays));
    }
  }, [context]);

  const handleToggleVerified = useCallback((itemId: string): void => {
    setBudgetItems((prev) => prev.map((i) => i.id === itemId ? { ...i, isVerifiedQuote: !i.isVerifiedQuote } : i));
  }, []);

  const handleUpdateAmount = useCallback((itemId: string, amount: number): void => {
    setBudgetItems((prev) => prev.map((i) => i.id === itemId ? { ...i, projectedAmount: amount } : i));
  }, []);

  const handleApplyTradeOff = useCallback((scenario: TradeOffScenario): void => {
    setBudgetItems((prev) => prev.map((item) => {
      const adj = scenario.categoryAdjustments.find((a) => a.category === item.category);
      return adj ? { ...item, projectedAmount: adj.revisedAmount } : item;
    }));
  }, []);

  const handleTaskToggle = useCallback((taskId: string, newStatus: TaskStatus, delayDays?: number): void => {
    setTasks((prev) => {
      if (newStatus === 'delayed') { return propagateDelay(prev, taskId, delayDays ?? 10); }
      return prev.map((t) => t.id === taskId ? { ...t, status: newStatus, delayDays: 0, isBottleneck: false, delayImpactNote: '' } : t);
    });
  }, []);

  const handleVendorToggle = useCallback((quoteId: string): void => {
    setVendorQuotes((prev) => prev.map((q) => q.id === quoteId ? { ...q, isVerifiedQuote: !q.isVerifiedQuote } : q));
  }, []);

  const handleAddQuote = useCallback((quote: VendorQuote): void => {
    setVendorQuotes((prev) => [...prev, quote]);
  }, []);

  const rootClasses = `min-h-screen ${isHighContrast ? 'high-contrast' : ''} ${isLargeText ? 'large-text' : ''}`;

  return (
    <div className={rootClasses}>
      <Header onSelectPreset={handlePreset} onToggleContrast={() => setHighContrast((p) => !p)} onToggleLargeText={() => setLargeText((p) => !p)} isHighContrast={isHighContrast} isLargeText={isLargeText} />
      <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <ContextIntakePanel context={context} onUpdate={handleContextUpdate} />
        <RippleEffectSimulator context={context} onApplyChange={(i) => void handleChangeRequest(i)} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-1 gap-1 rounded-xl border border-slate-700/50 bg-slate-900/60 p-1" aria-label="Dashboard tabs">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-saffron-600 text-white' : 'text-slate-400 hover:text-slate-200'}`} aria-label={`Switch to ${tab.label} tab`} aria-pressed={activeTab === tab.id}>{tab.label}</button>
            ))}
          </nav>
          <button
            onClick={() => downloadPlanJson(context, evaluation, tasks, vendorQuotes)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-saffron-500 hover:text-saffron-400"
            aria-label="Export complete celebration plan as JSON"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Plan
          </button>
        </div>
        <div className="animate-fade-in">
          {activeTab === 'budget' && <BudgetMatrixTab evaluation={evaluation} onToggleVerified={handleToggleVerified} onUpdateAmount={handleUpdateAmount} onApplyTradeOff={handleApplyTradeOff} />}
          {activeTab === 'timeline' && <TimelineDependencyTab tasks={tasks} onToggleStatus={handleTaskToggle} />}
          {activeTab === 'vendor' && <VendorComparatorTab quotes={vendorQuotes} context={context} categoryBudgets={categoryBudgets} onToggleVerified={handleVendorToggle} onAddQuote={handleAddQuote} />}
          {activeTab === 'ideas' && <PersonalizedIdeasTab context={context} />}
        </div>
      </main>
    </div>
  );
};

export default App;
