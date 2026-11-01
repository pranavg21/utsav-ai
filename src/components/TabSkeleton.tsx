/**
 * @fileoverview Accessible fallback skeleton rendered during lazy tab transitions.
 */

import React from 'react';

/** Accessible fallback placeholder skeleton displayed during lazy tab suspense loading. */
export const TabSkeleton: React.FC = () => (
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

export default TabSkeleton;

