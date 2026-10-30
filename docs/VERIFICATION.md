# UtsavAI Verification & Audit Log

Generated: 2026-10-30
Environment: Node 20, Vite 6, Vitest 2.1.9, TypeScript 5.6.3, ESLint 10

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
Test Files  39 passed (39)
     Tests  186 passed (186)

% Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   97.66 |    86.11 |    92.3 |   97.66 |                   
 src               |     100 |       75 |   42.85 |     100 |                   
  App.tsx          |     100 |       75 |   42.85 |     100 | 33,89             
 src/components    |   97.91 |     90.9 |   86.95 |   97.91 |                   
  ApiKeyModal.tsx  |     100 |      100 |     100 |     100 |                   
  ...ionsPanel.tsx |     100 |    71.42 |     100 |     100 | 56,75,91,107      
  ...MatrixTab.tsx |     100 |     92.3 |     100 |     100 | 77                
  ...takePanel.tsx |   94.11 |      100 |     100 |   94.11 | 27-28             
  ...rBoundary.tsx |     100 |    88.88 |     100 |     100 | 52                
  Header.tsx       |   96.96 |    85.71 |   66.66 |   96.96 | 86-89             
  ...dIdeasTab.tsx |   95.65 |       75 |      50 |   95.65 | 43,67-69          
  ...Simulator.tsx |   94.17 |     87.5 |      75 |   94.17 | 64-65,101-104     
  ...ndencyTab.tsx |     100 |    93.33 |     100 |     100 | 46                
  ...aratorTab.tsx |     100 |      100 |     100 |     100 |                   
 ...ponents/budget |     100 |      100 |     100 |     100 |                   
  ...arioCards.tsx |     100 |      100 |     100 |     100 |                   
 ...ponents/intake |    99.6 |    90.62 |   82.35 |    99.6 |                   
  ...entFields.tsx |     100 |      100 |   66.66 |     100 |                   
  ...nstraints.tsx |    98.7 |    84.61 |     100 |    98.7 | 44                
  ...nputField.tsx |     100 |      100 |     100 |     100 |                   
  ...nkingList.tsx |     100 |       80 |      50 |     100 | 19                
 ...onents/vendors |   96.34 |    63.63 |     100 |   96.34 |                   
  ...QuoteCard.tsx |   96.34 |    63.63 |     100 |   96.34 | 37-40             
 src/data          |     100 |      100 |     100 |     100 |                   
  assumptions.ts   |     100 |      100 |     100 |     100 |                   
  presets.ts       |     100 |      100 |     100 |     100 |                   
 src/domain/budget |      99 |    79.71 |     100 |      99 |                   
  allocation.ts    |    97.7 |    71.42 |     100 |    97.7 | 90-91             
  tradeoffs.ts     |     100 |    83.33 |     100 |     100 | ...30-33,60,64,70 
 .../changeRequest |   97.36 |    84.61 |     100 |   97.36 |                   
  parse.ts         |   97.36 |    84.61 |     100 |   97.36 | 19-20             
 ...main/subEvents |     100 |      100 |     100 |     100 |                   
  conflicts.ts     |     100 |      100 |     100 |     100 |                   
 ...omain/timeline |    99.4 |    83.63 |     100 |    99.4 |                   
  graph.ts         |     100 |    77.27 |     100 |     100 | ...02-105,107,117 
  propagate.ts     |   98.71 |    87.87 |     100 |   98.71 | 89                
 ...domain/vendors |     100 |    95.83 |     100 |     100 |                   
  normalize.ts     |     100 |      100 |     100 |     100 |                   
  quotes.ts        |     100 |    66.66 |     100 |     100 | 126               
 src/hooks         |   98.07 |      100 |     100 |   98.07 |                   
  usePlan.ts       |   98.07 |      100 |     100 |   98.07 | 80                
 src/prompts       |     100 |       60 |     100 |     100 |                   
  ...nerPrompts.ts |     100 |       60 |     100 |     100 | 79-80             
 src/services      |     100 |    76.92 |     100 |     100 |                   
  ...eoffEngine.ts |     100 |      100 |     100 |     100 |                   
  ...nerService.ts |     100 |      100 |     100 |     100 |                   
  ...rioBuilder.ts |     100 |    81.81 |     100 |     100 | 36,39             
  ...dencyGraph.ts |     100 |       50 |     100 |     100 | 28                
  ...Comparator.ts |     100 |      100 |     100 |     100 |                   
 ...ervices/gemini |   87.96 |    70.37 |     100 |   87.96 |                   
  client.ts        |    61.9 |       50 |     100 |    61.9 | ...25,38-45,49-53 
  fallbacks.ts     |     100 |      100 |     100 |     100 |                   
  planner.ts       |     100 |       75 |     100 |     100 | 30,53             
 src/state         |   93.38 |     92.3 |     100 |   93.38 |                   
  planReducer.ts   |   91.96 |    91.37 |     100 |   91.96 | ...,83-85,138-140 
  selectors.ts     |     100 |      100 |     100 |     100 |                   
 src/utils         |   97.45 |    90.41 |     100 |   97.45 |                   
  cache.ts         |   91.39 |    76.92 |     100 |   91.39 | ...,69,94,102,111 
  exportPlan.ts    |     100 |      100 |     100 |     100 |                   
  logger.ts        |     100 |     87.5 |     100 |     100 | 33                
  schemas.ts       |     100 |      100 |     100 |     100 |                   
  security.ts      |     100 |      100 |     100 |     100 |                   
  typeGuards.ts    |     100 |      100 |     100 |     100 |                   
  uiHelpers.ts     |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
Statements: 97.66% (target >= 90%)
Branches:   86.11% (target >= 85%)
Functions:  92.30% (target >= 90%)
Lines:      97.66% (target >= 90%)
```

---

## 2. Production Bundle Size & Secret Check (`scripts/check-bundle-size.mjs`)

```bash
> node scripts/check-bundle-size.mjs

Bundle chunk BudgetMatrixTab-BrZXpyHH.js: raw 4462 B, gzip 1.64 kB
Bundle chunk index-B5AHYASy.js: raw 193436 B, gzip 60.42 kB
Bundle chunk index-vEmsAoXE.js: raw 295474 B, gzip 56.91 kB
Bundle chunk PersonalizedIdeasTab-CQov__3r.js: raw 8470 B, gzip 3.13 kB
Bundle chunk shield-D_wNz9vS.js: raw 733 B, gzip 0.39 kB
Bundle chunk TimelineDependencyTab-pv2pginC.js: raw 3457 B, gzip 1.34 kB
Bundle chunk VendorComparatorTab-B6fvMw2F.js: raw 7161 B, gzip 2.52 kB

SUCCESS: All production chunks are strictly within 130 kB gzipped budget and clean of secrets.
```
