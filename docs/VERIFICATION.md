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
Test Files  53 passed (53)
     Tests  227 passed (227)

% Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   98.14 |    85.49 |   94.08 |   98.14 |                   
 src               |     100 |       80 |   42.85 |     100 |                   
  App.tsx          |     100 |       80 |   42.85 |     100 | 33,97             
 src/components    |   97.46 |    87.35 |   88.88 |   97.46 |                   
  ApiKeyModal.tsx  |     100 |      100 |     100 |     100 |                   
  ...ionsPanel.tsx |     100 |    71.42 |     100 |     100 | 56,75,91,107      
  ...MatrixTab.tsx |     100 |     92.3 |     100 |     100 | 77                
  ...takePanel.tsx |   94.11 |      100 |     100 |   94.11 | 27-28             
  ...rBoundary.tsx |     100 |    88.88 |     100 |     100 | 52                
  Header.tsx       |   96.96 |    85.71 |   66.66 |   96.96 | 86-89             
  ...dIdeasTab.tsx |   95.65 |       75 |      50 |   95.65 | 43,67-69          
  ...nceBadge.tsx  |     100 |      100 |     100 |     100 |                   
  ...Simulator.tsx |   93.85 |    84.21 |      75 |   93.85 | 63-64,103-106     
  ...ndencyTab.tsx |     100 |    93.75 |     100 |     100 | 52                
  ...stItemCard.tsx|     100 |      100 |     100 |     100 |                   
  ...ecklistTab.tsx|     100 |      100 |     100 |     100 |                   
  ...aratorTab.tsx |     100 |      100 |     100 |     100 |                   
 ...ponents/budget |     100 |      100 |     100 |     100 |                   
  ...arioCards.tsx |     100 |      100 |     100 |     100 |                   
 ...ponents/intake |    99.6 |    90.62 |   82.35 |    99.6 |                   
  ...entFields.tsx |     100 |      100 |   57.14 |     100 |                   
  ...nstraints.tsx |    98.7 |    84.61 |     100 |    98.7 | 44                
  ...nputField.tsx |     100 |      100 |     100 |     100 |                   
  ...nkingList.tsx |     100 |       80 |      50 |     100 | 19                
 ...ents/subEvents |   96.36 |    82.85 |     100 |   96.36 |                   
  ConflictList.tsx |   82.45 |       75 |     100 |   82.45 | 15,21,27-36       
  ...udgetGrid.tsx |     100 |      100 |     100 |     100 |                   
  SubEventRow.tsx  |     100 |    81.81 |     100 |     100 | 64,90             
  SubEventsTab.tsx |     100 |    83.33 |     100 |     100 | 61                
 ...onents/vendors |   96.34 |    63.63 |     100 |   96.34 |                   
  ...QuoteCard.tsx |   96.34 |    63.63 |     100 |   96.34 | 37-40             
 src/data          |     100 |      100 |     100 |     100 |                   
  assumptions.ts   |     100 |      100 |     100 |     100 |                   
  presets.ts       |     100 |      100 |     100 |     100 |                   
 src/domain/budget |   99.25 |    80.95 |     100 |   99.25 |                   
  allocation.ts    |    97.5 |    71.42 |     100 |    97.5 | 84-85             
  scenario.ts      |     100 |    81.81 |     100 |     100 | 36,39             
  shares.ts        |     100 |      100 |     100 |     100 |                   
  tradeoffs.ts     |     100 |    83.33 |     100 |     100 | ...30-33,60,64,70 
 .../changeRequest |   97.59 |    87.34 |     100 |   97.59 |                   
  parse.ts         |   97.59 |    87.34 |     100 |   97.59 | 25-26             
 ...main/subEvents |     100 |      100 |     100 |     100 |                   
  conflicts.ts     |     100 |      100 |     100 |     100 |                   
 ...omain/timeline |   99.53 |    81.33 |     100 |   99.53 |                   
  graph.ts         |     100 |    77.27 |     100 |     100 | 74,89-92,94,104   
  propagate.ts     |   98.93 |    81.63 |     100 |   98.93 | 105               
  templates.ts     |     100 |      100 |     100 |     100 |                   
 ...domain/vendors |   98.64 |    89.58 |     100 |   98.64 |                   
  checklist.ts     |     100 |    97.14 |     100 |     100 | 79                
  normalize.ts     |     100 |      100 |     100 |     100 |                   
  ...eQuoteText.ts |      90 |    77.77 |     100 |      90 | 12-14,16-19,46-47 
  quotes.ts        |     100 |    66.66 |     100 |     100 | 126               
  templates.ts     |     100 |      100 |     100 |     100 |                   
  ...esBirthday.ts |     100 |      100 |     100 |     100 |                   
  ...sCommunity.ts |     100 |      100 |     100 |     100 |                   
 src/hooks         |   96.03 |       96 |     100 |   96.03 |                   
  useGeminiAuth.ts |     100 |      100 |     100 |     100 |                   
  usePlan.ts       |      95 |      100 |     100 |      95 | 105-111           
  useThemes.ts     |   96.66 |       75 |     100 |   96.66 | 33                
 src/prompts       |     100 |      100 |     100 |     100 |                   
  ...nerPrompts.ts |     100 |      100 |     100 |     100 |                   
 ...ervices/gemini |    98.3 |    74.44 |     100 |    98.3 |                   
  client.ts        |    92.3 |    65.51 |     100 |    92.3 | ...2-33,51-52,106 
  config.ts        |     100 |      100 |     100 |     100 |                   
  fallbacks.ts     |     100 |    97.14 |     100 |     100 | 134               
  planner.ts       |   98.79 |       50 |     100 |   98.79 | 51                
  schemas.ts       |     100 |      100 |     100 |     100 |                   
  vendorAi.ts      |     100 |     62.5 |     100 |     100 | 30,43,77          
 src/state         |   99.02 |    90.56 |     100 |   99.02 |                   
  ...inHandlers.ts |   97.75 |    84.61 |     100 |   97.75 | 36,52             
  planReducer.ts   |     100 |    95.55 |     100 |     100 | 90,94             
  selectors.ts     |     100 |      100 |     100 |     100 |                   
 src/utils         |   97.37 |    89.61 |     100 |   97.37 |                   
  cache.ts         |   91.39 |    76.92 |     100 |   91.39 | ...,69,94,102,111 
  exportPlan.ts    |     100 |      100 |     100 |     100 |                   
  logger.ts        |     100 |     87.5 |     100 |     100 | 33                
  schemas.ts       |     100 |      100 |     100 |     100 |                   
  security.ts      |     100 |      100 |     100 |     100 |                   
  typeGuards.ts    |     100 |     87.5 |     100 |     100 | 77                
  uiHelpers.ts     |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
Statements: 98.14% (target >= 90%)
Branches:   85.49% (target >= 85%)
Functions:  94.08% (target >= 90%)
Lines:      98.14% (target >= 90%)
```

---

## 2. Production Bundle Size & Secret Check (`scripts/check-bundle-size.mjs`)

```bash
> node scripts/check-bundle-size.mjs

[ENTRY] Bundle chunk index-l8FBJn4Y.js: raw 306198 B, gzip 92.16 kB
Bundle chunk index-BzAYTDhO.js (Gemini API): raw 295474 B, gzip 56.92 kB
Bundle chunk SubEventsTab-DreNYNOa.js: raw 9283 B, gzip 2.63 kB
Bundle chunk PersonalizedIdeasTab-CpuabS0d.js: raw 11581 B, gzip 4.23 kB
Bundle chunk VendorComparatorTab-l-0Q93VQ.js: raw 8176 B, gzip 2.88 kB
Bundle chunk VendorChecklistTab-vsrDjez9.js: raw 7203 B, gzip 2.28 kB
Bundle chunk BudgetMatrixTab-BJbnIxj3.js: raw 4502 B, gzip 1.66 kB
Bundle chunk TimelineDependencyTab-COKQu27T.js: raw 3722 B, gzip 1.43 kB

SUCCESS: All production chunks are strictly within 130 kB gzipped budget and clean of secrets.
```
