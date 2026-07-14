# HR PaySim Career-Aware Comparison Design

## Status

Approved written specification for implementation as of 2026-07-14.

This design records the user's 2026-07-14 correction that company tenure alone is not a sufficient salary-comparison basis. It supplements the canonical four-screen design and supersedes its tenure-only pair eligibility, Screen 2 salary-tenure plot, and facilitator input assumptions that omit relevant career experience. It does not authorize product code changes by itself.

## Superseded Portions

For the subjects and fields explicitly named here, this design supersedes:

- the tenure-axis and missing-tenure portions of `2026-07-13-hr-paysim-tenure-axis-neutral-copy-design.md` while preserving neutral copy, all-employee coverage, four-screen flow, human comprehension gate, and commit boundary;
- the observed-trend x variable, endpoints, missing-field label, and fixed direction-guide portions of `2026-07-13-hr-paysim-observed-trend-guide-design.md` while preserving OLS, minimum-sample, determinism, point/label separation, and non-claim rules;
- the direction-guide hierarchy and legend portions of `2026-07-13-hr-paysim-screen-2-chart-visual-clarity-design.md` while preserving its plot surface, point, label, responsive, and accessibility treatment;
- the Product Engineer and Platform Engineer tenure-chart portions of `2026-07-13-hr-paysim-task10-copy-visual-coherence-and-remaining-subjects-design.md` while preserving GTM's ordered-level visualization and the approved subject, state, copy, and four-screen contracts;
- the P11-B0 required-input, normalized-confirmation, and supported-session requirements that assume tenure but omit relevant experience.

The guided Excel workbook, source ownership, sheet selection, and privacy lifecycle remain governed by `2026-07-14-hr-paysim-local-file-import-design.md`. Unnamed contracts remain in force.

## Goal And Boundary

HR PaySim asks whether a material internal salary difference between comparable employees has a documented explanation. It does not calculate a correct salary, market salary, recommended adjustment, performance rating, or legal conclusion.

The comparison order is:

1. same role group;
2. ordered job level when supplied; role scope remains explanation evidence rather than an inferred rank;
3. relevant career experience;
4. company tenure as a secondary internal-progression signal.

Relevant experience means completed work directly related to the current role group across current and previous companies. Company tenure means all completed months employed by the current company. The UI calls them `관련 경력` and `회사 근속` and never merges them into a vague `경력` label.

## Chosen Approach

Use a pairwise dominance rule instead of an arbitrary career band.

For a lower-paid employee `A` and higher-paid employee `B`, a direct tenure-based comparison requires:

- the same `roleGroup`;
- valid `relevantExperienceMonths`, `tenureMonths`, and `baseSalaryKRW` for both rows;
- `A.relevantExperienceMonths >= B.relevantExperienceMonths`;
- `A.tenureMonths > B.tenureMonths`;
- when structured levels exist, both rows have `levelRank` and `A.levelRank >= B.levelRank`;
- the existing material salary-gap threshold is met;
- documented-exception and counteroffer flags are evidence cues and never exclude an otherwise eligible raw pair.

If one employee has more relevant experience while the other has more company tenure, neither dominates the other and no direct inversion is emitted.

This is comparison eligibility, not a rule that each additional month deserves a fixed increase.

### Ordered-level activation

`levelRank` increases with organizational level: a larger number means an equal or higher ordered level.

For the rows in one role group that otherwise have valid salary, relevant-career, and tenure evidence, ordered-level comparison has exactly three states:

- no row has a structured rank: compare relevant career and tenure without a level predicate;
- every eligible row has a valid rank from one shared mapping: activate the level predicate for every direct pair;
- rank evidence is partial or incompatible: emit no direct career-tenure pair for that role group.

Free-text `levelLabel` values remain display-only and are never ordered lexically. The current synthetic GTM fixture is the only existing canonical shared mapping. The Product Engineer guided template does not create `levelRank` from its optional free-text `레벨` column.

This contract removes the existing `hasFormalLevels(rows) -> skip tenure detectors` behavior. Level, relevant experience, and tenure are evaluated through one comparable-pair predicate.

### Required example behavior

A new employee with ten years of relevant experience and a four-year-company employee with four years of relevant experience do not form a tenure-based inversion merely because the new employee is paid more. A lower-paid, longer-tenured employee can become a candidate only when their relevant experience and available ordered level are also not lower.

A higher-paid employee is never labeled wrong. The product asks whether role, hiring, performance, or documented-exception evidence explains the observed difference.

### Documented exceptions

`exceptionFlag` and `counterOfferFlag` do not remove a factual comparison from raw detector output or subject selection. They appear as explanation and evidence inputs. A reviewed `documented` state may establish that the difference has supporting evidence, but the comparison remains traceable in the session and report.

V1 has no complete structured exception record with scope, approval, effective event, and review boundary. Therefore this package does not automatically hide or deprioritize a pair as `fully explained`. Such visible-review exclusion requires a separate approved record contract and is out of scope.

### Rejected alternatives

- Keeping tenure as the chart axis with a disclaimer still teaches tenure as the expected salary order.
- Fixed experience bands would create unsupported compensation-policy boundaries.
- Separate career and tenure charts add visual choice to an already dense screen.
- Market pricing or salary recommendation is outside PaySim's evidence boundary.

## Detector Contract

### `pay_inversion`

Replace the tenure-only predicate with one shared comparable-pair predicate implementing the role, career, tenure, materiality, and active ordered-level rules above. Remove the current formal-level early return. Preserve the salary-gap calculation and materiality threshold.

### `loyalty_tax`

Keep the existing long-tenure and recent-hire windows, but build `comparisonPairs` only through the shared comparable-pair predicate. Every endpoint of every pair must satisfy the same-role, relevant-experience, tenure, materiality, and active ordered-level rules.

Emit the repeated-pattern finding only when supported pairs cover at least two distinct long-tenured rows and two distinct recent-hire rows. Derive `affectedRowIds` only from supported pair endpoints. Calculate long-tenure and recent-hire averages from the distinct supported endpoints; a broader cohort average may appear only as separately labeled distribution context and cannot establish comparability or replace the supported-pair requirement.

### `shadow_band`

Salary clusters may remain a distribution observation. A highlighted pair crossing clusters must satisfy the comparable-row boundary. A cluster split without a supported pair remains a lower-claim distribution observation.

### `level_fiction_band_overlap`

Keep the current ordered-level detector. Add relevant experience to visible evidence without letting experience silently rewrite the supplied level order.

Rows missing relevant career may remain in safe row counts and salary-distribution context but cannot enter tenure-based pair findings. The engine never falls back to tenure-only comparison. If no supported pair remains, show `비교 근거 부족` or a distribution-only state instead of selecting an unsupported pair.

## Screen 2 Evidence Contract

### Visualization applicability

The relevant-experience salary plot applies to `pay_inversion`, `loyalty_tax`, and pair-backed `shadow_band` subjects. Product Engineer and Platform Engineer use this plot when their selected subject is backed by a supported pair.

`level_fiction_band_overlap` retains the ordered-level visualization. Relevant experience appears as secondary evidence in its table and accessible description but never replaces the level axis. GTM therefore remains an ordered-level subject.

### Plot

- Horizontal axis: `관련 경력년수` derived from `relevantExperienceMonths`.
- Vertical axis: existing annual base salary values and formatting.
- Dots: rows with finite salary and nonnegative relevant experience.
- Highlight labels: only selected comparison rows, including company tenure.
- Accessible comparison evidence: relevant career, company tenure, ordered level when available, and base salary.

Calculate the observed trend by ordinary least squares with `relevantExperienceMonths` as x and `baseSalaryKRW` as y. Require at least three valid rows and at least two distinct relevant-experience values. Input order must not affect the result.

Let `xStart = minX + 0.15 * (maxX - minX)` and `xEnd = maxX - 0.15 * (maxX - minX)`. Evaluate the fitted line only at those x values. If the fitted segment crosses the salary plot boundary, clip the segment geometrically to the rectangular plot domain while preserving its slope; never clamp the two y endpoints independently. Do not calculate or render outside the observed x domain.

Remove the fixed blue direction guide. It can be mistaken for a market average, standard raise rate, recommended salary, or approved company standard. The legend may contain only `실제 직원`, `이번 비교`, and `현재 자료의 관찰 추세` when the trend is supportable.

Rows with valid salary but missing relevant experience remain visible in a `관련 경력 확인 필요` list immediately below the plot. Each item shows only the session-local employee label, salary, and available company-tenure or ordered-level evidence. It never receives a fabricated x coordinate. If every row lacks relevant experience, replace the plot with an insufficient-comparison state while retaining salary-distribution context and the evidence table.

### Conclusion and evidence table

The conclusion names the shared role, factual gap, relevant-career relationship, company-tenure relationship, level relationship when available, and why the difference still needs an explanation.

The compact evidence table places `관련 경력` before `회사 근속` and keeps `기본연봉` visible. Title, level, and documented exceptions appear only when they contribute to the comparison or explanation.

Required non-claim meaning:

> 이 비교는 두 직원의 적정 연봉을 계산하거나 더 높은 연봉이 잘못됐다고 판단한 결과가 아닙니다. 현재 자료에서 비교 가능한 조건을 확인한 뒤, 차이를 설명하는 회사 기준이나 기록이 있는지 묻는 근거입니다.

## Data And Preparation Contract

Add `relevantExperienceMonths?: number` to `NormalizedRosterRow`.

- The guided facilitator path and synthetic decision-room fixture require it.
- The domain field remains optional so missing evidence can be represented and fail closed.
- Detectors never infer it from age, graduation year, title, company tenure, or level.
- Normalization converts facilitator-entered relevant career years to months once.
- Reports and exports use normalized months and never re-derive experience from prose.

The 16-row synthetic fixture gains explicit relevant-experience values. It must preserve seven raw findings, three visible review subjects, one Designer clean group, and zero duplicate visible headline pairs. Product Engineer `row_004` and Platform Engineer `row_009` retain their exception flags as explanation evidence; those flags do not remove their existing headline pairs. The lower-paid rows must satisfy the new dominance rule.

The guided Excel template requires:

| Header | Meaning | Accepted value |
|---|---|---|
| `기본연봉(원)` | Current annual base salary | whole-number KRW, commas allowed |
| `관련 경력년수` | Relevant Product Engineer experience across current and previous companies | number from 0 through 60; decimals allowed |
| `회사 근속개월` | Completed months employed by the current company | whole number from 0 through 720 |

Normalize `관련 경력년수` with `Math.round(years * 12)`. Do not reject a row merely because company tenure exceeds relevant experience; an internal role change can make that valid.

Optional fields remain `직함`, `레벨`, `문서화된 예외`, and `카운터오퍼 여부`. The template's free-text `레벨` is display-only and never creates `levelRank`.

The guided template never requests `rowId` or `roleGroup`. After all-or-nothing validation, the local adapter assigns `roleGroup = "Product Engineer"` and generates `file_row_001`, `file_row_002`, and so on from accepted nonblank source-row order. These session-local system IDs are not employee IDs, never render, and never export.

The exact seven Korean headers in the companion Excel design are the only accepted local-adapter headers; there are no additional Korean aliases. Fully blank rows are ignored. Any nonblank row with a blank required cell fails closed. Salary accepts a finite whole-number cell or a comma-formatted whole-number string. Relevant career accepts a finite number or plain decimal string from 0 through 60; strings containing `%` or unit text are rejected. Company tenure accepts a finite whole number or integer string from 0 through 720. Optional yes/no fields accept only blank, `예`, or `아니오`.

Formula cells are unsupported by the selected reader and are never evaluated. A formula cell used by any accepted field fails as missing or malformed. Excel and paste use the same Korean adapter, value rules, row ordering, PII checks, generated-ID rules, and canonical normalization. Sheet selection remains exactly as specified in the companion Excel design.

## Privacy And Claim Boundaries

- Relevant experience does not request employer names, employment dates, education, age, or identity.
- The template prohibits names, employee IDs, previous employer names, graduation or birth years, and free-form career histories.
- Workbook and paste data keep the existing local-only, in-memory, fail-closed lifecycle.
- No line or finding is described as a market average, usual raise rate, recommended salary, approved company rule, or legal conclusion.
- Observed-trend copy states that it uses only the currently entered rows.
- Missing comparison evidence blocks or lowers the claim; it is never imputed.

## Error And Empty States

| Condition | Response |
|---|---|
| Missing or malformed relevant career | Show safe row numbers and `관련 경력년수`; never echo values. |
| Partial or incompatible ordered-level evidence | Keep distribution context and emit no direct career-tenure pair for that role group. |
| Career and tenure point in opposite directions | Do not emit an inversion. |
| No supported pair remains | Show `비교 근거 부족` or a distribution-only result. |
| Fewer than three valid rows or fewer than two distinct career values | Omit the observed trend and explain the limitation. |
| Some rows lack relevant career | Keep them in `관련 경력 확인 필요` without a fabricated coordinate. |
| Every row lacks relevant career | Replace the plot with insufficient comparison while retaining salary context and the evidence table. |
| Facilitator input lacks a required field | Block session start and require corrected local input. |

## Testing And Verification Design

Implementation follows test-driven development.

- Parser tests cover exact Korean headers, generated IDs and fixed role, row ordering, blank and formula cells, numeric/string/percentage forms, sheet selection, and identical Excel/paste normalization.
- Detector tests reject the user's ten-year-new-hire example, accept a dominated comparator, reject conflicting dimensions, cover no/complete/partial level states, remove the formal-level early return, and prove exception flags never delete raw pairs.
- Loyalty tests require every supporting pair to pass the shared predicate, derive affected rows from supported endpoints, and require at least two distinct employees on each side before claiming a repeated pattern.
- Plot tests prove OLS, minimum sample, distinct x values, input-order independence, exact 15/85-percent endpoints, slope-preserving boundary clipping, missing-career coverage, and removal of the fixed guide.
- Visualization tests keep GTM on the ordered-level view and apply the career plot only to the named relationship subjects.
- Fixture tests preserve the seven findings, three subjects, clean Designer group, exception-backed headline pairs, and zero duplicate pairs.
- Flow tests preserve the four screens, review state, repeat calculation, report derivation, privacy lifecycle, routes, and explicit session end.
- Browser QA repeats comprehension, accessibility, overflow, focus, keyboard, console, all-employee coverage, and privacy checks with the new evidence model.

Fresh verification commands:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run build:facilitator
node --experimental-strip-types scripts/verify-facilitator-privacy.ts
node scripts/verify-route-exposure.mjs
node scripts/qa-decision-room.mjs --surface=facilitator-local
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

## Scope

In scope for one implementation plan:

- normalized relevant-experience field;
- synthetic fixture and guided Excel contract;
- tenure-based detector eligibility;
- Screen 2 axis, shortened observed trend, legend, labels, evidence table, and non-claim copy;
- deterministic, privacy, accessibility, comprehension, and browser regression tests.

Out of scope:

- market data, salary recommendations, adjustment budgets, or legal conclusions;
- performance scoring, skill assessment, generic job architecture, or automatic level mapping;
- additional founder screens, chart toggles, or a second tenure chart;
- Task 12, deployment, authentication, public self-service, or pilot evidence claims.

## Acceptance Criteria

- The ten-year relevant-experience new hire is never flagged solely because another employee has longer company tenure.
- Every headline and supporting comparison pair in a tenure-based finding satisfies the same-role, relevant-experience, tenure, salary-materiality, and active ordered-level rules.
- Exception and counteroffer flags remain traceable evidence and never delete raw comparisons.
- No, complete, and partial ordered-level states produce the explicitly defined behavior; larger `levelRank` means higher level.
- A loyalty repeated-pattern claim covers at least two distinct long-tenured and two distinct recent-hire employees through supported pairs.
- Missing or conflicting evidence fails closed without a fallback pair, fabricated coordinate, or silently omitted employee.
- Relationship subjects use relevant career on the horizontal axis and company tenure as secondary evidence; GTM keeps its ordered-level visualization.
- One deterministic OLS trend appears only with at least three valid rows and two distinct career values, uses the 15/85-percent x endpoints, and preserves slope when clipped. The fixed blue guide is absent.
- The facilitator sees the definition of relevant experience before downloading or importing the template.
- The template requires salary, relevant career years, and company tenure, generates system IDs and fixed role locally, and requests no identity or free-form work history.
- Existing calculation amounts, materiality threshold, four-screen flow, review state, repeat logic, privacy lifecycle, and report derivation remain unchanged unless explicitly named above.
- No screen or export claims a correct salary, market average, standard raise rate, approved company rule, or legal conclusion.

A percentage-formatted numeric Excel cell is indistinguishable from a plain numeric cell through the selected reader. The adapter therefore interprets its underlying numeric value as years, and the safe confirmation must expose the normalized result before session start.
