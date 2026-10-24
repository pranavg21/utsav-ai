# Security Policy — UtsavAI

## 1. API Key Isolation
- The Gemini API key (`VITE_GEMINI_API_KEY`) is stored as a Vite environment variable and never committed to version control.
- `.env` and `.env.local` are listed in `.gitignore`.
- A runtime modal allows evaluators to paste a key without file access.

## 2. XSS Input Sanitization
- `src/utils/security.ts` exports `sanitizeUserText()` which strips `<script>` tags, all HTML tags, and ASCII control characters from user input before processing.
- All user-entered text (event names, must-haves, natural language prompts, vendor quote paste) is passed through this sanitizer.
- No use of `dangerouslySetInnerHTML` anywhere in the codebase.

## 3. Rate Limiting
- A client-side sliding-window rate limiter (`checkRateLimit()`) prevents excessive API calls.
- Default threshold: 10 calls per minute per action key.
- Protects against accidental rapid-fire Gemini API usage and tab-switching replay.

## 4. AI Assumption Guardrails
- Every budget row and vendor card displays a clear visual badge:
  - **`AI Estimate (Assumption)`** — amber badge for LLM-generated or deterministic estimates.
  - **`Verified Vendor Quote`** — emerald badge only when a user explicitly toggles confirmation.
- The system never fabricates live vendor availability or confirmed pricing.

## 5. Numeric Input Bounds
- `validateNumericBound()` clamps all numeric inputs to safe ranges, preventing negative budgets, impossibly large guest counts, or zero-day timelines.

## 6. Content Security Policy
- CSP meta tag in `index.html` restricts script sources to `'self'`, connect sources to the Gemini API domain, and font sources to Google Fonts.
