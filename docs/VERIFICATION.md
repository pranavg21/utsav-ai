# UtsavAI Verification & Audit Log

Generated: 2026-11-01
Environment: Node 20+, Vite 6, Vitest 2.1.9, TypeScript 5.6.3, ESLint 9/10

---

## 1. Verification Pipeline Summary (`npm run verify`)

```bash
> utsav-ai@1.0.0 verify
> npm run typecheck && npm run lint && npm run test:cov && npm run build
```

### 1.1 TypeScript Strict Check (`npm run typecheck`)
```bash
> utsav-ai@1.0.0 typecheck
> tsc -b
# Exit code: 0 (Zero errors)
```

### 1.2 ESLint Zero-Warning Check (`npm run lint`)
```bash
> utsav-ai@1.0.0 lint
> eslint . --max-warnings 0
# Exit code: 0 (Zero warnings, zero errors across all src/ files including tests)
```

### 1.3 Vitest Coverage Matrix (`npm run test:cov`)
```text
Test Files  57 passed (57)
     Tests  257 passed (257)

% Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.99 |    85.71 |   92.88 |   96.99 |                   
 src               |   95.16 |    80.95 |      50 |   95.16 |                   
  App.tsx          |   95.16 |    80.95 |      50 |   95.16 | 19,116-120        
 src/components    |   97.98 |    84.37 |    90.9 |   97.98 |                   
  ApiKeyModal.tsx  |     100 |      100 |     100 |     100 |                   
  ...ionsPanel.tsx |     100 |    71.42 |     100 |     100 | 57,76,92,108      
  ...MatrixTab.tsx |     100 |     92.3 |     100 |     100 | 81                
  ...takePanel.tsx |   94.11 |      100 |     100 |   94.11 | 27-28             
  ...rBoundary.tsx |     100 |    88.88 |     100 |     100 | 52                
  Header.tsx       |   97.14 |    81.81 |      75 |   97.14 | 95-98             
  ...dIdeasTab.tsx |    96.2 |       60 |     100 |    96.2 | 56-58             
  ...anceBadge.tsx |     100 |       60 |     100 |     100 | 31,44             
  ...Simulator.tsx |   98.16 |       80 |      80 |   98.16 | 97-98             
  TabSkeleton.tsx  |     100 |      100 |     100 |     100 |                   
  ...ndencyTab.tsx |      95 |     87.5 |     100 |      95 | 83-87             
  ...cklistTab.tsx |   98.59 |    81.25 |     100 |   98.59 | 33                
  ...aratorTab.tsx |   96.47 |      100 |      50 |   96.47 | 78-80             
 ...ponents/budget |     100 |      100 |     100 |     100 |                   
  ...arioCards.tsx |     100 |      100 |     100 |     100 |                   
 ...ents/checklist |   97.16 |    78.94 |   71.42 |   97.16 |                   
  ...tItemCard.tsx |   97.16 |    78.94 |   71.42 |   97.16 | 49-51             
 ...ponents/intake |   99.62 |     92.3 |   77.77 |   99.62 |                   
  ...entFields.tsx |     100 |      100 |   57.14 |     100 |                   
  ...nstraints.tsx |    98.7 |    84.61 |     100 |    98.7 | 45                
  ...nputField.tsx |     100 |      100 |     100 |     100 |                   
  ...nkingList.tsx |     100 |       80 |      50 |     100 | 20                
 ...ents/subEvents |   96.46 |    82.85 |     100 |   96.46 |                   
  ConflictList.tsx |   82.45 |       75 |     100 |   82.45 | 16,22,29-38       
  ...udgetGrid.tsx |     100 |      100 |     100 |     100 |                   
  SubEventRow.tsx  |     100 |    81.81 |     100 |     100 | 78,104            
  SubEventsTab.tsx |     100 |    83.33 |     100 |     100 | 67                
 ...onents/vendors |   93.02 |    58.33 |     100 |   93.02 |                   
  ...QuoteCard.tsx |   93.02 |    58.33 |     100 |   93.02 | 39-42,53-55       
 src/data          |     100 |      100 |     100 |     100 |                   
  assumptions.ts   |     100 |      100 |     100 |     100 |                   
  presets.ts       |     100 |      100 |     100 |     100 |                   
 src/domain/budget |   98.28 |    80.95 |   91.66 |   98.28 |                   
  allocation.ts    |    97.5 |    71.42 |     100 |    97.5 | 90-91             
  scenario.ts      |     100 |    81.81 |     100 |     100 | 38,41             
  shares.ts        |    92.5 |      100 |      50 |    92.5 | 63-65             
  tradeoffs.ts     |     100 |      100 |     100 |     100 |                   
  waterFilling.ts  |     100 |    72.41 |     100 |     100 | ...23-26,70,74,80 
 .../changeRequest |      95 |    94.53 |   93.33 |      95 |                   
  aggregate.ts     |     100 |      100 |     100 |     100 |                   
  clauseParsers.ts |     100 |    90.41 |     100 |     100 | ...35,43-44,51-53 
  parse.ts         |   76.47 |      100 |      75 |   76.47 | 81-88             
 src/domain/shared |    92.3 |       75 |     100 |    92.3 |                   
  constants.ts     |     100 |      100 |     100 |     100 |                   
  indianNumbers.ts |   86.66 |       75 |     100 |   86.66 | 26-27             
 ...main/subEvents |     100 |      100 |     100 |     100 |                   
  conflicts.ts     |     100 |      100 |     100 |     100 |                   
 ...omain/timeline |   99.72 |    81.33 |     100 |   99.72 |                   
  graph.ts         |     100 |    77.27 |     100 |     100 | ...01-104,106,116 
  propagate.ts     |   98.93 |    81.63 |     100 |   98.93 | 132               
  templates.ts     |     100 |      100 |     100 |     100 |                   
  ...esBirthday.ts |     100 |      100 |     100 |     100 |                   
  ...sCommunity.ts |     100 |      100 |     100 |     100 |                   
 ...domain/vendors |   99.72 |    94.87 |     100 |   99.72 |                   
  checklist.ts     |     100 |    97.14 |     100 |     100 | 79                
  normalize.ts     |     100 |      100 |     100 |     100 |                   
  ...eExtracted.ts |     100 |      100 |     100 |     100 |                   
  ...eQuoteText.ts |    97.7 |    87.87 |     100 |    97.7 | 36-37             
  quotes.ts        |     100 |    66.66 |     100 |     100 | 131               
  templates.ts     |     100 |      100 |     100 |     100 |                   
  ...esBirthday.ts |     100 |      100 |     100 |     100 |                   
  ...sCommunity.ts |     100 |      100 |     100 |     100 |                   
 src/hooks         |   76.86 |       82 |   85.71 |   76.86 |                   
  ...eRequestAi.ts |     100 |    36.36 |     100 |     100 | 32,52-75          
  useGeminiAuth.ts |     100 |      100 |     100 |     100 |                   
  usePlan.ts       |   92.94 |      100 |     100 |   92.94 | 94-104            
  usePlanTypes.ts  |       0 |        0 |       0 |       0 | 1-54              
  useThemes.ts     |     100 |      100 |     100 |     100 |                   
  ...dorQuoteAi.ts |    87.5 |    88.88 |     100 |    87.5 | 53-57             
 src/prompts       |     100 |      100 |     100 |     100 |                   
  ...nerPrompts.ts |     100 |      100 |     100 |     100 |                   
 ...ervices/gemini |   98.15 |    68.26 |     100 |   98.15 |                   
  client.ts        |   91.25 |    68.96 |     100 |   91.25 | ...1-42,65-66,134 
  config.ts        |     100 |      100 |     100 |     100 |                   
  dispatcher.ts    |   94.73 |    73.33 |     100 |   94.73 | 72-73             
  fallbacks.ts     |     100 |     90.9 |     100 |     100 | 34                
  planner.ts       |     100 |    83.33 |     100 |     100 | 44,90             
  ...nerHelpers.ts |     100 |    27.27 |     100 |     100 | 9,20-23,46-49     
  schemas.ts       |     100 |      100 |     100 |     100 |                   
  themeFallback.ts |     100 |    66.66 |     100 |     100 | 22-24,34-37       
  vendorAi.ts      |     100 |     62.5 |     100 |     100 | 35,48,88          
 src/state         |   99.06 |     90.9 |     100 |   99.06 |                   
  ...inHandlers.ts |   97.75 |    84.61 |     100 |   97.75 | 42,64             
  ...leHandlers.ts |     100 |    93.54 |     100 |     100 | 54,58             
  planReducer.ts   |     100 |      100 |     100 |     100 |                   
  selectors.ts     |     100 |      100 |     100 |     100 |                   
 src/utils         |   97.35 |    89.47 |     100 |   97.35 |                   
  cache.ts         |    91.2 |       76 |     100 |    91.2 | ...84,115,123,135 
  exportPlan.ts    |     100 |      100 |     100 |     100 |                   
  logger.ts        |     100 |     87.5 |     100 |     100 | 33                
  schemas.ts       |     100 |      100 |     100 |     100 |                   
  security.ts      |     100 |      100 |     100 |     100 |                   
  typeGuards.ts    |     100 |     87.5 |     100 |     100 | 77                
  uiHelpers.ts     |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
Statements: 96.99% (target >= 90%)
Branches:   85.71% (target >= 85%)
Functions:  92.88% (target >= 90%)
Lines:      96.99% (target >= 90%)
```

---

## 2. Production Bundle Size & Secret Check (`scripts/check-bundle-size.mjs`)

```bash
> node scripts/check-bundle-size.mjs

Bundle chunk BudgetMatrixTab-CjleaLL9.js: raw 4472 B, gzip 1.64 kB
Bundle chunk circle-check-jaqyjNwQ.js: raw 341 B, gzip 0.26 kB
[ENTRY] Bundle chunk index-BIj0SJUg.js: raw 321554 B, gzip 97.13 kB
Bundle chunk index-BmBZfDgG.js: raw 295474 B, gzip 56.91 kB
Bundle chunk PersonalizedIdeasTab-CG6E25xu.js: raw 6102 B, gzip 2.15 kB
Bundle chunk SubEventsTab-BTKPNV6Z.js: raw 9299 B, gzip 2.64 kB
Bundle chunk TimelineDependencyTab-DVfOsoXB.js: raw 3764 B, gzip 1.45 kB
Bundle chunk triangle-alert-6X9FqvyU.js: raw 433 B, gzip 0.30 kB
Bundle chunk VendorChecklistTab-D2hn9Cay.js: raw 7203 B, gzip 2.28 kB
Bundle chunk VendorComparatorTab-ac0Q8ya3.js: raw 10841 B, gzip 3.76 kB
SUCCESS: All production chunks are strictly within 130 kB gzipped budget and clean of secrets.
```
