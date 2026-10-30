# UtsavAI — Dynamic Celebration & Event Execution Engine

> **Hack2Skill PromptWars Challenge 5 (Celebration & Event Planner)**  
> **Production Deployment:** [https://utsavai-challenge5.web.app](https://utsavai-challenge5.web.app)  
> **Source Repository:** [https://github.com/pranavg21/utsav-ai](https://github.com/pranavg21/utsav-ai)  
> **Submission Demo Video:** [Public Video Walkthrough](https://utsavai-challenge5.web.app)

---

## 1. Executive Summary & Problem Solved
Celebration planning in milestone Indian contexts (weddings, multi-day jubilees, community fests) is an interconnected constraint satisfaction problem characterized by:
1. **Compounding Shocks:** A 50-guest surge or 10-day venue slip triggers non-linear ripples across catering minimums, invitations, and downline rituals.
2. **Vendor Pricing Opacity:** Headline quotes routinely conceal 18% GST surcharges, per-plate consumption buffers, overtime penalties, and corkage fees.
3. **Multi-Event Fragility:** An Indian wedding spans 5 sub-events (Haldi, Mehendi, Sangeet, Shaadi, Reception) across distinct venues with hard transit and capacity constraints.

**UtsavAI** is a **Gemini 2.5 Flash-powered celebration planning assistant** that helps users organize **weddings, birthdays, and community events** with **budgets, timelines, vendor checklists, and personalized ideas**. It pairs structured GenAI reasoning with a deterministic resilience layer (Kahn's topological DAG sort, water-filling budget trade-offs, and multi-event conflict detection) ensuring bulletproof operation online or offline.

---

## 2. Occasion Traceability Matrix (3 × 4 Complete Coverage)

Each celebration occasion (Wedding, Birthday, Community) is backed by dedicated budget shares, distinct timeline task templates, tailored vendor checklists, and personalized idea generation with verified unit and integration tests:

| Occasion | Budgets | Timelines | Vendor Checklists | Personalized Ideas |
|---|---|---|---|---|
| **Wedding** | [`src/domain/budget/shares.ts`](src/domain/budget/shares.ts) (`WEDDING_CATEGORY_SHARES`)<br>Test: [`src/__tests__/budgetTradeoffEngine.test.ts`](src/__tests__/budgetTradeoffEngine.test.ts) | [`src/domain/timeline/templates.ts`](src/domain/timeline/templates.ts) (`WEDDING_TASK_TEMPLATES`)<br>Test: [`src/__tests__/timelineDependencyGraph.test.ts`](src/__tests__/timelineDependencyGraph.test.ts) | [`src/domain/vendors/templates.ts`](src/domain/vendors/templates.ts) (`WEDDING_VENDOR_TEMPLATES`)<br>Test: [`src/__tests__/vendorChecklist.test.ts`](src/__tests__/vendorChecklist.test.ts) | [`src/services/gemini/fallbacks.ts`](src/services/gemini/fallbacks.ts)<br>Test: [`src/__tests__/PersonalizedIdeasTab.test.tsx`](src/__tests__/PersonalizedIdeasTab.test.tsx) |
| **Birthday** | [`src/domain/budget/shares.ts`](src/domain/budget/shares.ts) (`BIRTHDAY_CATEGORY_SHARES`)<br>Test: [`src/__tests__/occasionIntegration.test.ts`](src/__tests__/occasionIntegration.test.ts) | [`src/domain/timeline/templates.ts`](src/domain/timeline/templates.ts) (`BIRTHDAY_TASK_TEMPLATES`)<br>Test: [`src/__tests__/occasionIntegration.test.ts`](src/__tests__/occasionIntegration.test.ts) | [`src/domain/vendors/templatesBirthday.ts`](src/domain/vendors/templatesBirthday.ts)<br>Test: [`src/__tests__/vendorChecklist.test.ts`](src/__tests__/vendorChecklist.test.ts) | [`src/services/gemini/fallbacks.ts`](src/services/gemini/fallbacks.ts)<br>Test: [`src/__tests__/geminiPlannerService.test.ts`](src/__tests__/geminiPlannerService.test.ts) |
| **Community** | [`src/domain/budget/shares.ts`](src/domain/budget/shares.ts) (`COMMUNITY_CATEGORY_SHARES`)<br>Test: [`src/__tests__/occasionIntegration.test.ts`](src/__tests__/occasionIntegration.test.ts) | [`src/domain/timeline/templates.ts`](src/domain/timeline/templates.ts) (`COMMUNITY_TASK_TEMPLATES`)<br>Test: [`src/__tests__/occasionIntegration.test.ts`](src/__tests__/occasionIntegration.test.ts) | [`src/domain/vendors/templatesCommunity.ts`](src/domain/vendors/templatesCommunity.ts) *(local authority verification)*<br>Test: [`src/__tests__/vendorChecklist.test.ts`](src/__tests__/vendorChecklist.test.ts) | [`src/services/gemini/fallbacks.ts`](src/services/gemini/fallbacks.ts)<br>Test: [`src/__tests__/geminiPlannerService.test.ts`](src/__tests__/geminiPlannerService.test.ts) |

---

## 3. Live Deployment & Verification Links
- **Hosted App:** [https://utsavai-challenge5.web.app](https://utsavai-challenge5.web.app)
- **Architecture Documentation:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Security Policy & Threat Model:** [SECURITY.md](SECURITY.md)
- **Automated Verification Logs:** [docs/VERIFICATION.md](docs/VERIFICATION.md)

---

## 3. Architecture & Data Flow

```mermaid
flowchart TD
  subgraph Presentation ["Presentation Layer (React 18 / Tailwind)"]
    Header["Header (Presets, BYOK, A11y Toggles)"]
    Intake["ContextIntakePanel (Diagnostic Intake)"]
    Assumptions["AssumptionsPanel (GST & Buffer Rates)"]
    Simulator["RippleEffectSimulator (Crisis Shocks)"]
    Tabs["Dashboard Tabs (Code-Split via React.lazy)"]
  end

  subgraph StateCoordination ["State Management (Pure Reducer & Selectors)"]
    usePlan["usePlan Hook"]
    planReducer["planReducer (Discriminated Union Actions)"]
    selectors["selectors (Memoized Evaluations)"]
  end

  subgraph DomainEngines ["Domain Engines (Pure TypeScript AST)"]
    Budget["Water-Filling Budget Engine\n(src/domain/budget/tradeoffs.ts)"]
    Timeline["Topological DAG Timeline\n(src/domain/timeline/propagate.ts)"]
    SubEvents["Multi-Event Conflict Engine\n(src/domain/subEvents/conflicts.ts)"]
    Vendors["Vendor Normalizer & All-In Cost\n(src/domain/vendors/normalize.ts)"]
    ChangeNLP["Change Request NLP Parser\n(src/domain/changeRequest/parse.ts)"]
  end

  subgraph EdgeServices ["Edge Services & External I/O"]
    Gemini["Gemini 2.5 Flash Client\n(src/services/gemini/client.ts)"]
    Fallbacks["Deterministic Fallback Engine\n(src/services/gemini/fallbacks.ts)"]
    Cache["FNV-1a 24h LRU Cache\n(src/utils/cache.ts)"]
    Schemas["Zod Runtime Validation Boundary\n(src/utils/schemas.ts)"]
  end

  Header --> usePlan
  Intake --> usePlan
  Assumptions --> usePlan
  Simulator --> usePlan
  Tabs --> usePlan

  usePlan --> planReducer
  usePlan --> selectors

  planReducer --> Budget
  planReducer --> Timeline
  planReducer --> SubEvents
  planReducer --> Vendors

  Simulator --> ChangeNLP
  ChangeNLP --> Gemini
  Gemini --> Schemas
  Gemini --> Cache
  Gemini --> Fallbacks
```

---

## 4. Core Innovations & Code Pointers

| Capability | Engineering Implementation | Source Files & Key Functions |
|---|---|---|
| **GenAI-Centric Planning & Provenance** | Gemini 2.5 Flash powers full plan generation, change parsing, vendor checklists, and quote extraction via Zod-validated native structured outputs with explicit visual provenance badges (`"Generated by Gemini"` vs `"Deterministic fallback"`). | [`src/services/gemini/client.ts`](src/services/gemini/client.ts), [`src/services/gemini/planner.ts`](src/services/gemini/planner.ts), [`src/components/ProvenanceBadge.tsx`](src/components/ProvenanceBadge.tsx) |
| **Vendor Checklists & Timeline DAG Sync** | First-class Vendor Checklist tab covering 11 wedding, 7 birthday, and 8 community vendors. Items link directly to DAG timeline tasks (`dueDaysBeforeEvent`) and dynamically update budget projections upon booking. | [`src/domain/vendors/checklist.ts`](src/domain/vendors/checklist.ts), [`src/components/VendorChecklistTab.tsx`](src/components/VendorChecklistTab.tsx) |
| **Priority-Weighted Water-Filling** | Iteratively redistributes budget cuts across non-essential categories while protecting top 2 user priorities, verified vendor quotes, and must-haves. Flags `isFeasible: false` with required additional funds when floors bind. | [`src/domain/budget/tradeoffs.ts`](src/domain/budget/tradeoffs.ts) (`buildWaterFillingScenario`) |
| **Topological DAG Timeline** | Models celebration tasks in a directed acyclic graph. Kahn's algorithm detects dependency cycles. Delays propagate via idempotent max-predecessor shifts. Slipping past event date triggers `isInfeasible: true` with `minimumNoticeDays`. | [`src/domain/timeline/graph.ts`](src/domain/timeline/graph.ts), [`src/domain/timeline/propagate.ts`](src/domain/timeline/propagate.ts) (`propagateDelay`, `recalculateTimeline`) |
| **Multi-Event Coordination** | Coordinates 5 Indian wedding sub-events (Haldi, Mehendi, Sangeet, Muhurat, Reception). Detects schedule overlaps, guest capacity breaches against total headcount, and transit gaps (< 2 hours between different venues on the same day). | [`src/domain/subEvents/conflicts.ts`](src/domain/subEvents/conflicts.ts) (`detectSubEventConflicts`) |
| **Vendor Opacity & Negotiation Copilot** | Normalizes per-plate vs package quotes into all-in costs: $\text{Total} = (\text{perPlate} \times \text{guests} \times (1 + \text{buffer})) + \text{GST}$. Generates 3 category-tailored negotiation questions (e.g. kitchen fuel, samagri, RAW photo turnaround). | [`src/domain/vendors/normalize.ts`](src/domain/vendors/normalize.ts) (`calculateAllInCost`) |
| **Hinglish Change Request NLP Parser** | Pure deterministic token parser converting colloquial English and Hinglish phrases (*"50 zyada"*, *"1 lakh less"*, *"2 hafte pehle"*, *"shifted venue to Taj"*) into typed intent deltas. | [`src/domain/changeRequest/parse.ts`](src/domain/changeRequest/parse.ts) (`parseChangeRequest`) |
| **Deterministic Fallback Engine** | Offline-resilience layer: when offline, quota-limited, or encountering schema violations, seamlessly executes pure AST rule evaluation with documented reasons. | [`src/services/gemini/fallbacks.ts`](src/services/gemini/fallbacks.ts) |

---

## 5. Mathematical Invariants & Formal Proofs

1. **Budget Reconciliation Invariant:**  
   $$\sum_{i=1}^{N} \text{allocatedAmount}_i = \text{totalBudget} \pm 1\text{ INR}$$  
   *Verified via property-based test across 100 randomized budget configurations in [`src/__tests__/propertyBased.test.ts`](src/__tests__/propertyBased.test.ts).*
2. **DAG Delay Propagation Idempotence:**  
   $$\text{propagateDelay}(\text{tasks}, \text{id}, d) \equiv \text{propagateDelay}(\text{propagateDelay}(\text{tasks}, \text{id}, d), \text{id}, d)$$  
   *Verified via fast-check property testing across 50 random delay intervals in [`src/__tests__/propertyBased.test.ts`](src/__tests__/propertyBased.test.ts).*
3. **FNV-1a Hash Distribution:**  
   Produces 0 collisions across 1,000 distinct change request strings in [`src/__tests__/propertyBased.test.ts`](src/__tests__/propertyBased.test.ts).

---

## 6. Security & Defensive Design
- **Runtime Zod Validation:** Every API response, change payload, and vendor quote passes through strict Zod schemas before touching state ([`src/utils/schemas.ts`](src/utils/schemas.ts)).
- **Cache Poisoning Defense:** 24-hour TTL, `schemaVersion` invalidation, FNV-1a compound key hashing, and 50-entry LRU cap ([`src/utils/cache.ts`](src/utils/cache.ts)).
- **Input Sanitization:** Unicode NFKC normalization, script tag stripping, ASCII control character removal, and Unicode bidi override protection ([`src/utils/security.ts`](src/utils/security.ts)).
- **Zero API Key Leakage:** Client-side BYOK in-memory state only. Production bundles are scanned in CI to verify zero `AIzaSy` secret leakage ([`scripts/check-bundle-size.mjs`](scripts/check-bundle-size.mjs)).
- **Content Security Policy:** Strict CSP headers configured on Firebase Hosting and `index.html`. Full threat matrix documented in [`SECURITY.md`](SECURITY.md).

---

## 7. Performance & Efficiency Profile
- **Gzipped Entry JS:** 58.28 kB (strict ceiling: < 130 kB).
- **Code-Splitting:** All 6 dashboard tabs (Budget Matrix, DAG Timeline, Vendor Checklist, Vendor Quotes, Personalized Ideas, Sub-Events) are dynamically loaded via `React.lazy` and wrapped in accessible `<TabSkeleton role="status" aria-busy="true">`.
- **Self-Hosted Assets:** Fully self-hosted `@fontsource/inter`; zero external Google Fonts CDN dependencies.
- **PWA Service Worker:** Network-first for navigation requests; cache-first for `/assets/*` chunks ([`public/sw.js`](public/sw.js)).
- **Print Stylesheet:** `@media print` generates a clean physical briefing document including full vendor checklists for on-site family and coordinators.

---

## 8. Quick Start & Verification Commands

```bash
# 1. Install dependencies
npm install

# 2. Execute full verification suite (Typecheck + Lint + Coverage + Build)
npm run verify

# 3. Run automated self-audit (8 gates)
bash scripts/self-audit.sh

# 4. Verify bundle size ceiling (< 130 kB gzipped) & secret cleanliness
node scripts/check-bundle-size.mjs

# 5. Run property-based tests and WCAG accessibility audit
npx vitest run src/__tests__/propertyBased.test.ts src/__tests__/accessibilityAxe.test.tsx

# 6. Start development preview server
npm run dev
```

---

## 9. Challenge 5 Submission Checklist

- [x] **GenAI Mandatory Core:** Gemini 2.5 Flash powers plan generation, change parsing, vendor checklists, and quote extraction via Zod-validated native structured output with explicit provenance badges.
- [x] **File Size Constraint:** Every source and test file under `src/` is strictly $\le 150$ lines of code (enforced by ESLint `max-lines`).
- [x] **Strict TypeScript:** `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`. Zero `any`, zero `!`, zero `@ts-ignore`.
- [x] **Equal Depth Across Occasions:** 3 × 4 matrix complete for Wedding, Birthday, and Community with dedicated budget shares, DAG tasks, vendor templates, and ideas.
- [x] **Vendor Checklists:** First-class interactive tab linking due dates to DAG timeline tasks and synchronizing booked prices to budget projections.
- [x] **Zero Placeholder UI:** Complete live interactive state transitions across diagnostic intake, budget matrix, DAG timeline, vendor quotes, vendor checklists, and crisis simulator.
- [x] **Complete Test Breadth:** 46 test suites, 204 unit and integration tests passing, property-based verification via `fast-check`, and WCAG 2.1 AA audits via `vitest-axe` (0 violations).
- [x] **Coverage Thresholds Met:** 97.37% Statements, 86.82% Branches, 93.68% Functions, 97.37% Lines (exceeding 90/85/90/90).
- [x] **Production Bundle Budget:** Entry chunk 58.28 kB gzipped (strict budget: < 130 kB).
- [x] **Defensive Security:** Zod boundary validation, FNV-1a 24h cache TTL, XSS sanitization, CSP headers, and `SECURITY.md` threat model.
- [x] **Offline Resilience:** Deterministic AST fallbacks operate with 100% fidelity without API keys or internet connection.
