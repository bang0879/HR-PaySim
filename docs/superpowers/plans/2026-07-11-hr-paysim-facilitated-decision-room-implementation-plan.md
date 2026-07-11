# HR PaySim Facilitated Decision Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one verified Product Engineer decision-room vertical slice, then expand it into the canonical four-screen facilitated HR PaySim without exposing duplicate detector findings or inventing salary rules.

**Architecture:** Add metrics, themes, review, repeat, decision, report, and session modules alongside the current runtime. Prove the new path behind `/hr-paysim/decision-room-preview`, stop for comprehension review, then connect the remaining sample subjects, facilitator preparation, canonical routes, and portfolio evidence. Detectors observe; reviewed state drives conclusions and decisions.

**Tech Stack:** React 19.2, TypeScript 6.0, Vite 8.1, Node test runner, Playwright 1.61, in-memory browser state, no new dependencies.

## Global Constraints

- Four founder screens only: `금번 진단 안내`, `확인된 연봉 차이`, `앞으로 적용할 회사 기준`, `금번 진단 결과와 결정사항`.
- Kyle controls the keyboard and screen share; the founder reads, answers, and approves.
- Sample contract: 7 raw findings, 3 visible subjects, 0 duplicate headline pairs, Designer clean.
- No salary recommendation, market benchmark, attrition/productivity/legal prediction, aggregate hero score, AI headcount scenario, public SaaS, authentication, billing, or persistence.
- Raw paste and normalized rows stay in memory only; no browser storage, URL, telemetry, or server emission.
- A vague explanation never creates repeat parameters.
- Founder-facing copy never renders internal terms listed in the approved design.
- Do not remove old runtime code until the new vertical slice and migration gates pass.
- Every production task uses TDD and ends with focused tests plus lint, full tests, typecheck, and build.

## Branch And Migration Boundary

At execution time use `superpowers:using-git-worktrees`.

1. Preserve `8c159fb` on `codex/final-design-pixel-sync`.
2. Create `codex/facilitated-decision-room` from that commit.
3. Add the preview route without replacing current routes.
4. Stop after Task 9 for founder-comprehension review.
5. Switch canonical routes only in Task 12.
6. Verify repository lineage before any merge to `main`.

## Frozen Contracts

### GTM Minimum Restoration

- Equal pay across adjacent levels is allowed.
- A raw violation requires lower-rank pay to be strictly greater than higher-rank pay.
- A subject is material when one violation is at least `3_000_000` KRW or `5%` of the higher-rank salary.
- Once material, restore all strict violations upward-only.
- Each higher-rank row targets the maximum adjusted salary of all lower ranks.
- Count each row adjustment once.

```text
row_013 AE1 70M > row_012 AE2 66M -> row_012 +4M
row_013 AE1 70M > row_014 AE2 69M -> row_014 +1M
headlineGapKRW = 4M
pairRepairFloorKRW = 4M
systemRepairFloorKRW = 5M
```

### Product Engineer Observed Precedent

- Eligible: same role, tenure `<=24`, and exception or counteroffer flag.
- Eligible rows: `row_004`, `row_005`; facilitator selects `row_004` with `documented_hiring_exception`.
- Reference: recent unflagged same-role rows; fixture reference `row_006` at `88M`.
- Observed salary `95M`; observed additional amount `7M`.
- Synthetic row: `synthetic_product_engineer_next_hire`, salary `95M`, tenure `0`.
- Current roster pairs `10`; baseline candidate at `88M` pairs `3`, max gap `20M`; observed candidate pairs `3`, max gap `27M`; combined pairs `13`.
- Affected existing rows: `row_001`, `row_002`, `row_003`.
- Conclusion: `현재 확인된 9,500만 원 채용 사례를 같은 역할의 다음 경력직 채용에 한 번 더 적용하면, 기존 Product Engineer 3명과 1,900만~2,700만 원의 연봉 차이가 생깁니다.`
- Non-claim: `현재 확인된 채용 사례가 한 번 더 반복된다고 가정한 결과이며, 회사의 확정된 정책이나 다음 직원의 권장 연봉이 아닙니다.`

### Subject Selection

Order lexicographically by sufficient data, systematic pattern, normalized gap descending, pair count descending, then role group/theme ID. Kyle may override. Select at most three. Unselected items appear only as additional candidates and in the final `이번 세션에서 검토하지 않은 항목` section.

### 90-Second Demo

Use the real provider and components. Prefill Product Engineer explanation, evidence, precedent, and one decision with `샘플로 입력된 내용`. Keep Platform and GTM collapsed. Three clicks move Screen 1 -> 2 -> 3 -> 4. No auto-advance or fake prototype.

## Target File Map

```text
src/app/PaySimApp.tsx
src/app/PaySimRouter.ts
src/app/PaySimSessionProvider.tsx
src/features/session-introduction/SessionIntroductionScreen.tsx
src/features/confirmed-pay-differences/{ConfirmedPayDifferencesScreen,SalaryDistribution,EvidenceTable}.tsx
src/features/company-rule/CompanyRuleScreen.tsx
src/features/session-result/SessionResultScreen.tsx
src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx
src/features/decision-room/decisionRoom.css
src/lib/hr-paysim/metrics/{types,compensationMetrics}.ts
src/lib/hr-paysim/detectors/tenurePairs.ts
src/lib/hr-paysim/themes/{types,buildStructuralThemes,selectReviewSubjects}.ts
src/lib/hr-paysim/review/{types,updateThemeReview}.ts
src/lib/hr-paysim/repeat/{types,precedentSelection,observedPrecedentRepeat,founderBoundedRuleRepeat}.ts
src/lib/hr-paysim/decisions/{types,decisionRecords}.ts
src/lib/hr-paysim/report/{types,buildSessionReport}.ts
src/lib/hr-paysim/copy/{founderCopy,forbiddenFounderTerms}.ts
src/lib/hr-paysim/session/{types,decisionRoomReducer}.ts
src/lib/hr-paysim/contracts/demoContract.ts
tests/hr-paysim/fixtures/decision-room-expected.ts
scripts/qa-decision-room.mjs
```

---

### Task 1: Freeze Contract Fixtures

**Files:** Create `tests/hr-paysim/fixtures/decision-room-expected.ts`; create `tests/hr-paysim/decision-room-contract.test.ts`.

**Produces:** `DECISION_ROOM_EXPECTED`, used only by tests.

- [ ] Create the fixture:

```ts
export const DECISION_ROOM_EXPECTED = {
  sample: { rawFindingCount: 7, visibleSubjectCount: 3, duplicateHeadlinePairCount: 0, selectedRoleGroups: ["Product Engineer", "Platform Engineer", "GTM"], cleanRoleGroups: ["Designer"] },
  gtm: { headlineGapKRW: 4_000_000, pairRepairFloorKRW: 4_000_000, systemRepairFloorKRW: 5_000_000, adjustments: [{ rowId: "row_012", adjustmentKRW: 4_000_000 }, { rowId: "row_014", adjustmentKRW: 1_000_000 }] },
  productRepeat: { eligible: ["row_004", "row_005"], selected: "row_004", referenceRows: ["row_006"], referenceSalaryKRW: 88_000_000, repeatedSalaryKRW: 95_000_000, premiumKRW: 7_000_000, currentPairs: 10, baselineCandidatePairs: 3, repeatedCandidatePairs: 3, combinedPairs: 13, maximumGapKRW: 27_000_000, affected: ["row_001", "row_002", "row_003"] },
  selection: { maximum: 3, unselectedLabel: "이번 세션에서 검토하지 않은 항목" },
  demo: { screens: ["introduction", "confirmed_pay_differences", "company_rule", "session_result"], clicks: 3, expanded: "Product Engineer", collapsed: ["Platform Engineer", "GTM"], sampleLabel: "샘플로 입력된 내용" },
} as const;
```

- [ ] Test exact values, run `node --experimental-strip-types --test tests/hr-paysim/decision-room-contract.test.ts`, expect one pass.
- [ ] Commit:

```bash
git add tests/hr-paysim/fixtures/decision-room-expected.ts tests/hr-paysim/decision-room-contract.test.ts
git commit -m "test: freeze decision-room contracts"
```

### Task 2: Separate Metric Semantics

**Files:** Create metric files and `tests/hr-paysim/metric-semantics.test.ts`; modify `domain.ts`, `structuralFindings.ts`, and structural-finding tests.

**Produces:**

```ts
export interface OrdinalAdjustment { rowId: string; fromSalaryKRW: number; toSalaryKRW: number; adjustmentKRW: number; }
export interface SystemRepairResult { headlineGapKRW: number; pairRepairFloorKRW: number; systemRepairFloorKRW: number; adjustments: OrdinalAdjustment[]; }
export interface FindingMetricSet { headlineGapKRW?: number; pairRepairFloorKRW?: number; systemRepairFloorKRW?: number; roleGroupPayrollContextKRW?: number; nonClaim: string; }
```

- [ ] Write failing tests for GTM `4M/4M/5M`, equal-pay allowed, and one row adjustment satisfying multiple constraints.
- [ ] Run focused test; expect missing module.
- [ ] Implement:

```ts
export function calculateMinimumOrdinalRestoration(rows: NormalizedRosterRow[]): SystemRepairResult {
  const ranked = rows.filter((row) => row.levelRank !== undefined).sort((a, b) => a.levelRank! - b.levelRank! || a.rowId.localeCompare(b.rowId));
  const ranks = [...new Set(ranked.map((row) => row.levelRank!))].sort((a, b) => a - b);
  const adjustments: OrdinalAdjustment[] = [];
  let priorMaximum = Number.NEGATIVE_INFINITY;
  for (const rank of ranks) {
    const adjusted = ranked.filter((row) => row.levelRank === rank).map((row) => {
      const target = priorMaximum === Number.NEGATIVE_INFINITY ? row.baseSalaryKRW : Math.max(row.baseSalaryKRW, priorMaximum);
      if (target > row.baseSalaryKRW) adjustments.push({ rowId: row.rowId, fromSalaryKRW: row.baseSalaryKRW, toSalaryKRW: target, adjustmentKRW: target - row.baseSalaryKRW });
      return target;
    });
    priorMaximum = Math.max(priorMaximum, ...adjusted);
  }
  adjustments.sort((a, b) => a.rowId.localeCompare(b.rowId));
  const headline = Math.max(0, ...adjustments.map((item) => item.adjustmentKRW));
  return { headlineGapKRW: headline, pairRepairFloorKRW: headline, systemRepairFloorKRW: adjustments.reduce((sum, item) => sum + item.adjustmentKRW, 0), adjustments };
}
```

- [ ] Add `metrics: FindingMetricSet` to findings. Keep deprecated `correctionFloorKRW` only as an old-runtime bridge until Task 12; new modules cannot read it.
- [ ] Replace GTM generic-floor assertions with three metric assertions.
- [ ] Run focused tests and all four project commands; commit `feat: separate compensation metric semantics`.

### Task 3: Build Structural Themes

**Files:** Create detector helper, theme types/builder, and `structural-themes.test.ts`; modify `structuralFindings.ts`.

**Produces:**

```ts
export interface StructuralTheme {
  id: string; roleGroup: string; archetype: "emergent_structure" | "cohort_precedent" | "level_integrity" | "isolated_relationship";
  dataStatus: "sufficient" | "partial"; patternKind: "systematic" | "isolated"; findingIds: string[];
  headlinePair?: StructuralFindingPair; comparisonPairs: StructuralFindingPair[]; affectedRowIds: string[];
  supportingObservations: Array<{ sourceType: StructuralFindingType; plainLanguageKey: "two_salary_groups" | "recent_hire_gap_repeats" | "level_order_conflict"; affectedRowIds: string[] }>;
  metrics: FindingMetricSet; normalizedHeadlineGap: number;
}
```

- [ ] Extract `buildMaterialTenurePairs()` with the existing `0.08` material gap rate; prove existing detector output unchanged.
- [ ] Write failing tests for `7 -> 3`, Product/Platform merging, GTM separation, Designer clean, duplicate pair zero, disconnected graph separation, and input-order independence.
- [ ] Implement explicit rules: same role only; inversion/loyalty same headline or subset pairs; shadow attaches only when a material pair crosses clusters; level findings remain separate; no percentage-overlap clustering.
- [ ] Run focused tests and all four project commands; commit `feat: subsume findings into structural themes`.

### Task 4: Select Subjects And Model Review State

**Files:** Create `selectReviewSubjects.ts`, review types/updater, `review-subject-selection.test.ts`, and `theme-review.test.ts`.

**Produces:**

```ts
export type ExplanationBasis = "role_responsibility_difference" | "market_hiring_additional_pay" | "performance_or_scarce_skill" | "retention_exception" | "timing_context" | "founder_cannot_explain";
export type EvidenceStatus = "unanswered" | "documented" | "observable" | "leader_assertion_only" | "insufficient_data";
export type RepeatabilityStatus = "unanswered" | "reusable_rule" | "conditional_rule" | "one_time_exception" | "not_reusable" | "insufficient_data";
export interface ThemeReview { themeId: string; explanationBasis: ExplanationBasis | "unanswered"; evidenceStatus: EvidenceStatus; repeatabilityStatus: RepeatabilityStatus; outcome: "unanswered" | "explained_with_evidence" | "explained_without_documentation" | "one_time_exception" | "founder_cannot_explain" | "insufficient_data"; approvedSentenceKey?: ExplanationBasis; evidenceFollowUp?: EvidenceFollowUp; }
```

- [ ] Write selection tests for lexicographic order, maximum three, override order, and unselected retention.
- [ ] Implement `recommendReviewSubjectOrder()` and `selectReviewSubjects(themes, overrideIds?)` exactly from the frozen tuple.
- [ ] Write review tests proving `unanswered`, `founder_cannot_explain`, and `insufficient_data` remain distinct; changing explanation/evidence clears dependent repeat and decision state; serialized review contains no roster or free text.
- [ ] Implement `createThemeReview()` and `updateThemeReview()`; derive outcomes only from enums.
- [ ] Run focused tests/full tests/typecheck; commit `feat: add review subject and review state contracts`.

### Task 5: Select And Repeat The Product Engineer Precedent

**Files:** Create repeat types, precedent selection, observed repeat, and `observed-precedent-repeat.test.ts`.

**Produces:**

```ts
export interface ObservedPrecedentCandidate { sourceRowId: string; roleGroup: string; referenceRowIds: string[]; referenceSalaryKRW: number; observedSalaryKRW: number; additionalAmountKRW: number; }
export interface ObservedPrecedentSelection { candidate: ObservedPrecedentCandidate; reason: "documented_hiring_exception" | "documented_counteroffer" | "facilitator_selected_other"; }
export interface PrecedentRepeatResult { themeId: string; syntheticRow: NormalizedRosterRow; currentRosterPairCount: number; baselineCandidatePairCount: number; repeatedCandidatePairCount: number; combinedPairCount: number; maximumGapKRW: number; affectedRowIds: string[]; conclusionKey: "product_engineer_observed_hiring_repeat"; nonClaimKey: "observed_precedent_not_policy"; }
```

- [ ] Write failing exact fixture tests: eligible `004/005`; reference `006/88M`; selected `004/95M/+7M`; pair counts `10/3/3/13`; max `27M`; affected `001/002/003`; no automatic highest-salary selection.
- [ ] Implement eligibility and median reference from recent unflagged same-role rows. Return candidates only; require explicit selection.
- [ ] Implement synthetic row and reuse `buildMaterialTenurePairs()` for baseline/repeated graphs.
- [ ] Assert exact founder conclusion and non-claim keys; copy is resolved later, not generated inside the engine.
- [ ] Run focused tests and all four commands; commit `feat: repeat observed hiring precedent`.

### Task 6: Add Founder-Bounded Rule, Decisions, And Report

**Files:** Create bounded repeat, decisions, report modules; create corresponding three tests.

**Produces:**

```ts
export interface FounderBoundedHiringRule { themeId: string; roleGroup: string; trigger: "hard_to_fill_role" | "scarce_skill" | "approved_exception"; referenceSalaryKRW: number; additionalAmountKRW: number; maximumSalaryKRW: number; approverRole: "CEO" | "CEO_AND_HR"; reviewEvent: "BEFORE_NEXT_OFFER" | "BEFORE_NEXT_REVIEW"; }
export interface DecisionRecord { id: string; themeIds: string[]; actionKey: "define_hiring_additional_pay" | "review_long_tenure_pay" | "document_role_ranges" | "collect_evidence"; ownerRole: "CEO" | "HR" | "ROLE_LEAD" | "CEO_AND_HR"; dueEvent: "BEFORE_NEXT_OFFER" | "BEFORE_NEXT_REVIEW" | "WITHIN_TWO_WEEKS"; status: "draft" | "approved"; }
```

- [ ] Test missing parameters return `insufficient_parameters`, a zero additional amount reproduces the reference baseline, and a stricter cap never creates a higher synthetic salary.
- [ ] Implement salary as `Math.min(referenceSalaryKRW + additionalAmountKRW, maximumSalaryKRW)` only after every field is founder-approved.
- [ ] Test decisions contain owner/due event and report includes reviewed decisions plus unselected-subject appendix without inferred prose.
- [ ] Implement `buildSessionReport()` as a pure transformation of themes, reviews, repeat results, decisions, follow-ups, and unselected subjects.
- [ ] Run focused tests and all four commands; commit `feat: derive bounded rules and session report`.

### Task 7: Centralize Founder Copy And Lint It

**Files:** Create copy files and `founder-copy.test.ts`; modify `scripts/check-forbidden-copy.ts`.

**Produces:** `FOUNDER_COPY`, `FORBIDDEN_FOUNDER_TERMS`, `formatFounderAmount()`, and copy-key resolvers used by every new screen.

- [ ] Write tests that serialize every `FOUNDER_COPY` value and reject all forbidden terms; assert locked headings, Product Engineer conclusion, non-claims, empty state, insufficient-data state, recalculation state, and action-specific buttons.
- [ ] Implement copy as a typed constant object. Components may not hardcode core Korean conclusions or button labels.
- [ ] Change lint to scan copy values and quoted JSX strings rather than identifiers, avoiding false positives for internal type names.
- [ ] Run copy tests, lint, full tests, typecheck, build; commit `feat: centralize founder-facing copy`.

### Task 8: Create In-Memory Session, Preview Router, And Demo Contract

**Files:** Create session types/reducer, app provider/router, demo contract, and `decision-room-session.test.ts`; modify `App.tsx` and `appRoute.ts` only to add `/hr-paysim/decision-room-preview`.

**Produces:**

```ts
export type DecisionRoomScreen = "introduction" | "confirmed_pay_differences" | "company_rule" | "session_result";
export interface DecisionRoomSessionState { mode: "facilitated" | "demo"; screen: DecisionRoomScreen; rows: NormalizedRosterRow[]; themes: StructuralTheme[]; selection: ReviewSubjectSelection; activeThemeId?: string; reviews: Record<string, ThemeReview>; repeats: Record<string, PrecedentRepeatResult>; decisions: DecisionRecord[]; report?: SessionReportViewModel; }
```

- [ ] Test four-screen order, guarded transitions, active-subject switching without route changes, dependency invalidation, explicit end clearing every field, and JSON/browser-storage functions being absent.
- [ ] Implement reducer actions: `START_SESSION`, `SELECT_THEME`, `UPDATE_REVIEW`, `SET_REPEAT`, `APPROVE_DECISION`, `GO_TO_SCREEN`, `END_SESSION`.
- [ ] Implement demo factory with Product prefilled and two collapsed subjects, visibly marked sample state.
- [ ] Add preview route without removing old surfaces.
- [ ] Run route/session tests and all four commands; commit `feat: add decision-room session shell`.

### Task 9: Build The Product Engineer Four-Screen Vertical Slice

**Files:** Create the four feature screens, distribution/evidence components, CSS, and `scripts/qa-decision-room.mjs`.

**Consumes:** Session provider, Product theme/review/repeat/report, founder copy.

- [ ] Build Screen 1 with scope, non-claims, three outputs, duration, and one action.
- [ ] Build Screen 2 in this DOM order: concrete conclusion, salary distribution, highlighted pair, supporting observations, explanation choices, conditional evidence question, compact evidence table, next action. Use Employee A/B labels, never row IDs.
- [ ] Build Screen 3 with selected explanation/evidence, observed repeat, missing rule conditions, bounded-rule fields, decision choice, owner, due event, and next action.
- [ ] Build Screen 4 with executive summary, reviewed record table, non-claims, next-offer/review actions, copy action, and end-session action.
- [ ] Implement focus movement to the conclusion heading after screen/subject changes; no modal; one primary action per screen.
- [ ] Add Playwright assertions for four screens, three-click demo, no forbidden visible terms, focus, keyboard completion, console clean, 1280x720 and 1440x900 overflow, and 390px reflow.
- [ ] Run the QA script plus all four commands.
- [ ] **STOP GATE:** show Screen 2 to a non-HR participant; they must state within five seconds what is compared, the observed difference, and the requested response. Record wording failures before Task 10.
- [ ] Commit `feat: build Product Engineer decision-room slice` only after the gate passes.

### Task 10: Connect Platform, GTM, And Designer Clean State

**Files:** Modify screen view models/components; create `remaining-subjects.test.ts`; extend browser QA.

- [ ] Test three selected subjects, no duplicate headline pair, Product/Platform/GTM in-place switching, GTM `4M/4M/5M`, Designer clean statement, and unselected appendix.
- [ ] Add at most two plain-Korean supporting observations per integrated subject; never render detector labels.
- [ ] Keep the same four routes/screens; subject switching is state only.
- [ ] Run focused tests, browser QA, and all four commands; commit `feat: connect remaining decision-room subjects`.

### Task 11: Add Facilitator Preparation And Privacy Lifecycle

**Files:** Create preparation screen and test; modify `rosterParser.ts`, provider/router, and `App.tsx` to add `/hr-paysim/session/new` while retaining preview and old routes.

- [ ] Test empty, PII header, PII value, blocked row, normalized confirmation, maximum-three override, and successful parse clearing raw React state immediately.
- [ ] Test personal values never echo; only safe header names and row numbers appear.
- [ ] Test no localStorage/sessionStorage/URL/server use and explicit session end clears rows/reviews/repeats/decisions/report.
- [ ] Implement preparation -> confirm -> start session; warn that refresh resets the session.
- [ ] Run privacy tests, browser QA, and all four commands; commit `feat: add facilitated roster preparation`.

### Task 12: Converge Runtime And Produce Portfolio Evidence

**Files:** Modify canonical app/router/tests; delete obsolete runtime TS components/routes/session tests only after replacement; retain every `prototypes/**` reference. Create:

- `docs/hr-paysim/22_methodology_note.md`
- `docs/hr-paysim/23_sample_founder_result.md`
- `docs/hr-paysim/24_privacy_and_non_claims.md`
- `docs/hr-paysim/25_algorithm_and_qa_appendix.md`

- [ ] Verify branch lineage with `git merge-base main HEAD`; if none, stop and document the integration path before changing routes.
- [ ] Route `/hr-paysim/demo`, `/hr-paysim/session/new`, and `/hr-paysim/session` to one `PaySimApp` and one provider.
- [ ] Remove prototype/roster runtime switching and old nine-step production routes; do not delete static prototypes.
- [ ] Remove deprecated `correctionFloorKRW`, legacy CEI/CED/session/scenario runtime types, and tests only after `rg` proves no canonical import remains.
- [ ] Write the four portfolio documents with method, fixed fixture math, privacy/non-claims, commands, screenshots, known limits, and pilot method. Do not claim pilot outcomes that have not occurred.
- [ ] Run final verification:

```bash
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
```

- [ ] Record changed files, test count, command outputs, known limitations, and gate status in the QA appendix.
- [ ] Commit `feat: converge HR PaySim decision-room runtime`.

## Review Checkpoints

- After Task 2: metric meaning and GTM math review.
- After Task 3: `7 -> 3` theme contract review.
- After Task 5: Product Engineer repeat fixture review.
- After Task 9: mandatory founder-comprehension stop.
- After Task 11: privacy lifecycle review.
- After Task 12: final code review before any merge.

## First Work Package

Execute Tasks 1-3 only:

```text
freeze fixtures -> separate metric semantics -> build structural themes
```

This package changes engine contracts and tests, not the founder-facing production route. Its completion gate is exact GTM math plus deterministic `7 raw findings -> 3 structural themes -> 0 duplicate visible headline pairs`.

## Known Technical Risks

- Existing Korean source copy contains encoding corruption; new copy must be UTF-8 constants and old copy must not be reused.
- `StructuralFinding` needs a temporary metric compatibility bridge until runtime convergence.
- Theme pair-component logic can accidentally merge disconnected issues; separation and order-independence fixtures are mandatory.
- The Product Engineer baseline and observed candidate both create three candidate comparisons; the meaningful fixture change is maximum gap `20M -> 27M`, not an invented increase in pair count.
- Browser refresh intentionally resets v1 sessions; the preparation warning and leave confirmation are required.
- Main-branch lineage remains a merge-time risk and is deliberately deferred to the final convergence gate.

## Stop Point

Do not begin production implementation until this plan is reviewed and approved. After approval, create the isolated worktree and execute Tasks 1-3 as the first bounded work package.
