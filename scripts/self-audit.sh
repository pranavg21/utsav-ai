#!/usr/bin/env bash
set -e

echo "=== 1. FORBIDDEN ESCAPES ==="
grep -rnE 'eslint-disable|@ts-ignore|@ts-expect-error|: any\b|as any|<any>' src || echo CLEAN
grep -rnE '[A-Za-z0-9_)\]]!\.|[A-Za-z0-9_)\]]!;|[A-Za-z0-9_)\]]!\)' src --include=*.ts --include=*.tsx || echo CLEAN
grep -rn " as " src --include=*.ts --include=*.tsx | grep -v "as const" | grep -v typedKeys || echo CLEAN

echo "=== 2. DISABLED OR HOLLOW TESTS ==="
grep -rnE '\.(skip|only|todo)\(|xit\(|xdescribe\(' src || echo CLEAN
for f in $(find src -name '*.test.ts' -o -name '*.test.tsx'); do
  n=$(grep -c "expect(" "$f" || true)
  [ "$n" -eq 0 ] && echo "NO EXPECT: $f"
done
echo -n "Total toBeTruthy / toBeDefined count: "
grep -rnE 'toBeTruthy\(\)|toBeDefined\(\)' src/__tests__ | wc -l

echo "=== 3. TEST COUNT & INTEGRITY ==="
npx vitest run 2>&1 | grep -E "Test Files|Tests"
git diff --stat origin/main -- src/__tests__ | tail -3 || true

echo "=== 4. FILE SIZE AND LINE LIMIT (<=150) ==="
find src -name '*.ts' -o -name '*.tsx' -exec wc -l {} + | sort -n | tail -5
awk 'length > 140 {print FILENAME ":" FNR ": length=" length}' $(find src -name '*.ts' -o -name '*.tsx') | head -5 || echo "None > 140 characters"

echo "=== 5. LEFTOVER DUPLICATES ==="
ls src/services/geminiPlannerService.ts src/services/budgetTradeoffEngine.ts src/services/scenarioBuilder.ts 2>/dev/null || echo "CLEAN: Zero duplicate legacy service facades found."

echo "=== 6. THRESHOLDS UNTOUCHED ==="
grep -nE "statements|branches|functions|lines" vite.config.ts
grep -n "max-lines" eslint.config.mjs

echo "=== 7. RUNTIME VALIDATION ACTUALLY SHIPPED ==="
npm run build >/dev/null 2>&1
echo -n "Total safeParse occurrences in dist: "
grep -o "safeParse" dist/assets/*.js | wc -l

echo "=== 8. REPO SIZE AND HYGIENE ==="
du -sh --exclude=node_modules --exclude=.git --exclude=dist --exclude=coverage .
git ls-files | grep -E "node_modules|dist/|coverage/|\.env$" || echo "CLEAN: No ignored binaries or secrets tracked."
