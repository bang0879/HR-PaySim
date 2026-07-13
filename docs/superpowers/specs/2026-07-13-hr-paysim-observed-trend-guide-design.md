# HR PaySim Observed Trend And Direction Guide Design

## Status

Approved structural design for the Task 9 Product Engineer evidence visualization. Visual styling remains intentionally deferred.

This design supersedes only the axis orientation and point-label anchoring sections of `2026-07-13-hr-paysim-tenure-axis-neutral-copy-design.md`. It preserves that document's neutral copy, all-employee coverage, missing-tenure handling, four-screen flow, three primary actions, state invalidation, human STOP GATE, and commit boundary.

## Scope

This correction applies only to the existing Screen 2 Product Engineer vertical slice.

It does not:

- add a market benchmark;
- estimate a correct or recommended salary;
- declare an employee overpaid or underpaid;
- infer why the observed pattern exists;
- change review, repeatability, decision, or report state;
- complete the human comprehension gate;
- authorize Task 10;
- finalize colors, spacing, stroke styles, or label typography.

## Problems To Correct

### Point and label misalignment

The current plot applies the factual coordinate to a container that includes the point, employee label, and salary label. The CSS `bottom` value therefore anchors the bottom of the whole label group instead of the center of the point. A point can appear above or outside the location indicated by its tenure tick even though the underlying percentage is correct.

Point position and label position must be independent:

- the point center owns the factual tenure and salary coordinate;
- the point never moves to avoid a collision;
- the employee label may use a bounded visual offset;
- any offset label remains visibly associated with its point;
- a label must not be mistaken for the plotted coordinate.

### Evidence without an immediate reading aid

Showing six correct positions is still only a factual distribution. The participant must mentally infer how salary changes across the tenure axis. Screen 2 needs a restrained visual hint that exposes the current direction without turning it into a benchmark, causal conclusion, or company rule.

## Chosen Structure

Use the approved C structure.

### Axes

- Horizontal axis: actual tenure in months.
- Vertical axis: current base salary in won, formatted in 만원.
- One point: one de-identified employee with both values.
- Highlighted points: the existing headline pair only.
- Rows without numeric tenure remain in the separate `근속 개월 확인 필요` list and do not receive a fabricated point.

This orientation follows the reading question: as tenure increases from left to right, how does the current base salary distribution move?

### Observed trend line

Draw one solid line calculated only from the employees currently plotted.

- Internal name: observed salary-tenure trend.
- Founder-facing label: `현재 6명의 관찰 추세` for the synthetic Product Engineer slice.
- Calculation: ordinary least-squares line where tenure months is `x` and base salary KRW is `y`.
- Input order must not change the result.
- The line uses only rows with finite salary and finite tenure.
- At least three valid rows and at least two distinct tenure values are required.
- If the line cannot be calculated, retain the points and display a plain insufficient-trend message. Do not invent a slope.
- The line establishes a description of the current plotted data only. It does not establish cause, fairness, market position, or an expected salary.

For the fixed synthetic Product Engineer data, the factual supporting sentence is:

> 현재 6명의 점을 한 줄로 요약하면, 근속 개월이 늘어나는 쪽에서 기본 연봉이 낮아지는 방향입니다. 이 자료만으로 그 원인이나 적정 연봉을 판단할 수는 없습니다.

This sentence must be derived from the plotted employee count and observed slope direction rather than stored as an unrelated narrative block.

### Neutral direction guide

Draw a visually distinct dashed guide from the lower-left toward the upper-right of the plotting area.

- Founder-facing label: `근속 개월과 기본 연봉이 함께 증가하는 방향`.
- It is a normalized reading-direction guide, not a line fitted to salary values.
- It must not expose a salary, percentage raise, annual growth rate, midpoint, or intercept.
- It must not be labeled `정상`, `통상`, `시장`, `기대`, `권장`, `적정`, or `회사 기준`.
- It must remain visually distinguishable from the solid observed line without relying on color alone.

The following non-claim appears as a separate visible note immediately below the plot, not inside a tooltip:

> 파란 점선은 시장 평균이나 권장 연봉, 회사의 연봉 기준이 아닙니다. 근속 개월과 기본 연봉이 함께 증가하는 방향을 읽기 위한 시각적 안내입니다.

If the final visual design does not use blue, the copy must replace `파란 점선` with an unambiguous style label that matches the rendered guide. The structural requirement is a separately visible non-claim, not a fixed color.

## Claim And Governance Boundary

The two lines have different evidence status and must never be merged in copy or accessibility text.

| Element | Basis | Allowed meaning | Forbidden meaning |
|---|---|---|---|
| Employee points | Current roster fields | Factual salary and tenure coordinates | Correct salary or employee evaluation |
| Solid observed line | Deterministic calculation from current plotted rows | Compact description of the displayed distribution | Cause, policy, fairness, prediction, benchmark |
| Dashed direction guide | Static normalized visual guide | Direction in which both axes increase | Typical raise path, market average, approved company rule |
| Separate non-claim | Product copy SSOT | Defines the dashed guide's limit | Hidden disclaimer or facilitator-only explanation |

This applies `DP-02`, `DP-03`, `DP-04`, and `DP-05` locally. It adapts `CASE-02`, `CASE-05`, `CASE-10`, and `CASE-14` without copying Prism UI or benchmark formulas.

The visual must make the contrast easy to notice, but it must not manufacture shock through red warnings, danger labels, or copy such as `정상과 완전히 다릅니다`.

## Component And Data Boundaries

The pure plot model owns:

- tenure-domain and salary-domain ticks;
- employee point coordinates;
- missing-tenure partitioning;
- observed line calculation and availability;
- observed slope direction for factual supporting copy;
- normalized direction-guide endpoints.

The React component owns:

- accessible rendering of axes, points, lines, labels, and notes;
- bounded label offsets or later collision handling;
- visual distinction between points, observed line, and guide;
- the deferred design layer.

The founder-copy SSOT owns:

- the observed-line label;
- the direction-guide label;
- the factual observed-direction sentence;
- the separate non-claim;
- the insufficient-trend state.

The component must not recreate these important meanings in local JSX.

## Deferred Visual Design

The following decisions are intentionally left for a later design pass:

- exact colors and contrast tokens;
- line weight and dash spacing;
- point size and highlight treatment;
- label typography and collision-layout polish;
- grid density;
- responsive spacing and chart height;
- legend layout.

The later design pass may change these details but may not change the axis semantics, line meanings, separate non-claim, or point-coordinate ownership without a new product decision.

## Error And Edge States

- Fewer than three plotted rows: show points, hide both trend interpretation and solid line, and state that the available rows are insufficient to summarize a direction.
- One distinct tenure value: show the employees at that tenure, hide the solid line, and state that a tenure-direction comparison cannot be calculated.
- Missing tenure in some rows: exclude those rows from the trend and retain them in `근속 개월 확인 필요`.
- Missing tenure in every row: use the existing insufficient-data state and retain the evidence table.
- Equal salary values: the observed line may be horizontal and must not be described as increasing or decreasing.
- Non-finite values: fail closed and never emit an invalid SVG/CSS coordinate.

## Tests

Focused tests must prove:

1. `x` changes with tenure and `y` changes with salary after the axis swap.
2. Every valid employee point center resolves to its factual coordinate independent of label dimensions.
3. The least-squares observed line is deterministic and input-order independent.
4. The fixed Product Engineer line slopes downward as tenure increases.
5. Fewer than three valid points or one tenure value produces an unavailable trend.
6. Missing-tenure rows remain visible outside the plot and do not enter the trend calculation.
7. The normalized dashed guide contains no salary, raise percentage, benchmark, or company-rule parameter.
8. The separate non-claim and observed-data limitation resolve from the founder-copy SSOT.
9. Founder-facing text does not call the guide normal, typical, market, expected, recommended, appropriate, or a company standard.
10. Existing four-screen navigation, three clicks, focus, invalidation, copy, storage, and session clearing remain intact.

## Browser QA And Human Gate

Browser QA at 1280×720, 1440×900, and 390px must additionally confirm:

- the center of every plotted point aligns with its computed coordinate within a small pixel tolerance;
- no point is outside the plotting area because of its label dimensions;
- both lines and their different labels are visible without color-only dependence;
- the separate non-claim is visible without opening a tooltip;
- the original first-viewport comparison, 2,700만원 gap, and next check remain visible;
- no horizontal overflow or label/CTA overlap occurs.

The earlier comprehension attempts remain failed evidence. After implementation and fresh automated verification, restart the N≥2 five-second gate. In addition to the existing three questions, record whether any participant interprets the dashed guide as a market average, a normal raise rate, or an approved company rule. Any such interpretation fails the gate.

## Verification And Commit Boundary

Run the existing Task 9 verification suite plus focused trend-model and coordinate-alignment tests.

Task 9 implementation remains uncommitted until the repeated human gate passes. This design document may be committed independently. Task 10 remains blocked until Task 9 passes, is committed, and receives independent review.
