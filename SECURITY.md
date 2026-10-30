# UtsavAI Security Policy & Threat Model

## Overview
UtsavAI is designed with defensive boundaries at every layer: all external data (API responses, user inputs, and storage items) must pass through runtime validation schemas before mutating state, while cryptographic cache envelopes, sanitized DOM bindings, and strict Content Security Policies prevent malicious exploitation.

---

## Threat Model & Defensive Matrix

| Threat | Risk Level | Attack Vector | Mitigation Strategy | Enforcing Implementation |
|---|---|---|---|---|
| **Prompt Injection** | Medium | Adversarial input in change requests designed to override system instructions | Strict deterministic delimiter sandboxing, system prompt anchoring, and AST rule-based deterministic fallback parser. | `src/prompts/celebrationPlannerPrompts.ts`, `src/domain/changeRequest/parse.ts` |
| **Cache Poisoning** | High | Tampered serialized state in sessionStorage or malicious collision injection | FNV-1a 32-bit compound key hashing across all input dimensions, `schemaVersion` check, 24-hour TTL expiry, and LRU eviction (cap: 50). | `src/utils/cache.ts` |
| **API Key Leakage** | Critical | Exposure of Gemini credentials in client-side bundles or source control | In-memory Bring-Your-Own-Key (BYOK) state only. Zero production bundle embedding verified by CI bundle scanner against `AIzaSy` patterns. | `src/services/gemini/client.ts`, `scripts/check-bundle-size.mjs` |
| **Cross-Site Scripting (XSS)** | High | Injection of malicious tags, Unicode bidi overrides, or zero-width payloads | `sanitizeUserText` with Unicode NFKC normalization, HTML tag stripping, ASCII control character removal, and Unicode bidi override filtering. | `src/utils/security.ts` |
| **Resource Exhaustion (DoS)** | Medium | Rapid successive invocations overwhelming network or browser resources | Sliding-window client rate limiter (10 calls/min) combined with dynamic dynamic code-split chunk loading. | `src/utils/security.ts`, `vite.config.ts` |
| **Data Loss / State Corruption** | High | Partial or malformed updates wiping user verified quotes or timeline flags | Immutable pure reducer state transitions with exhaustive discriminated union checking (`never` assertion) and Zod boundary validation. | `src/state/planReducer.ts`, `src/utils/schemas.ts` |

---

## Content Security Policy (CSP)
Production deployments on Firebase Hosting enforce the following policy headers:
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Reporting Vulnerabilities
To report a security issue, please contact the maintainers via security advisories on the public GitHub repository (`pranavg21/utsav-ai`). All reports will be triaged within 24 hours.
