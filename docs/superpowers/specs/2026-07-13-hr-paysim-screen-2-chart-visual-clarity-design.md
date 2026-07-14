# HR PaySim Screen 2 Chart Visual Clarity Design

## Status

Approved direction for a bounded Task 9 visual-clarity pass. The written specification is pending final user review before implementation planning.

This design refines only the presentation of the existing salary-tenure chart. It does not change the approved axes, point coordinates, observed-trend calculation, direction-guide meaning, founder copy, review state, or four-screen flow.

For this chart only, it supersedes the visual-style deferral in `2026-07-13-hr-paysim-observed-trend-guide-design.md` for plot surface, line weight, dash spacing, point treatment, label treatment, grid density, responsive chart spacing, and legend layout. Whole-app typography, card-system, and brand polish remain deferred.

## Goal

Make the Screen 2 chart feel like a deliberate part of the current HR PaySim decision room rather than a rough engineering plot. A founder should immediately distinguish:

1. the six factual employee points;
2. the solid line summarizing the current six points;
3. the dashed guide showing only the direction in which both axes increase;
4. the highlighted employee pair used in the 2,700만원 comparison.

The pass should improve comprehension and perceived finish before the repeated human gate. It is not the later whole-product visual redesign.

## Chosen Direction

Use a restrained analytical-card treatment that matches the existing app:

- white and blue-soft surfaces;
- deep navy for primary evidence;
- product blue for active or highlighted evidence;
- cool gray for supporting points and grid lines;
- rounded corners, light borders, and low-opacity shadows;
- no red, warning treatment, dramatic glow, or shock copy.

Two alternatives remain rejected for this pass:

- a high-drama chart that visually declares the pattern abnormal;
- deferring every visual correction until the later whole-app design pass.

The chosen middle path resolves comprehension-affecting roughness now while leaving brand-level polish for later.

## Visual Hierarchy

The chart uses this order of emphasis:

1. highlighted employee pair;
2. solid observed trend;
3. remaining employee points;
4. dashed direction guide;
5. grid and axes.

The observed line is stronger than the guide, but it must not obscure employee points. Points remain the factual evidence; both lines are aids for reading those points.

## Plot Surface

- Keep the current factual plotting area and coordinate math unchanged.
- Replace the bare two-axis plot appearance with one soft inset surface.
- Use `--dr-line` for a full light border, a 14px corner radius, and `--dr-soft` for the blue-gray background.
- Use sparse quarter-grid lines rather than a single heavy center cross.
- Keep grid contrast below axes, points, and both trend lines.
- Do not add another surrounding card. The distribution panel already owns the section.
- Do not add padding inside the coordinate system because that would change point-center alignment.
- Keep label overflow visible while the factual point center remains inside the plot.

## Line System

### Solid observed trend

- Use `--dr-ink` for the deep-navy stroke.
- Use a 3px stroke, slightly heavier than the current implementation.
- Rounded caps for a finished analytical appearance.
- Do not add a confidence band, glow, or shadow around the line.
- Founder-facing meaning remains `현재 6명의 관찰 추세`.

### Dashed direction guide

- Use `--dr-blue` at 72% opacity and a 2px stroke, lower in intensity than the observed line.
- Use a 7px/6px dash pattern with rounded caps so it remains distinguishable without color.
- No arrowhead, benchmark band, percentage marker, endpoint value, or annual-raise annotation.
- Founder-facing meaning and separate non-claim remain unchanged.

The two lines must never share the same weight and dash pattern.

## Employee Points And Labels

- Non-highlighted points use `--dr-muted` with a white inner border and a muted outer ring.
- The highlighted pair uses `--dr-blue` with a white inner border and a `--dr-ink` outer ring.
- Highlighting changes size and ring treatment, not factual coordinates.
- Employee labels become compact white label chips with a light border and minimal shadow.
- Labels retain the existing bounded left/below offsets and never move their associated point.
- Highlighted labels use a `--dr-blue` border and stronger employee-name weight, without adding new text.
- Labels remain visually connected to their points by proximity. Leader lines are not added in this pass.

## Legend, Summary, And Non-Claim

- Render legend items as compact inline keys using the same solid and dashed stroke styles as the chart.
- Give the observed-trend key more contrast than the direction-guide key.
- Keep the factual trend summary as a calm neutral statement directly below the legend.
- Keep the guide non-claim in a separate blue-soft note with a slim blue accent.
- The note must remain visible without interaction but should not visually overpower the observed summary.
- Do not duplicate important copy outside `founderCopy.ts`.

## Responsive Behavior

At 1280×720 and 1440×900:

- preserve the existing gaze order and first-viewport cues;
- avoid making the chart materially taller;
- keep axes, plot, legend, summary, and non-claim visually grouped.

At 390px:

- keep the current 260px plot height;
- reduce label-chip padding and plot side margins before reducing text size;
- keep all labels inside the distribution panel;
- allow legend items to wrap;
- preserve zero horizontal overflow and point-center alignment.

## Accessibility And Claim Boundary

- Solid versus dashed style carries line meaning independently of color.
- Highlighted versus standard points differ by size and ring treatment independently of color.
- Existing ARIA labels and descriptions remain connected to the plot.
- Contrast must remain readable against the soft plot surface.
- The visual must not imply market position, normal raise progression, correct salary, unfairness, or an approved company rule.
- This remains a local application of `DP-02`, `DP-03`, `DP-04`, and `DP-05`.

## Implementation Boundary

Expected product files:

- `src/features/confirmed-pay-differences/SalaryDistribution.tsx`
- `src/features/decision-room/decisionRoom.css`
- `tests/hr-paysim/decision-room-ui.test.ts`
- `scripts/qa-decision-room.mjs`

The pure plot model and founder copy do not change in this pass. An actual accessibility or test-contract gap requires a separate product decision before expanding scope. No state, calculation, route, report, or Task 10 file belongs in this pass.

## Verification

Focused checks must prove:

1. the chart exposes distinct classes for the plot surface, observed line, guide, standard points, highlighted points, labels, legend, summary, and non-claim;
2. neither line meaning is duplicated as local JSX copy;
3. point-center browser alignment remains within 2.5px at all three viewports;
4. both lines, both labels, and the separate non-claim are visible;
5. no label, chart, or CTA creates horizontal overflow;
6. Screen 2 first-viewport cues, 2,700만원 conclusion, three-click flow, focus, invalidation, copy, storage, and session clearing remain intact;
7. lint, all tests, typecheck, build, browser QA, governance verification, and `git diff --check` pass fresh.

After automated verification, generate a new 1280×720 first-viewport image and restart the N≥2 human comprehension gate. Task 9 remains uncommitted until that gate passes.
