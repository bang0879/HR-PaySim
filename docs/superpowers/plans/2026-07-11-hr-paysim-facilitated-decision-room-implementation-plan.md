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
- Interpretation status is assigned per `InterpretationStatement`, never once for an entire claim container.
- External, client-data, and practitioner-experience sources use the structured variants in the canonical design.
- Derived claim, repeat, decision, and report state is invalidated before rendering after an explanation or `EvidenceStatus` change.
- Public builds exclude both facilitator routes; facilitator builds require an approved deployment access gate. `noindex` is verified separately and never treated as authentication.
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
src/lib/hr-paysim/interpretation/{types,claimRegistry,validateInterpretationClaims,resolveStatements}.ts
src/lib/hr-paysim/repeat/{types,precedentSelection,observedPrecedentRepeat,founderBoundedRuleRepeat}.ts
src/lib/hr-paysim/decisions/{types,decisionRecords}.ts
src/lib/hr-paysim/report/{types,buildSessionReport}.ts
src/lib/hr-paysim/copy/{founderCopy,forbiddenFounderTerms}.ts
src/lib/hr-paysim/session/{types,decisionRoomReducer}.ts
src/lib/hr-paysim/access/{runtimeSurface,routePolicy}.ts
src/lib/hr-paysim/contracts/demoContract.ts
scripts/{verify-route-exposure,verify-facilitator-deployment}.mjs
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

### Task 4A: Add Statement-Level Interpretation Claims

**Files:**
- Create: `src/lib/hr-paysim/interpretation/types.ts`
- Create: `src/lib/hr-paysim/interpretation/claimRegistry.ts`
- Create: `src/lib/hr-paysim/interpretation/validateInterpretationClaims.ts`
- Create: `tests/hr-paysim/interpretation-claims.test.ts`

**Consumes:** `StructuralTheme`, `ThemeReview`, detector evidence IDs, and reviewed-state IDs from Tasks 3–4.

**Produces:** `InterpretationClaim`, `InterpretationStatement`, `ClaimSourceRef`, `validateInterpretationClaim()`, and a typed `INTERPRETATION_CLAIM_REGISTRY` used by copy, report, and session tasks.

- [ ] **Step 1: Write the failing atomic-status and source-validation tests**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { validateInterpretationClaim } from "../../src/lib/hr-paysim/interpretation/validateInterpretationClaims.ts";
import type { InterpretationClaim } from "../../src/lib/hr-paysim/interpretation/types.ts";

const claim: InterpretationClaim = {
  id: "product-hiring-premium",
  themeId: "theme-product",
  statements: [
    { id: "salary-fact", kind: "SURFACE_OBSERVATION", copyKey: "product.salary_fact", claimStatus: "SUPPORTED_BY_CLIENT_DATA", triggerEvidenceIds: ["pair-001"], reviewDependencyIds: ["review-product"], sourceRefs: [{ kind: "CLIENT_DATA", evidenceIds: ["pair-001"], reviewedStateIds: ["review-product"] }], mustNotClaimKeys: ["employee_intent"] },
    { id: "premium-hypothesis", kind: "DEEPER_MECHANISM", copyKey: "product.premium_hypothesis", claimStatus: "WORKING_HYPOTHESIS", triggerEvidenceIds: ["pair-001"], reviewDependencyIds: ["review-product"], sourceRefs: [], mustNotClaimKeys: ["confirmed_cause"] },
  ],
  founderQuestion: { copyKey: "product.premium_question", supportingStatementIds: ["salary-fact", "premium-hypothesis"] },
};

test("one claim preserves different statement statuses", () => {
  const result = validateInterpretationClaim(claim, { evidenceIds: new Set(["pair-001"]), reviewedStateIds: new Set(["review-product"]) });
  assert.deepEqual(result, []);
  assert.deepEqual(claim.statements.map((item) => item.claimStatus), ["SUPPORTED_BY_CLIENT_DATA", "WORKING_HYPOTHESIS"]);
});

test("external claims require structured date, scope, and applicability", () => {
  const invalid = structuredClone(claim);
  invalid.statements[1] = { ...invalid.statements[1], claimStatus: "VERIFIED_EXTERNAL", sourceRefs: [] };
  assert.match(validateInterpretationClaim(invalid, { evidenceIds: new Set(["pair-001"]), reviewedStateIds: new Set(["review-product"]) }).join(" "), /EXTERNAL_SOURCE_REQUIRED/);
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```powershell
node --experimental-strip-types --test tests/hr-paysim/interpretation-claims.test.ts
```

Expected: FAIL because the interpretation modules do not exist.

- [ ] **Step 3: Define the canonical statement and source types**

```ts
export type InterpretationClaimStatus = "VERIFIED_EXTERNAL" | "SUPPORTED_BY_CLIENT_DATA" | "KYLE_EXPERIENCE_BASED" | "WORKING_HYPOTHESIS" | "UNSUPPORTED_DO_NOT_USE";
export type InterpretationStatementKind = "SURFACE_OBSERVATION" | "TYPICAL_INTERPRETATION" | "DEEPER_MECHANISM" | "TIME_AXIS_OR_CASCADE" | "COUNTER_INTUITIVE_ANGLE" | "DECISION_RELEVANCE";
export interface ExternalClaimSource { kind: "EXTERNAL"; title: string; publisher: string; publishedAt: string; sourceLocation: string; populationOrScope: string; applicabilityNote: string; }
export interface ClientDataClaimSource { kind: "CLIENT_DATA"; evidenceIds: string[]; reviewedStateIds: string[]; }
export interface PractitionerExperienceSource { kind: "PRACTITIONER_EXPERIENCE"; experienceRef: string; context: string; limitation: string; }
export type ClaimSourceRef = ExternalClaimSource | ClientDataClaimSource | PractitionerExperienceSource;
export interface InterpretationStatement { id: string; kind: InterpretationStatementKind; copyKey: string; claimStatus: InterpretationClaimStatus; triggerEvidenceIds: string[]; reviewDependencyIds: string[]; sourceRefs: ClaimSourceRef[]; mustNotClaimKeys: string[]; }
export interface InterpretationClaim { id: string; themeId: string; statements: InterpretationStatement[]; founderQuestion: { copyKey: string; supportingStatementIds: string[] }; }
```

- [ ] **Step 4: Implement fail-closed validation**

```ts
export interface ClaimValidationContext { evidenceIds: ReadonlySet<string>; reviewedStateIds: ReadonlySet<string>; }
export function validateInterpretationClaim(claim: InterpretationClaim, context: ClaimValidationContext): string[] {
  const errors: string[] = [];
  const statementIds = new Set(claim.statements.map((item) => item.id));
  for (const id of claim.founderQuestion.supportingStatementIds) if (!statementIds.has(id)) errors.push(`QUESTION_STATEMENT_NOT_FOUND:${id}`);
  for (const statement of claim.statements) {
    for (const id of statement.triggerEvidenceIds) if (!context.evidenceIds.has(id)) errors.push(`EVIDENCE_NOT_FOUND:${statement.id}:${id}`);
    for (const id of statement.reviewDependencyIds) if (!context.reviewedStateIds.has(id)) errors.push(`REVIEW_NOT_FOUND:${statement.id}:${id}`);
    const external = statement.sourceRefs.filter((source) => source.kind === "EXTERNAL");
    const client = statement.sourceRefs.filter((source) => source.kind === "CLIENT_DATA");
    const practitioner = statement.sourceRefs.filter((source) => source.kind === "PRACTITIONER_EXPERIENCE");
    if (statement.claimStatus === "VERIFIED_EXTERNAL" && external.length === 0) errors.push(`EXTERNAL_SOURCE_REQUIRED:${statement.id}`);
    if (statement.claimStatus === "SUPPORTED_BY_CLIENT_DATA" && client.length === 0) errors.push(`CLIENT_SOURCE_REQUIRED:${statement.id}`);
    if (statement.claimStatus === "KYLE_EXPERIENCE_BASED" && practitioner.length === 0) errors.push(`PRACTITIONER_SOURCE_REQUIRED:${statement.id}`);
  }
  return errors;
}
```

Validate non-empty `title`, `publisher`, `publishedAt`, `sourceLocation`, `populationOrScope`, `applicabilityNote`, `experienceRef`, `context`, and `limitation`; validate every client source ID against the same context sets. Return errors rather than dropping invalid statements silently.

- [ ] **Step 5: Create only PaySim-authorized registry entries**

Create `INTERPRETATION_CLAIM_REGISTRY` for the three fixed sample themes. Do not import or transcribe the twelve HR Prism cards. Start with factual `SURFACE_OBSERVATION` statements and explicitly labeled `WORKING_HYPOTHESIS` questions; add no external or practitioner statement without a complete structured source.

- [ ] **Step 6: Run focused and project verification**

```powershell
node --experimental-strip-types --test tests/hr-paysim/interpretation-claims.test.ts
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Expected: focused tests pass and all project commands exit `0`.

- [ ] **Step 7: Commit**

```powershell
git add src/lib/hr-paysim/interpretation tests/hr-paysim/interpretation-claims.test.ts
git commit -m "feat: add statement-level interpretation claims"
```

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
- [ ] Add `InterpretationClaim[]` and a validated-statement resolver input to `buildSessionReport()`. The report builder receives already validated claims and never reads the registry directly.

```ts
export interface BuildSessionReportInput {
  themes: StructuralTheme[];
  reviews: Record<string, ThemeReview>;
  validatedClaims: InterpretationClaim[];
  repeatResults: Record<string, PrecedentRepeatResult>;
  decisions: DecisionRecord[];
  followUps: EvidenceFollowUp[];
  unselectedSubjects: StructuralTheme[];
}
```

- [ ] Write `tests/hr-paysim/report-claim-derivation.test.ts` proving the confirmed-result columns contain only allowed statements, `WORKING_HYPOTHESIS` appears only as a follow-up, and `KYLE_EXPERIENCE_BASED` never enters confirmed content.
- [ ] Make `buildSessionReport()` a pure transformation of `BuildSessionReportInput`; it returns copy keys and statement IDs, not untracked generated prose.

- [ ] Run focused tests and all four commands; commit `feat: derive bounded rules and session report`.

### Task 7: Centralize Founder Copy And Validate Claim Destinations

**Files:**
- Create: `src/lib/hr-paysim/copy/founderCopy.ts`
- Create: `src/lib/hr-paysim/copy/forbiddenFounderTerms.ts`
- Create: `src/lib/hr-paysim/interpretation/resolveStatements.ts`
- Create: `tests/hr-paysim/founder-copy.test.ts`
- Create: `tests/hr-paysim/claim-rendering.test.ts`
- Modify: `scripts/check-forbidden-copy.ts`

**Consumes:** `InterpretationClaim[]` and validated source records from Task 4A.

**Produces:** `FOUNDER_COPY`, `FORBIDDEN_FOUNDER_TERMS`, `ClaimDestination`, `resolveStatementsForDestination()`, `formatFounderAmount()`, and copy-key resolvers used by every new screen and report.

- [ ] **Step 1: Write failing destination-matrix tests**

```ts
const destinations = ["SCREEN_2_EVIDENCE", "SCREEN_3_REVIEW_PERSPECTIVE", "SCREEN_4_CONFIRMED", "SCREEN_4_FOLLOW_UP", "FACILITATOR_GUIDE", "METHODOLOGY", "EXPORT_CONFIRMED", "EXPORT_FOLLOW_UP"] as const;

test("practitioner experience never enters confirmed result areas", () => {
  assert.deepEqual(resolveStatementsForDestination([kyleStatement], "SCREEN_4_CONFIRMED"), []);
  assert.deepEqual(resolveStatementsForDestination([kyleStatement], "EXPORT_CONFIRMED"), []);
  assert.equal(resolveStatementsForDestination([kyleStatement], "FACILITATOR_GUIDE").length, 1);
});

test("external context alone cannot confirm a client mechanism", () => {
  assert.deepEqual(resolveStatementsForDestination([externalMechanismWithoutClientSource], "SCREEN_4_CONFIRMED"), []);
});

test("working hypotheses remain questions or follow-ups", () => {
  assert.deepEqual(resolveStatementsForDestination([hypothesis], "SCREEN_4_CONFIRMED"), []);
  assert.equal(resolveStatementsForDestination([hypothesis], "SCREEN_4_FOLLOW_UP").length, 1);
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

```powershell
node --experimental-strip-types --test tests/hr-paysim/claim-rendering.test.ts
```

Expected: FAIL because `resolveStatementsForDestination()` does not exist.

- [ ] **Step 3: Implement the fail-closed destination matrix**

```ts
export type ClaimDestination = "SCREEN_2_EVIDENCE" | "SCREEN_3_REVIEW_PERSPECTIVE" | "SCREEN_4_CONFIRMED" | "SCREEN_4_FOLLOW_UP" | "FACILITATOR_GUIDE" | "METHODOLOGY" | "EXPORT_CONFIRMED" | "EXPORT_FOLLOW_UP";

export function resolveStatementsForDestination(statements: InterpretationStatement[], destination: ClaimDestination): InterpretationStatement[] {
  return statements.filter((statement) => {
    if (statement.claimStatus === "UNSUPPORTED_DO_NOT_USE") return false;
    if (statement.claimStatus === "WORKING_HYPOTHESIS") return destination === "SCREEN_4_FOLLOW_UP" || destination === "EXPORT_FOLLOW_UP" || destination === "SCREEN_3_REVIEW_PERSPECTIVE";
    if (statement.claimStatus === "KYLE_EXPERIENCE_BASED") return destination === "FACILITATOR_GUIDE" || destination === "METHODOLOGY" || destination === "SCREEN_3_REVIEW_PERSPECTIVE";
    if (statement.claimStatus === "VERIFIED_EXTERNAL") return destination === "METHODOLOGY" || destination === "FACILITATOR_GUIDE" || destination === "SCREEN_3_REVIEW_PERSPECTIVE";
    if (statement.claimStatus !== "SUPPORTED_BY_CLIENT_DATA") return false;
    if (statement.kind !== "SURFACE_OBSERVATION") return false;
    return destination === "SCREEN_2_EVIDENCE" || destination === "SCREEN_4_CONFIRMED" || destination === "EXPORT_CONFIRMED";
  });
}
```

The confirmed-result destinations accept only client-data statements that do not assert a mechanism, cascade, counter-intuitive interpretation, causality, or employee intent. Do not weaken this matrix inside a component.

- [ ] **Step 4: Centralize and validate copy keys**

Serialize every `FOUNDER_COPY` value and reject forbidden terms. Assert locked headings, Product Engineer conclusion, non-claims, empty state, insufficient-data state, recalculation state, action-specific buttons, and all copy keys referenced by claim statements and founder questions.

- [ ] **Step 5: Update forbidden-copy scanning**

Scan copy values and quoted JSX strings rather than identifiers. Add a test proving internal type names are allowed in source while the same words fail when present in rendered copy.

- [ ] **Step 6: Run copy, rendering, and project verification**

```powershell
node --experimental-strip-types --test tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/claim-rendering.test.ts
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Expected: all commands exit `0`.

- [ ] **Step 7: Commit**

```powershell
git add src/lib/hr-paysim/copy src/lib/hr-paysim/interpretation/resolveStatements.ts tests/hr-paysim/founder-copy.test.ts tests/hr-paysim/claim-rendering.test.ts scripts/check-forbidden-copy.ts
git commit -m "feat: validate interpretation copy destinations"
```

### Task 8: Create In-Memory Session, Dependency Invalidation, Preview Router, And Demo Contract

**Files:**
- Create: `src/lib/hr-paysim/session/types.ts`
- Create: `src/lib/hr-paysim/session/decisionRoomReducer.ts`
- Create: `src/app/PaySimSessionProvider.tsx`
- Create: `src/lib/hr-paysim/contracts/demoContract.ts`
- Create: `tests/hr-paysim/decision-room-session.test.ts`
- Create: `tests/hr-paysim/dependency-invalidation.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/routes/hr-paysim/appRoute.ts`

**Consumes:** review state, interpretation claims, repeat results, decisions, and report inputs from Tasks 4–7.

**Produces:** one in-memory `DecisionRoomSessionState`, `invalidateThemeDerivations()`, guarded four-screen transitions, and a preview/demo contract.

```ts
export type DecisionRoomScreen = "introduction" | "confirmed_pay_differences" | "company_rule" | "session_result";
export interface DecisionRoomSessionState {
  mode: "facilitated" | "demo";
  screen: DecisionRoomScreen;
  rows: NormalizedRosterRow[];
  themes: StructuralTheme[];
  selection: ReviewSubjectSelection;
  activeThemeId?: string;
  reviews: Record<string, ThemeReview>;
  interpretations: Record<string, InterpretationClaim>;
  repeats: Record<string, PrecedentRepeatResult>;
  decisions: DecisionRecord[];
  report?: SessionReportViewModel;
}
```

- [ ] **Step 1: Write the full dependency-invalidation integration test**

```ts
test("changing explanation or EvidenceStatus removes every stale derivative before render", () => {
  const populated = fixtureSession({ explanation: "market_hiring_additional_pay", evidenceStatus: "documented", withInterpretation: true, withRepeat: true, withDecision: true, withReport: true });
  const changed = decisionRoomReducer(populated, { type: "UPDATE_REVIEW", themeId: "theme-product", patch: { explanationBasis: "timing_context", evidenceStatus: "leader_assertion_only" } });
  assert.equal(changed.interpretations["theme-product"], undefined);
  assert.equal(changed.repeats["theme-product"], undefined);
  assert.equal(changed.decisions.some((item) => item.themeIds.includes("theme-product")), false);
  assert.equal(changed.report, undefined);
  assert.doesNotMatch(JSON.stringify(changed), /product\.premium_hypothesis|observed_precedent_not_policy|define_hiring_additional_pay/);
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

```powershell
node --experimental-strip-types --test tests/hr-paysim/dependency-invalidation.test.ts
```

Expected: FAIL because the session reducer and invalidation helper do not exist.

- [ ] **Step 3: Implement fail-closed invalidation before review mutation**

```ts
export function invalidateThemeDerivations(state: DecisionRoomSessionState, themeId: string): DecisionRoomSessionState {
  const { [themeId]: _claim, ...interpretations } = state.interpretations;
  const { [themeId]: _repeat, ...repeats } = state.repeats;
  return { ...state, interpretations, repeats, decisions: state.decisions.filter((item) => !item.themeIds.includes(themeId)), report: undefined };
}
```

`UPDATE_REVIEW` calls `invalidateThemeDerivations()` before applying any `explanationBasis` or `evidenceStatus` change. UI selectors render no pending derivative until validation and recalculation repopulate it.

- [ ] **Step 4: Test session navigation and lifecycle**

Test four-screen order, guarded transitions, active-subject switching without route changes, explicit end clearing every field, and the absence of JSON/browser-storage persistence helpers.

- [ ] **Step 5: Implement reducer and demo contract**

Implement `START_SESSION`, `SELECT_THEME`, `UPDATE_REVIEW`, `SET_INTERPRETATIONS`, `SET_REPEAT`, `APPROVE_DECISION`, `GO_TO_SCREEN`, and `END_SESSION`. Prefill Product Engineer explanation, evidence, precedent, and one decision only in the visibly labeled synthetic demo.

- [ ] **Step 6: Add the preview route without removing old surfaces**

Add `/hr-paysim/decision-room-preview`. Route access for final `/demo` and `/session` paths remains Task 11/12 work.

- [ ] **Step 7: Run session, invalidation, and project verification**

```powershell
node --experimental-strip-types --test tests/hr-paysim/decision-room-session.test.ts tests/hr-paysim/dependency-invalidation.test.ts
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Expected: all commands exit `0`; old claim copy, repeat results, decision sentences, and export copy are absent after the dependency change.

- [ ] **Step 8: Commit**

```powershell
git add src/lib/hr-paysim/session src/app/PaySimSessionProvider.tsx src/lib/hr-paysim/contracts/demoContract.ts src/App.tsx src/routes/hr-paysim/appRoute.ts tests/hr-paysim/decision-room-session.test.ts tests/hr-paysim/dependency-invalidation.test.ts
git commit -m "feat: invalidate decision-room derived state"
```

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

### Task 11: Add Facilitator Preparation, Privacy Lifecycle, And Route Access

**Files:**
- Create: `src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx`
- Create: `src/lib/hr-paysim/access/runtimeSurface.ts`
- Create: `src/lib/hr-paysim/access/routePolicy.ts`
- Create: `tests/hr-paysim/facilitator-preparation.test.ts`
- Create: `tests/hr-paysim/route-access.test.ts`
- Create: `scripts/verify-route-exposure.mjs`
- Create: `scripts/verify-facilitator-deployment.mjs`
- Modify: `scripts/qa-decision-room.mjs`
- Modify: `src/lib/hr-paysim/rosterParser.ts`
- Modify: `src/app/PaySimSessionProvider.tsx`
- Modify: `src/app/PaySimRouter.ts`
- Modify: `src/App.tsx`
- Modify: `index.html`

**Consumes:** the in-memory provider and router from Task 8.

**Produces:** facilitator preparation, two protected-or-excluded operational routes, a synthetic-only demo route, independent `noindex` verification, and fail-closed deployment checks without client-side secrets.

- [ ] **Step 1: Write failing route policy tests**

```ts
test("public demo surface excludes both facilitator routes", () => {
  assert.equal(routeAllowed("/hr-paysim/demo", "PUBLIC_DEMO"), true);
  assert.equal(routeAllowed("/hr-paysim/session/new", "PUBLIC_DEMO"), false);
  assert.equal(routeAllowed("/hr-paysim/session", "PUBLIC_DEMO"), false);
});

test("facilitator surface includes two operational routes", () => {
  assert.equal(routeAllowed("/hr-paysim/session/new", "FACILITATOR"), true);
  assert.equal(routeAllowed("/hr-paysim/session", "FACILITATOR"), true);
});
```

- [ ] **Step 2: Run the focused route test and verify it fails**

```powershell
node --experimental-strip-types --test tests/hr-paysim/route-access.test.ts
```

Expected: FAIL because access modules do not exist.

- [ ] **Step 3: Implement build-surface route exclusion**

```ts
export type RuntimeSurface = "PUBLIC_DEMO" | "FACILITATOR";
export const runtimeSurface: RuntimeSurface = import.meta.env.VITE_PAYSIM_SURFACE === "FACILITATOR" ? "FACILITATOR" : "PUBLIC_DEMO";
export function routeAllowed(pathname: string, surface: RuntimeSurface): boolean {
  if (pathname === "/hr-paysim/demo") return true;
  if (pathname === "/hr-paysim/session/new" || pathname === "/hr-paysim/session") return surface === "FACILITATOR";
  return false;
}
```

The public build returns not-found for both facilitator paths. The facilitator build is deployed only behind provider-level deployment protection or a private network; this client enum is not authentication.

- [ ] **Step 4: Add a server-side build gate without exposing a secret**

Create `scripts/verify-facilitator-deployment.mjs`:

```js
const surface = process.env.PAYSIM_BUILD_SURFACE ?? "public_demo";
const gate = process.env.PAYSIM_FACILITATOR_ACCESS_GATE;
if (surface === "facilitator" && !["deployment_protection", "private_network"].includes(gate ?? "")) {
  console.error("Facilitator build requires approved deployment protection or a private network.");
  process.exit(1);
}
if (Object.keys(process.env).some((key) => key.startsWith("VITE_") && key.includes("SECRET"))) process.exit(1);
```

`PAYSIM_FACILITATOR_ACCESS_GATE` is consumed only by the Node verification script. Never expose it through `VITE_*`, URLs, browser storage, or telemetry.

- [ ] **Step 5: Add independent discovery and access checks**

Keep `<meta name="robots" content="noindex,nofollow" />` in v1. Create `verify-route-exposure.mjs` for the discovery check:

```js
import { readFileSync } from "node:fs";
const html = readFileSync("dist/index.html", "utf8");
if (!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
  console.error("Public demo build must retain noindex.");
  process.exit(1);
}
console.log("route discovery check passed");
```

Independently extend `qa-decision-room.mjs` to navigate directly to `/hr-paysim/session/new` and `/hr-paysim/session` in a `PUBLIC_DEMO` build and assert the not-found surface renders without facilitator preparation, roster input, or session headings. The noindex assertion must not satisfy the access assertion.

- [ ] **Step 6: Implement facilitator preparation and privacy lifecycle**

Test empty input, PII header, PII value, blocked row, normalized confirmation, maximum-three override, successful parse clearing raw React state immediately, safe row-number errors, no browser storage/URL/server emission, and explicit session end clearing rows/reviews/interpretations/repeats/decisions/report.

- [ ] **Step 7: Run public and facilitator route verification**

```powershell
$env:VITE_PAYSIM_SURFACE='PUBLIC_DEMO'
npm.cmd run build
node scripts/verify-route-exposure.mjs
node scripts/qa-decision-room.mjs
$env:VITE_PAYSIM_SURFACE='FACILITATOR'
$env:PAYSIM_BUILD_SURFACE='facilitator'
$env:PAYSIM_FACILITATOR_ACCESS_GATE='deployment_protection'
node scripts/verify-facilitator-deployment.mjs
npm.cmd run build
node --experimental-strip-types --test tests/hr-paysim/facilitator-preparation.test.ts tests/hr-paysim/route-access.test.ts
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
```

Expected: the public build exposes only the synthetic demo, both operational paths are absent, the facilitator preflight passes only with an approved external gate, and all tests pass.

- [ ] **Step 8: Commit**

```powershell
git add src/features/facilitator-preparation src/lib/hr-paysim/access src/lib/hr-paysim/rosterParser.ts src/app/PaySimSessionProvider.tsx src/app/PaySimRouter.ts src/App.tsx index.html tests/hr-paysim/facilitator-preparation.test.ts tests/hr-paysim/route-access.test.ts scripts/verify-route-exposure.mjs scripts/verify-facilitator-deployment.mjs
git commit -m "feat: protect facilitator routes and roster lifecycle"
```

### Task 12: Converge Runtime And Produce Portfolio Evidence

**Files:** Modify canonical app/router/tests; delete obsolete runtime TS components/routes/session tests only after replacement; retain every `prototypes/**` reference. Create:

- `docs/hr-paysim/22_methodology_note.md`
- `docs/hr-paysim/23_sample_founder_result.md`
- `docs/hr-paysim/24_privacy_and_non_claims.md`
- `docs/hr-paysim/25_algorithm_and_qa_appendix.md`

- [ ] Verify branch lineage with `git merge-base main HEAD`; if none, stop and document the integration path before changing routes.
- [ ] Route `/hr-paysim/demo`, `/hr-paysim/session/new`, and `/hr-paysim/session` to one `PaySimApp` and one provider.
- [ ] Build `/hr-paysim/demo` as the default public surface with both facilitator routes excluded. Build the facilitator surface separately and publish it only after `verify-facilitator-deployment.mjs` confirms an approved external access gate.
- [ ] Verify direct unauthenticated navigation cannot enter either facilitator route in the public deployment and that no authentication material appears in URLs, bundles, browser storage, or telemetry.
- [ ] Remove prototype/roster runtime switching and old nine-step production routes; do not delete static prototypes.
- [ ] Remove deprecated `correctionFloorKRW`, legacy CEI/CED/session/scenario runtime types, and tests only after `rg` proves no canonical import remains.
- [ ] Write the four portfolio documents with method, fixed fixture math, privacy/non-claims, commands, screenshots, known limits, and pilot method. Do not claim pilot outcomes that have not occurred.
- [ ] Run final verification:

```bash
$env:VITE_PAYSIM_SURFACE='PUBLIC_DEMO'
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
node scripts/verify-route-exposure.mjs
$env:VITE_PAYSIM_SURFACE='FACILITATOR'
$env:PAYSIM_BUILD_SURFACE='facilitator'
$env:PAYSIM_FACILITATOR_ACCESS_GATE='deployment_protection'
node scripts/verify-facilitator-deployment.mjs
npm.cmd run build
```

- [ ] Record changed files, test count, command outputs, known limitations, and gate status in the QA appendix.
- [ ] Commit `feat: converge HR PaySim decision-room runtime`.

## Review Checkpoints

- After Task 2: metric meaning and GTM math review.
- After Task 3: `7 -> 3` theme contract review.
- After Task 4A: statement atomicity, structured source, and claim registry review.
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
