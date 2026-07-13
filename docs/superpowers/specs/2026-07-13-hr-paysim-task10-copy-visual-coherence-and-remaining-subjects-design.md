# HR PaySim Task 10 Copy, Visual Coherence, And Remaining Subjects Design

**Date:** 2026-07-13
**Status:** Approved direction; written-spec review pending
**Classification:** `PRODUCT_IMPLEMENTATION`

## Purpose

Task 10 keeps the approved HR PaySim Decision Room logic and four-screen flow, but makes the product read and feel like one deliberate product. It has two connected outcomes:

1. Bring the facilitator-preparation surface and the current Product Engineer slice into one visual and copy system.
2. Connect Platform Engineer, GTM, and the Designer clean state inside the same four screens.

This is a first copy and visual-coherence pass for user review. It is not an app-wide redesign, a detector rewrite, or Task 11/12 expansion.

The latest governance decomposition originally placed the remaining-subject contract after PILOT-1. The user has explicitly authorized a synthetic-sample first draft before that real-roster checkpoint. This authorization allows implementation and review of the draft, but it does not make the subject contract pilot-validated, does not create a learning-log record, and does not satisfy PILOT-1 or the final facilitated-session threshold. Real-pilot evidence may still require later copy or ordering changes.

## Authority And Governance

This design follows:

- `docs/diagnostic-product-adapter.md`
- `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- `docs/superpowers/specs/2026-07-12-hr-paysim-governance-preflight-and-remaining-work-design.md`
- `docs/superpowers/plans/2026-07-11-hr-paysim-facilitated-decision-room-implementation-plan.md`, Task 10

The upstream Constitution and casebook remain evidence, not PaySim copy sources. HR Prism sentences, screen structures, components, glossary entries, and correction copy must not be copied literally.

The applicable transfer is limited to these patterns:

- `DP-03`, `CASE-01`: translate internal detector and calculation language into the operator's decision language.
- `CASE-02`: lead with meaning; retain amounts, units, and source data as supporting evidence.
- `CASE-03`: describe organization conditions as company conditions, not as personal founder failure.
- `CASE-06`: ask for one judgment at a time and preserve an explicit cannot-explain or insufficient-evidence state.
- `CASE-08`: end with a real question or action boundary, not a restated recommendation.
- `DP-05`, `CASE-13`: preserve the four-screen decision flow and put the next action after the material the user must review.
- `CASE-14`: use necessary compensation terms with short explanations and remove abstract language that does not support a decision.

## Locked Product Boundaries

The implementation must not change:

- the four top-level screens or their order;
- salary, tenure, level, finding, theme, selection, repeat, decision, or report calculations;
- the sample roster and its fixed numeric contracts;
- state ownership, dependency invalidation, session clearing, or route behavior;
- the Product Engineer chart coordinates introduced in Task 9;
- the in-memory privacy model;
- the rule that each screen has one high-emphasis primary action.

The implementation must not add:

- file upload, public deployment, authentication, or server persistence;
- a market benchmark, normal raise rate, salary recommendation, or approved company standard;
- new detector labels, scores, risk badges, or equal-weight finding cards;
- new top-level screens, modals, or Task 12 portfolio material;
- a claim that the synthetic dry-run is PILOT-1 evidence.

The Product Engineer-only preparation gate remains Product Engineer-only in this package. Task 10 expands the synthetic Decision Room subject experience; it does not silently broaden real-roster intake.

## Experience Architecture

### Preparation surface

The preparation route remains outside the four-step progress indicator. Its state machine remains:

```text
paste -> inspect -> column consent | blocked | normalized confirmation -> start session
```

Only presentation and guidance change. The parser continues to require the header row. Task 10 makes that requirement unmistakable before paste; it does not infer missing headers or reinterpret malformed rows.

### Founder-facing surface

The Decision Room remains:

```text
1. 금번 진단 안내
2. 확인된 연봉 차이
3. 앞으로 적용할 회사 기준
4. 금번 진단 결과와 결정사항
```

Product Engineer, Platform Engineer, and GTM are selected subjects. `activeThemeId` is the only subject-selection state. `SELECT_THEME` switches the subject in place and never changes the route. The selected subject controls the conclusion, visualization, employee labels, comparison, review answers, rule calculation, and subject-level result content.

Designer is not promoted to a selectable subject because the sample has no material Designer theme. It appears as a bounded clean-state statement on Screen 2 and in the final result context.

## Visual System

The current Decision Room is the approved visual baseline. Task 10 does not introduce a new brand direction.

### Shared foundation

The preparation and Decision Room surfaces use the same foundation values:

- ink `#172033`;
- muted text `#667085`;
- line `#e3e8ef`;
- soft surface `#f6f8fb`;
- action blue `#2563eb`;
- deep blue `#1746a2`;
- blue-soft `#edf4ff`;
- the existing neutral page background, radial blue light, focus ring, panel radius, button treatment, and typography scale.

A small shared CSS foundation may own tokens and base focus treatment. Screen-specific components remain separate. Task 10 must not extract a generic design system or restyle unrelated routes.

### Preparation hierarchy

The preparation screen adopts the Decision Room's product header, content width, hero scale, panel hierarchy, status treatments, and bottom action language. It should read as the secure first step of the same product, not as a spreadsheet utility.

The information order is:

1. what will be used in the session;
2. where the data is processed and when it is cleared;
3. the exact header-row requirement and allowed columns;
4. paste area and format-check action;
5. one current status: consent, blocked, or confirmation;
6. session-start action after the confirmed preview.

### Subject selector

Screen 2 uses three equal subject tabs with a single selected state. The selected tab has the current blue-soft surface and blue focus/selection border. Unselected tabs remain enabled and neutral. Small text describes progress, such as `1/3 확인 중`; it must not imply a subject is complete merely because its tab was visited.

On subject change, keyboard focus moves to the new conclusion heading. The same selector appears on Screens 2 and 3 so evidence and the corresponding company-rule view stay explicitly linked. Screen 4 summarizes the selected subjects rather than presenting the tabs as separate pages.

### Visualizations

- Product Engineer and Platform Engineer use the approved salary-by-tenure scatter structure.
- The actual observed trend remains the dark solid line; the blue dotted line remains only a direction guide. Both remain deliberately inset and do not run edge-to-edge.
- GTM uses a level-order visualization with AE1 and AE2 columns, employee points, salary labels, and a highlighted Employee B-to-D comparison. It does not render a tenure trend line because the decision question is level order.
- Existing point, label, legend, non-claim, and summary hierarchy is reused. Coordinates and salary calculations are not altered.
- The Designer clean state is a quiet bordered notice after the selected-subject evidence, not a success badge or proof that the whole pay system is correct.

## Copy System

All important conclusions, states, non-claims, questions, and actions remain in `src/lib/hr-paysim/copy/founderCopy.ts`. Components must not accumulate new hard-coded founder conclusions.

Every subject follows this sequence:

```text
observable fact
-> what can and cannot be concluded from current data
-> one explanation or decision the user must provide
```

Amounts always include a unit and comparison subject. Internal terms such as finding, theme, pay inversion, level fiction, correction floor, normalized row, or raw data never render in founder-facing copy.

### Preparation copy draft

| Location | First-pass copy |
|---|---|
| Eyebrow | `HR PaySim · 진행자 준비` |
| Hero | `이번 세션에 사용할 익명 자료를 먼저 확인합니다.` |
| Hero support | `붙여넣은 자료는 이 브라우저에서만 검사하며, 세션을 종료하면 지워집니다. 이름·연락처처럼 개인을 식별할 수 있는 정보는 사용하지 않습니다.` |
| Paste heading | `첫 행에 열 이름이 포함된 표를 붙여넣어 주세요.` |
| Paste label | `익명 직원 자료` |
| Paste helper | `엑셀에서 열 이름을 포함한 전체 범위를 복사해 붙여넣습니다.` |
| Trust badge | `브라우저 안에서만 확인` |
| Inspect action | `자료 형식 확인` |
| Column-consent heading | `개인을 식별할 수 있는 열은 제외한 뒤 계속합니다.` |
| Column-consent support | `아래에는 열 이름만 표시됩니다. 해당 열의 값은 미리 보거나 세션에 사용하지 않습니다.` |
| Column-consent action | `표시된 열을 제외하고 확인` |
| Blocked kicker | `자료 형식을 확인해 주세요` |
| Blocked heading | `아래 항목을 수정한 뒤 표 전체를 다시 붙여넣어 주세요.` |
| Ready kicker | `세션 자료 확인` |
| Ready heading | `이번 세션에 사용할 익명 자료입니다.` |
| Ready support | `아래 항목만 세션에 사용하며 원본 이름이나 연락처는 표시하거나 저장하지 않습니다.` |
| Start action | `이 자료로 세션 시작` |

The required and optional column names appear as compact reference chips close to the paste field. The chips use exact parser headers and are facilitator guidance, not founder copy.

### Screen 1 copy draft

The conclusion becomes multi-subject without exposing detector counts:

> 이번 세션에서는 같은 역할 안에서 확인된 연봉 차이를 비교하고, 다음 채용과 인사평가 전에 회사가 정할 기준을 정리합니다.

For the synthetic sample, the scope states that Product Engineer, Platform Engineer, and GTM will be reviewed in order. It states separately that Designer has no additional comparison requiring review in the current sample. The screen continues to say that it does not recommend individual salary or infer performance, intent, or turnover likelihood.

The primary action is `첫 번째 연봉 비교 보기`.

### Screen 2 subject copy draft

#### Product Engineer

Keep the Task 9 conclusion and chart meaning. Tighten supporting copy so it does not repeat the headline:

> Product Engineer 6명의 기본 연봉과 근속 개월을 함께 놓았습니다. 현재 기록된 역할·근속 기간·채용 예외만으로는 직원 A와 직원 B의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.

Question:

> 이 차이가 생긴 가장 가까운 이유를 하나 선택해 주세요.

#### Platform Engineer

Conclusion:

> Platform Engineer 4명 중 근속 60개월인 직원 A와 근속 17개월인 직원 B의 기본 연봉은 1,800만원 차이 납니다.

Supporting meaning:

> 근속 60~69개월인 직원 2명의 기본 연봉은 8,400만~8,600만원이고, 근속 17~19개월인 직원 2명은 9,800만~1억200만원입니다. 현재 기록만으로는 두 구간의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.

Review focus:

> 최근 채용 조건과 기존 직원의 연봉 검토 기준이 다르게 적용되었는지 확인합니다.

Explanation question:

> 근속이 짧은 직원의 연봉이 더 높은 가장 가까운 이유를 하나 선택해 주세요.

The structured explanation choices include `현재는 이유를 설명하기 어렵습니다.` and answer this one question.

#### GTM

Conclusion:

> GTM 4명 중 AE2인 직원 A의 기본 연봉은 AE1인 직원 B보다 400만원 낮습니다.

Supporting meaning:

> AE2 직원 2명의 기본 연봉은 6,600만~6,900만원이고, AE1 직원 2명은 6,100만~7,000만원입니다. 현재 자료에서는 직급 순서와 기본 연봉 순서가 일부 비교에서 다릅니다.

Review focus:

> 직급별 역할 기준과 연봉 결정 기준이 같은 순서로 적용되는지 확인합니다.

Explanation question:

> AE1과 AE2의 연봉 순서가 일부 다른 가장 가까운 이유를 하나 선택해 주세요.

The GTM amount contract is labeled without recommendation language:

- `직원 A와 직원 B의 현재 기본 연봉 차이: 400만원`
- `두 직원의 차이를 0원으로 놓는 계산: 400만원`
- `AE2 두 명을 가장 높은 AE1과 같은 금액으로 놓는 계산 합계: 500만원`

Adjacent copy states:

> 이 계산은 현재 직급 순서와 기본 연봉을 비교하기 위한 가정입니다. 인상액, 권장 연봉 또는 회사가 승인한 기준이 아닙니다.

#### Designer clean state

> Designer 2명은 현재 샘플 자료 범위에서 별도로 설명이 필요한 연봉 차이가 확인되지 않았습니다. 회사의 모든 보상 기준이 완전하다는 뜻은 아닙니다.

### Shared question and evidence copy

The explanation question asks for one explanation. Evidence appears only after that answer and asks one separate question:

> 선택한 설명을 같은 기준으로 확인할 수 있는 기록이나 업무 자료가 있습니까?

Evidence labels remain factual:

- `승인 기록이나 문서가 있습니다.`
- `업무 기록에서 확인할 수 있습니다.`
- `현재는 리더의 설명만 있습니다.`
- `확인할 자료가 부족합니다.`
- `아직 확인하지 않았습니다.`

### Screen 3 copy behavior

Screen 3 uses one of two evidence-owned variants; it never invents a repeat parameter.

1. **Observed hiring precedent:** Product Engineer or Platform Engineer may show the existing one-more-hire calculation only when a canonical observed precedent exists and the reviewed explanation supports it.
2. **Level-order comparison:** GTM shows the fixed 400만/400만/500만원 calculation as a current-data comparison, not as an observed hiring repeat or salary action.

Both variants then separate:

- what the current data shows;
- what has not been approved;
- the scope, amount or range, approver, and review point required for a reusable company rule;
- one concrete company action with owner and due event.

If the reviewed answer cannot support a calculation, Screen 3 states what is missing and offers a follow-up action. It does not preserve an old subject's repeat, decision, or result copy.

### Screen 4 copy behavior

The result summarizes reviewed subjects from structured state. Each row keeps:

- 확인된 내용;
- 확인한 설명;
- 확인된 근거 또는 추가 확인 자료;
- 이번에 정한 사항;
- 담당자;
- 완료 또는 재검토 시점.

`대표님 설명` is standardized to `확인한 설명` to keep the organization condition separate from personal blame while preserving the founder as the decision participant.

The result includes the Designer clean statement as bounded context and keeps these non-claims visible:

- individual appropriate salary or raise amount was not decided;
- a higher-paid employee was not judged wrong;
- GTM comparison amounts are not recommended raises or an approved company standard.

## Component And Data Boundaries

### View-model boundary

Replace the Product-only view-model entry point with an active-subject view model. Shared output types remain stable for screens. Role-specific factories own only content that differs:

- tenure-comparison factory for Product Engineer and Platform Engineer;
- level-order factory for GTM;
- clean-group factory for the non-selectable Designer statement.

Factories consume canonical rows, themes, reviews, repeats, decisions, and copy keys. They do not call detectors or recalculate theme selection.

### Visualization boundary

`SalaryDistribution` remains responsible for salary-by-tenure presentation. A focused `LevelOrderDistribution` owns the GTM level view. Neither component decides which subject is active or writes founder conclusions.

### Subject-selection boundary

A subject-selector component receives selected themes, the active ID, and `onSelect`. It dispatches `SELECT_THEME`. It does not own review completion or route state.

### Report boundary

Screen 4 continues to derive output from current structured state. Subject switching does not write a report. The result contains one row for each of the three selected subjects: answered subjects show only current validated content, while unanswered subjects show an explicit `확인 필요` state and no inferred explanation or decision. The existing unselected-subject appendix remains available for non-sample inputs; the Designer clean statement is separate because Designer has no sample theme to append. Review changes invalidate only the changed theme's dependent interpretation, repeat, decision, and report outputs through the existing reducer contract.

## Error, Empty, And Privacy States

- Empty or malformed paste keeps the original text-clearing and block behavior.
- Guidance emphasizes the required header row before input. Parser behavior is unchanged.
- Column-consent UI names only excluded headers and never renders values.
- Product-only facilitated intake continues to reject unsupported role rows.
- A selected subject with missing comparison evidence renders the existing insufficient-data state and no invented chart or amount.
- A calculation that is unavailable renders the reason and the next evidence to collect.
- Ending the session clears rows, reviews, repeats, decisions, report, and active subject exactly as today.

## Accessibility And Responsive Contract

- Subject tabs are keyboard-operable buttons with `aria-pressed` or an equivalent tab pattern.
- Subject change moves focus to the selected conclusion heading.
- Dynamic consent, blocked, confirmation, and recalculation states remain announced through a polite live region.
- Focus rings match the approved Decision Room treatment.
- At 1280x720 and 1440x900 the order remains conclusion, evidence, comparison, question, next action with no horizontal page overflow.
- At 390px, subject controls stack, charts remain legible, tables scroll only inside their containers, and all primary actions remain full-width and visible after their content.
- Screen 2 trend and guide-line labels remain distinguishable without color alone.

## Test-Driven Implementation Contract

Implementation begins with failing tests for:

1. shared preparation/Decision Room copy and token ownership;
2. the exact preparation guidance and privacy copy;
3. three selected subjects and enabled in-place switching;
4. subject-specific view models and no duplicate headline pair;
5. Product/Platform tenure visualization and GTM level-order visualization;
6. exact GTM `4,000,000 / 4,000,000 / 5,000,000` meanings;
7. the Designer bounded clean-state statement;
8. at most two supporting observations per subject;
9. subject-scoped review state, focus movement, and dependency invalidation;
10. final reviewed-subject rows and unselected/clean context;
11. no founder-facing detector terms, row IDs, recommendation claims, or copied HR Prism literals;
12. 1280x720, 1440x900, and 390px overflow and keyboard behavior.

After focused tests, run fresh:

```text
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

Stale Task 9 or P11-B0 results are not completion evidence.

## Acceptance Criteria

- Preparation and the four Decision Room screens visibly belong to the same product.
- The approved Product Engineer layout, chart coordinates, calculation, and flow remain intact.
- Screen 2 switches Product Engineer, Platform Engineer, and GTM in place with focus on the new conclusion.
- Screen 3 uses the same subject selector and never presents one subject's calculation or decision under another subject label.
- Each subject states who is compared, the observed amount, the current-data limitation, and the requested explanation or decision.
- GTM renders the exact 400만/400만/500만원 contract with three distinct meanings and a visible non-claim.
- Designer renders as a bounded clean state, not a selectable finding or proof of overall correctness.
- No screen renders detector labels, row IDs, market-average language, recommended salary, normal raise rate, or approved-policy implications.
- Supporting observations are capped at two per subject.
- Screen 4 contains the three selected subjects with explicit pending states where review is incomplete, retains the unselected-subject appendix contract, and shows Designer separately as clean context.
- Review, repeat, decision, and result state remain subject-scoped and stale outputs disappear after a dependency change.
- All fresh automated, browser, governance, and diff checks pass before implementation completion is claimed.

## Commit And Review Boundary

This specification is committed alone. Product code is not staged or committed as part of the design commit. After written-spec approval, a separate implementation plan will define TDD checkpoints, exact files, verification commands, and the Task 10 product commit boundary.
