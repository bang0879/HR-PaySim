# HR PaySim Facilitated Decision Room Design

## Status

Approved product design for the next HR PaySim production rebuild.

This document is the implementation source of truth for product mode, information architecture, founder-facing language, data flow, privacy, empty/error states, and acceptance criteria. It does not authorize production code changes by itself; a separate implementation plan must translate this design into task-level work.

## Source Of Truth And Supersession

The following existing decisions remain valid:

- HR PaySim is a compensation explainability decision tool, not a salary calculator.
- The product is facilitated-first. Kyle operates the tool, interprets the output, and guides the founder through decisions.
- Relationship evidence must lead before aggregate scores.
- The deterministic engine must not estimate market salary, attrition, productivity loss, legal exposure, or an individual's correct salary.
- Raw roster text must not persist.
- The founder memo must be derived from structured reviewed facts and explicit decisions.

This design supersedes the following runtime and user-experience contracts:

- The nine-step founder-facing wizard.
- CEI/CED and payroll forecast as founder-facing hero outputs.
- Separate runtime surfaces for the monolithic prototype and roster diagnostic slice.
- Rendering all detector findings as equal cards.
- Founder-facing English or internal detector labels.
- A one-to-one mapping from detector type to a policy bucket.
- A separate screen for every observation, comparison, simulation, and decision.

Existing prototypes remain in the repository as design references only. They are not production architecture.

## Product Definition

> HR PaySim helps a founder examine pay differences inside a de-identified employee roster, explain why those differences exist, see what would happen if the same hiring or raise practice were repeated, and record the company rules that should guide the next similar decision.

Founder-facing Korean definition:

> 비슷한 일을 하는 직원들이 서로 연봉을 비교했을 때 현재의 차이를 일관된 기준으로 설명할 수 있는지 확인하고, 다음 채용·인상·승진 전에 회사가 정해야 할 기준을 정리하는 도구입니다.

## Primary Operating Mode

The primary mode is a facilitated consulting session.

- Kyle controls the keyboard and screen share.
- The founder reads the evidence, answers structured questions, and approves decisions.
- The product guides the conversation; it does not replace Kyle's interpretation.
- The main session should take 45 to 60 minutes.
- A synthetic portfolio demonstration should communicate the method in 90 seconds.
- Self-service onboarding, pricing, payment, and cold conversion are outside v1.

## Product Outcome

At the end of one session the founder should have:

1. A small set of concrete pay differences that require explanation.
2. The founder's explanation for each difference.
3. The evidence that supports the explanation or the evidence still required.
4. The result of applying the same observed practice to the next similar decision, when that calculation is supportable.
5. A company rule or follow-up action with an owner and review point.
6. A shareable summary of findings and decisions.

The product does not produce an individual's recommended salary.

## Experience Architecture

### Facilitator-Only Preparation

This step happens before the founder-facing session and is not counted in the four-screen progress indicator.

The facilitator:

1. Pastes a de-identified roster.
2. Runs header- and value-level personal-information checks.
3. Reviews the accepted fields and blocked rows.
4. Confirms the role, salary, tenure, level, and documented-exception inputs used by the calculation.
5. Starts the founder session.

When parsing succeeds, the raw pasted string is cleared immediately. Founder-facing screens use `직원 A`, `직원 B`, and similar session-local labels. System IDs such as `row_001` never render to the founder.

### Founder-Facing Session

The founder-facing session contains exactly four top-level screens:

1. `금번 진단 안내`
2. `확인된 연봉 차이`
3. `앞으로 적용할 회사 기준`
4. `금번 진단 결과와 결정사항`

The four-screen structure is fixed for v1. Role groups and individual review subjects switch inside screens; they do not create new top-level pages.

## Screen Contracts

### Screen 1: 금번 진단 안내

Purpose: agree on the question, scope, non-claims, expected output, and session duration before showing a result.

Required content:

- The concrete question the session will examine.
- What the tool does not calculate.
- The three categories of output the founder will receive.
- Expected session duration.
- One primary action that names the next evidence the founder will see.

The screen must not show a score, detector count, risk badge, or English product-category label.

### Screen 2: 확인된 연봉 차이

Purpose: combine structural context and a concrete employee comparison in one evidence-rich workspace.

Required content for the selected review subject:

- A conclusion sentence containing the role group, affected employee count, salary ranges, and why the current data does not explain the difference.
- A salary distribution or level-order visualization.
- The most decision-useful anonymized employee comparison.
- A compact evidence table containing only fields used in the comparison.
- A plain statement that a higher-paid employee is not automatically wrong.
- A structured explanation question.
- An inline evidence-status question that appears after the founder selects an explanation.
- A visible clean-group statement when the sample contains a role group with no material signal.

The three sample review subjects appear as tabs or an equivalent in-place selector. Switching subjects changes the conclusion, visualization, comparison, evidence, and selected explanation without a route change.

The founder never sees seven equal detector cards.

### Screen 3: 앞으로 적용할 회사 기준

Purpose: combine the repeat-the-practice calculation and the resulting company decision in one workspace.

Required content:

- The founder's selected explanation in complete Korean.
- The evidence currently available.
- Missing conditions that prevent the explanation from becoming an operational rule.
- An observed-practice repeat result when calculation is supportable.
- A clear statement that the repeat result is a counterfactual based on observed precedent, not a declared company policy.
- The scope, amount/range, approver, and review-event conditions needed for a reusable rule.
- Concrete decision choices written as company actions.
- Owner and due event or review date.

If the explanation cannot be parameterized from founder-approved inputs, the tool must not invent values. It records the missing conditions and creates an evidence follow-up instead.

### Screen 4: 금번 진단 결과와 결정사항

Purpose: produce a founder-approved record from structured reviewed state.

Required columns or equivalent document structure:

- 확인된 내용
- 대표님 설명
- 확인된 근거 또는 추가 확인 자료
- 이번에 정한 사항
- 담당자
- 완료 또는 재검토 시점

The screen also includes:

- An executive summary in plain Korean.
- A section explaining what the result does not mean.
- Actions grouped by `다음 채용 전`, `다음 인사평가 전`, or a concrete follow-up period.
- Explicit copy/export actions.
- An explicit session-end action that clears session data.

The report is always derived from structured state. It is not a separately stored block of generated prose.

## Gaze And Transition Contract

Every founder-facing screen follows the same visual reading order:

1. Concrete conclusion.
2. Visual or tabular evidence.
3. Highlighted employee comparison or repeat result.
4. Founder question and choice.
5. One primary next action at the bottom.

Additional transition rules:

- The founder-facing session shows four top-level progress items only.
- Each screen has one high-emphasis primary action.
- Role switching occurs in place.
- Dependent questions expand in place instead of opening a modal.
- On top-level transition, focus moves to the new conclusion heading.
- On role switch, focus moves to the selected subject's conclusion.
- The next action remains after the evidence and decision content, matching natural downward reading.
- A slim bottom status may show reviewed-subject count and the next action.
- The user must not scroll back to the top to continue.
- Popups must not interrupt the core review flow.
- Changing an earlier explanation recomputes only dependent results and decisions.
- Founder-facing copy says the result was recalculated; it never uses `stale`.

## Internal Data Flow

```text
Roster paste
  -> privacy scan and normalization
  -> NormalizedRosterRow[]
  -> DetectorFinding[]
  -> StructuralTheme[]
  -> ThemeReview[]
  -> InterpretationClaim[]
  -> PrecedentRepeatResult[]
  -> DecisionRecord[] and EvidenceFollowUp[]
  -> SessionReportViewModel
  -> founder-facing HTML / copy / export
```

Detectors produce observations. They do not write founder conclusions, choose policy domains, or create report prose directly.

## Detector Findings And Visible Review Subjects

### Raw Detector Scope

The deterministic engine retains four detector types:

- `shadow_band`
- `pay_inversion`
- `loyalty_tax`
- `level_fiction_band_overlap`

Raw findings are allowed to be non-orthogonal. They are internal evidence lenses, not founder-facing cards.

### Explicit Subsumption Rules

`buildStructuralThemes()` must use explainable rules rather than a generic affected-row overlap threshold.

1. Findings must share a role group before they can be combined.
2. `pay_inversion` and `loyalty_tax` combine when they use the same headline pair or the loyalty-tax pair set is a subset of the pay-inversion pair set.
3. In that combination, loyalty tax becomes a supporting tenure-pattern lens rather than a second visible subject.
4. A shadow-band finding attaches to a relationship theme only when a material comparison pair crosses the detected salary-cluster boundary.
5. Level-order findings do not combine with tenure findings merely because affected employees overlap.
6. Disconnected pair graphs inside one role group remain separate themes.
7. No theme is selected or prioritized merely to create a more varied demo story.

### Fixed Sample Contract

For the current 16-row synthetic roster:

- Raw detector findings: 7.
- Founder-visible review subjects: 3.
- Product Engineer: 1 integrated review subject.
- Platform Engineer: 1 integrated review subject.
- GTM: 1 level-order review subject.
- Designer: clean comparison group.
- Duplicate visible headline pairs: 0.

## Metric Semantics

The existing `correctionFloorKRW` field is replaced by metrics with one meaning each:

- `headlineGapKRW`: factual gap in the highlighted comparison.
- `pairRepairFloorKRW`: minimum direct adjustment required to remove the highlighted pair violation under the selected repair definition.
- `systemRepairFloorKRW`: minimum total direct adjustment required to restore all selected ordinal constraints without double-counting overlapping effects.

Rules:

- A distribution finding may have a headline cluster gap without any repair floor.
- The founder-facing UI does not present a repair floor as a recommended salary.
- `systemRepairFloorKRW` must be produced by a minimum-restoration algorithm, not a sum of pair gaps.
- Every displayed amount includes a non-claim explaining what it is not.

## Review State

Founder review distinguishes an unanswered question from missing data.

Internal review state includes:

- explanation basis
- evidence status
- repeatability status
- review outcome
- founder-approved explanation sentence
- evidence follow-up, when needed

Required distinctions:

- `unanswered`: the founder has not answered yet.
- `founder_cannot_explain`: the founder currently cannot explain the difference.
- `insufficient_data`: the required comparison or supporting evidence is unavailable.
- `documented`: the explanation is supported by a record.
- `observable`: the explanation is supported by visible role, level, or responsibility evidence.
- `leader_assertion_only`: the explanation currently depends on leader memory or assertion.
- `one_time_exception`: the explanation applies to one case and needs a boundary.
- `reusable_rule`: the founder has approved explicit conditions for future use.

`추가 확인 필요` is a workflow state represented by `EvidenceFollowUp`; it is not a policy domain.

## Claim Basis And Interpretation Contract

This contract governs internal interpretation content. It does not reintroduce founder-visible insight-card grids. The twelve HR Prism insight cards are not copied into PaySim; only their reasoning sequence may inform a newly authorized PaySim interpretation after each statement's evidence and claim basis are recorded.

`InterpretationClaimStatus` is separate from `EvidenceStatus`. `EvidenceStatus` describes whether the founder's explanation is supported. `InterpretationClaimStatus` describes what one displayable statement may assert about the observed relationship. A claim container may contain statements with different statuses.

```ts
export type InterpretationClaimStatus =
  | "VERIFIED_EXTERNAL"
  | "SUPPORTED_BY_CLIENT_DATA"
  | "KYLE_EXPERIENCE_BASED"
  | "WORKING_HYPOTHESIS"
  | "UNSUPPORTED_DO_NOT_USE";

export type InterpretationStatementKind =
  | "SURFACE_OBSERVATION"
  | "TYPICAL_INTERPRETATION"
  | "DEEPER_MECHANISM"
  | "TIME_AXIS_OR_CASCADE"
  | "COUNTER_INTUITIVE_ANGLE"
  | "DECISION_RELEVANCE";

export interface ExternalClaimSource {
  kind: "EXTERNAL";
  title: string;
  publisher: string;
  publishedAt: string;
  sourceLocation: string;
  populationOrScope: string;
  applicabilityNote: string;
}

export interface ClientDataClaimSource {
  kind: "CLIENT_DATA";
  evidenceIds: string[];
  reviewedStateIds: string[];
}

export interface PractitionerExperienceSource {
  kind: "PRACTITIONER_EXPERIENCE";
  experienceRef: string;
  context: string;
  limitation: string;
}

export type ClaimSourceRef =
  | ExternalClaimSource
  | ClientDataClaimSource
  | PractitionerExperienceSource;

export interface InterpretationStatement {
  id: string;
  kind: InterpretationStatementKind;
  copyKey: string;
  claimStatus: InterpretationClaimStatus;
  triggerEvidenceIds: string[];
  reviewDependencyIds: string[];
  sourceRefs: ClaimSourceRef[];
  mustNotClaimKeys: string[];
}

export interface InterpretationClaim {
  id: string;
  themeId: string;
  statements: InterpretationStatement[];
  founderQuestion: {
    copyKey: string;
    supportingStatementIds: string[];
  };
}
```

Atomicity and source rules:

- A factual salary difference may be `SUPPORTED_BY_CLIENT_DATA` while a proposed mechanism remains `WORKING_HYPOTHESIS` and a time-axis pattern remains `VERIFIED_EXTERNAL` or `KYLE_EXPERIENCE_BASED`.
- `VERIFIED_EXTERNAL` requires at least one `ExternalClaimSource` with title, publisher, publication date, source location, population or scope, and an applicability note.
- `SUPPORTED_BY_CLIENT_DATA` requires at least one `ClientDataClaimSource` whose evidence and reviewed-state IDs resolve in the current session.
- `KYLE_EXPERIENCE_BASED` requires at least one `PractitionerExperienceSource` that records the experience reference, context, and limitation.
- `WORKING_HYPOTHESIS` may use linked evidence as a trigger but cannot be promoted without a new validated source and status transition.
- `UNSUPPORTED_DO_NOT_USE` never renders in a founder-facing screen, copy/export result, or portfolio artifact.
- Every founder question declares the statement IDs it relies on. A question cannot silently introduce a stronger factual premise than its supporting statements.
- No statement may infer employee intent, declare unfairness, choose a policy domain, create numeric repeat parameters, or approve a decision.

Rendering rules:

- `SUPPORTED_BY_CLIENT_DATA` may establish a client fact but cannot by itself establish causality, employee intent, or a future cascade.
- `VERIFIED_EXTERNAL` may establish external context or a known pattern. It cannot confirm that the same mechanism exists in the client company without linked client evidence.
- `KYLE_EXPERIENCE_BASED` cannot render in `확인된 내용`, `확인된 근거`, a client-specific confirmed result, or as the asserted basis for a decision. It may appear only in facilitator guidance, a methodology note, an explicitly labeled `검토 관점`, or the background to a founder question while preserving its lower claim status.
- `WORKING_HYPOTHESIS` may appear only as a conditional interpretation, founder question, or evidence follow-up. It cannot appear as a confirmed result.
- Screen 4 and exported results render only statements allowed for their destination. Lower-status framing remains visibly labeled and is never merged into confirmed-result prose.

Flow integration and invalidation:

- Screen 2 may use validated surface-observation statements and a founder question after the concrete relationship evidence.
- Screens 3 and 4 may use deeper-mechanism or cascade statements only when each statement's status, source, destination, and reviewed-state dependency permit it.
- The final report derives interpretation copy from validated statement records; it does not store or generate an untracked narrative block.
- Changing a founder explanation or `EvidenceStatus` invalidates all dependent interpretation statements, repeat results, decision records, and report sections before any of them render again.
- Invalidated outputs remain absent or explicitly pending recalculation; old claim copy, repeat results, decision sentences, and export copy cannot survive the dependency change.

## Repeat-The-Practice Calculation

The engine supports two modes.

### Observed Precedent Repeat

The calculation repeats an observed hiring or raise precedent once and shows the resulting internal comparisons.

Required label:

> 현재 확인된 사례가 한 번 더 반복된다고 가정한 결과이며, 회사의 확정된 정책이 아닙니다.

### Founder-Bounded Rule Repeat

This mode runs only after the founder explicitly defines:

- eligible role or employee scope
- triggering condition
- amount or range
- cap, if applicable
- approver
- review or expiry event

The application must not translate a vague explanation into invented parameters.

## Decision Structure

Internal decision domains are stable and many-to-many with review subjects:

1. hiring offers and market-driven additional pay
2. retention or other exceptions and their boundaries
3. role, level, and salary-range definition
4. periodic review, promotion, and long-tenure review
5. approval, documentation, and review operations

Founder-facing screens use full Korean action sentences rather than domain names.

Each `DecisionRecord` contains:

- linked review-subject IDs
- company action
- gain
- trade-off
- owner role
- due event or date
- decision status
- founder-approved sentence for the final result

## Founder-Facing Copy Contract

### Sentence Structure

Founder-facing content uses this order:

```text
observable fact
-> what the fact means within the current data
-> what the founder must explain or decide
```

### Forbidden Founder-Facing Terms

The following terms are forbidden in founder-facing UI unless they appear inside a methodology disclosure explicitly opened by the facilitator:

- finding
- theme
- relationship
- shadow band
- pay inversion
- loyalty tax
- level fiction
- cohort
- defensibility
- replay
- correction floor
- exposure
- severity
- confidence
- normalized row
- raw data
- PII
- stale
- memo
- decision domain

### Required Plain-Language Mappings

- `finding` -> `이번 자료에서 확인된 연봉 차이`
- `relationship` -> `직원 A와 직원 B의 구체적인 연봉 비교`
- `shadow_band` -> `같은 역할인데 연봉이 두 그룹으로 나뉜 상태`
- `pay_inversion` -> `오래 근무한 직원이 최근 입사한 직원보다 낮은 연봉을 받는 사례`
- `loyalty_tax` -> `오래 근무한 직원들이 최근 입사자보다 낮은 연봉을 받는 사례가 반복되는 상태`
- `replay` -> `같은 채용 또는 인상 방식을 다음에도 적용했을 때 생기는 결과`
- `memo` -> `금번 진단 결과와 대표님이 결정한 사항`

### Headings And Buttons

- Navigation labels may be short.
- The first body heading must state a concrete conclusion with role, amount/range, and comparison context.
- Buttons name the next action or evidence, not a destination.
- `다음`, `계속`, `결과 보기`, and `저장` are not sufficient primary labels.

Examples:

- `실제 연봉 분포와 비교 사례 보기`
- `이 차이가 생긴 이유 확인하기`
- `같은 채용 방식을 다음에도 적용해 보기`
- `금번 진단에서 결정한 내용 정리하기`
- `대표님이 확인한 내용 복사하기`

### Tone

- Do not shame or test the founder.
- Do not declare a high-paid employee wrong.
- Distinguish `현재 자료로 설명하기 어려움` from `잘못된 보상`.
- Avoid unsupported claims of unfairness, legal risk, or employee intent.
- Pair every amount with a unit and comparison subject.
- Expand unfamiliar compensation jargon instead of using it alone.

## Privacy And Session Lifecycle

V1 uses an in-memory session model.

- Raw paste is never written to localStorage, sessionStorage, a URL, telemetry, or a server.
- Normalized employee rows remain in memory only.
- Review answers, repeat parameters, decisions, and report state remain in memory only until explicit copy/export.
- A browser refresh resets the working session; the preparation screen clearly warns the facilitator before analysis begins.
- Leaving an active session triggers a plain-language confirmation.
- Explicit session end clears roster rows, review state, decisions, report state, and clipboard affordance state.
- Copy/export occurs only after an explicit user action.
- The application does not automatically store pilot-learning logs.
- A consented anonymous pilot log is maintained separately and manually under the existing learning-log contract.

## Empty And Error States

### No Material Difference Requiring Explanation

Required meaning:

> 이번에 입력한 자료에서는 같은 역할의 직원들이 서로 연봉을 비교했을 때 별도로 설명이 필요한 큰 차이가 확인되지 않았습니다. 이는 회사의 모든 보상 기준이 완전하다는 뜻이 아니라, 현재 입력된 자료 범위에서 추가 검토가 필요한 사례가 발견되지 않았다는 뜻입니다.

### Insufficient Group Size

The message names the role group, available row count, required row count, and supported calculation.

Example:

> Product Engineer 자료가 2명뿐이어서 같은 역할 안의 연봉 분포를 판단하기 어렵습니다. 최소 4명의 자료가 있으면 연봉이 여러 그룹으로 나뉘는지 확인할 수 있습니다.

### Explanation Without Supporting Evidence

The screen records the explanation, states which evidence is missing, and creates a follow-up with owner and due event.

### Founder Cannot Currently Explain

This is a valid review outcome, not a validation error. The tool identifies records to check next.

### Repeat Calculation Not Supportable

The screen explains which scope, amount, approval, or timing condition is missing and does not run an invented simulation.

### Personal Information Detected

- Do not echo the detected value.
- Display safe column names and affected row numbers only.
- Block analysis until disallowed fields are removed or explicitly stripped under the approved parser contract.

### Earlier Answer Changed

Required founder-facing meaning:

> 앞서 선택한 설명이 변경되어 이후 계산과 결정사항을 다시 확인했습니다.

## Technical Architecture Direction

Production converges on one `PaySimApp` and one engine.

Target routes:

- `/hr-paysim/demo`: synthetic sample, starting at founder screen 1.
- `/hr-paysim/session/new`: facilitator-only preparation.
- `/hr-paysim/session`: active four-screen in-memory session.

### Route Exposure And Indexing

- `/hr-paysim/demo` is a direct-link, synthetic-data portfolio demonstration. It remains `noindex` in v1 until Kyle explicitly approves a portfolio-publication gate. It does not require a facilitator access gate.
- `/hr-paysim/session/new` and `/hr-paysim/session` are facilitator-only operational routes. If they are included in a publicly reachable deployment, both routes require an approved facilitator access gate. Otherwise they must be excluded from that public deployment.
- `noindex`, sitemap exclusion, and navigation exclusion control discovery only. They do not constitute access control.
- Unauthenticated users cannot enter facilitator preparation or session screens in an access-gated deployment.
- Authentication secrets never appear in URLs, query parameters, client bundles, browser storage, or telemetry. Obscure paths and URL tokens are not accepted as access control.
- V1 has no public marketing landing page, cold conversion funnel, pricing, payment, or public self-service onboarding.
- The demo route cannot accept or retain user-entered roster data.
- `noindex` behavior and facilitator access control are verified independently.
- Any future indexing or public-discovery change requires an explicit product decision plus privacy, copy, access-control, and route QA.

Runtime no longer routes to the old nine-step prototype. Prototype files remain reference artifacts outside the production route tree.

Target bounded modules:

- roster privacy and normalization
- deterministic detectors
- structural-theme builder
- review-state model
- interpretation-claim registry and claim-basis validation
- observed and bounded repeat calculators
- decision records and evidence follow-ups
- founder report view model
- facilitator preparation UI
- four founder-facing screens
- founder-copy constants and forbidden-copy checks

No detector may import founder report rendering. No report renderer may infer a decision absent from reviewed state.

## Acceptance Criteria

### Product And Comprehension

- The founder-facing session has four top-level screens.
- A non-HR founder can state within five seconds what is being compared, what difference was observed, and what response is requested.
- A test participant can paraphrase each core conclusion without using facilitator explanation.
- The first result is a salary distribution plus a concrete employee comparison, not a table-only view or aggregate score.
- The sample shows three non-duplicative review subjects and one clean group.
- A founder can share the final result with a co-founder or HR lead without Kyle rewriting it.

### Gaze And Layout

- At 1280x720 and 1440x900 the reading order is conclusion, evidence, comparison, question, next action.
- No horizontal overflow occurs.
- Role switching and dependent questions do not create route changes or modal interruptions.
- Keyboard focus moves to the correct conclusion after screen and subject changes.
- The next action is reachable after the content without returning to the top.

### Algorithm And Data Contract

- Current sample produces 7 raw detector findings and 3 founder-visible review subjects.
- Duplicate visible headline pairs equal zero.
- Designer remains a clean group.
- `unanswered`, `founder_cannot_explain`, and `insufficient_data` remain distinct.
- A vague explanation cannot trigger invented repeat parameters.
- Headline gap, pair repair floor, and system repair floor have distinct fields and tests.
- System repair floor does not double-count overlapping ordinal repairs.
- Same input and reviewed rule produce the same result.
- Every rendered interpretation sentence resolves from an `InterpretationStatement` with one claim status and a valid destination.
- Statements inside one `InterpretationClaim` may hold different claim statuses without promoting neighboring statements.
- `UNSUPPORTED_DO_NOT_USE` content is absent from screens, exports, and portfolio artifacts.
- `WORKING_HYPOTHESIS` content renders only as a conditional question or evidence follow-up.
- `VERIFIED_EXTERNAL` statements fail validation without a complete `ExternalClaimSource` and cannot alone confirm a client-specific mechanism.
- `SUPPORTED_BY_CLIENT_DATA` statements retain traceable evidence and reviewed-state dependencies and do not assert causality or employee intent.
- `KYLE_EXPERIENCE_BASED` statements do not render in confirmed-result or confirmed-evidence areas.
- External context, client facts, practitioner framing, and hypotheses remain distinct in the copy hierarchy.
- Changing a founder explanation or `EvidenceStatus` invalidates all dependent interpretation statements, repeat results, decision records, and report sections before any of them render again.
- Integration tests prove old claim copy, repeat results, decision sentences, and export copy disappear before recalculation and only new valid outputs render afterward.

### Privacy

- Header- and value-level personal-information tests pass.
- Raw paste does not remain in component state after successful parsing.
- Raw and normalized roster data do not appear in browser storage or URLs.
- Explicit session end clears in-memory state.
- No roster or founder free text is emitted automatically.
- The demo route satisfies its synthetic-only and `noindex` contract.
- Public builds either exclude both facilitator routes or place both behind an approved facilitator access gate.
- Unauthenticated access to `/hr-paysim/session/new` and `/hr-paysim/session` is blocked when those routes are deployed.
- Authentication secrets are absent from URLs, query parameters, client bundles, browser storage, and telemetry.
- `noindex` and facilitator access control have independent verification checks.

### Copy

- Founder-facing forbidden-copy lint includes every term in this design.
- English internal labels do not render in founder-facing surfaces.
- Every primary button names a concrete next action.
- Every displayed amount includes a unit and comparison context.
- Empty, insufficient-data, personal-information, recalculation, and export-failure states use plain Korean.

### Verification Gates

- Unit tests for parser, detectors, theme building, metric semantics, review state, repeat calculation, and report derivation.
- Integration tests for facilitator preparation and all four founder screens.
- Accessibility tests for headings, focus, keyboard completion, current-step state, and disabled/blocked actions.
- Desktop and mobile overflow checks.
- Console-clean browser test.
- `npm.cmd run lint`
- `npm.cmd test`
- `npm.cmd run typecheck`
- `npm.cmd run build`

## Portfolio And Field Validation Outputs

The project is complete as a career artifact only when the product is accompanied by:

- a synthetic live demo
- a first-class methodology note
- a sample founder result document
- a privacy and non-claims note
- deterministic algorithm and QA evidence
- a consented anonymous pilot case-series summary

Pilot success is measured by decision usefulness rather than satisfaction alone:

- at least three facilitated pilot sessions
- at least three confirmed moments where the founder's understanding changed
- at least two final results shared with a co-founder, leader, or HR owner
- at least one action scheduled before the next offer or review
- documented false positives and founder disagreements

## Implementation Boundary

The first implementation plan must build a vertical slice around the existing synthetic roster before adding more detectors or public-product features.

The implementation sequence must begin with:

1. metric-semantic separation
2. structural-theme subsumption
3. unified review states
4. one Product Engineer end-to-end path through the four screens

Only after that path passes comprehension, algorithm, privacy, and copy gates may the remaining sample subjects and facilitator intake be connected.
