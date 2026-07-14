# Final Design Pixel Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every HR PaySim app screen match the approved final design pixel-for-pixel while keeping the screens implemented as real, interactive UI instead of static image overlays.

**Architecture:** Keep the current static HTML/CSS/vanilla JS prototype as the production surface for this pass. Convert the approved design into a screen-by-screen reference pack, then update DOM structure, CSS tokens, component styles, and interaction states until captured app screenshots match the references at desktop and mobile breakpoints. Use screenshots and pixel-diff review as the acceptance mechanism, with manual interaction checks to prove the UI remains functional.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, browser screenshot QA through Codex/browser or Playwright-capable runtime, and local image comparison artifacts.

---

## Current Codebase Map

- Modify: `prototypes/hr-paysim-redesign/index.html`
  - Owns the persistent shell: sidebar, topbar, live screen region, footer controls, document metadata, and static text outside the dynamic screen renderers.
  - Current issue: some Korean text in this file is mojibake and must be replaced with valid Korean copy when syncing the final design.
- Modify: `prototypes/hr-paysim-redesign/styles.css`
  - Owns all visual layout, tokens, component styling, breakpoints, and state styling.
  - This will carry most of the pixel-matching work.
- Modify: `prototypes/hr-paysim-redesign/app.js`
  - Owns the 8-step state machine, mode selection, stale/recalculate states, density toggle, reset/back/next controls, and all dynamic screen markup.
  - Current screen flow is real and interactive; preserve this behavior while restructuring markup to match the design.
- Create: `docs/hr-paysim/final-design-acceptance.md`
  - Records the final design source, screen list, viewport list, interaction states, visual tolerances, and sign-off checklist.
- Create: `prototypes/hr-paysim-redesign/design-references/`
  - Stores exported final-design PNGs or screenshots used for visual comparison.
- Create: `prototypes/hr-paysim-redesign/qa/`
  - Stores captured app screenshots, diff outputs, and QA notes generated during execution.

## Required Input Before Pixel Work

The final design is not present in this workspace yet. Before editing UI code, obtain one of these concrete references:

- The other Codex thread ID containing the approved final design.
- A Figma/Canva/design URL with view access.
- Exported PNG screenshots for every app state listed in Task 1.
- A zipped folder containing final desktop and mobile references.

Do not start visual restyling from memory. The approved design must be available in this session or copied into `prototypes/hr-paysim-redesign/design-references/`.

## Visual Acceptance Standard

- Desktop reference viewport: `1440x1024`.
- Tablet reference viewport: `1024x768`.
- Mobile reference viewport: `390x844`.
- Each of the 8 primary flow screens must have a reference and a captured app screenshot.
- Required interaction states:
  - Stepper: current, completed, locked, stale.
  - Entry mode options: selected and hover/focus-visible.
  - Footer controls: back disabled on first screen, next/completed label on final screen.
  - Form inputs: normal, focus, edited/stale downstream state.
  - Scenario card: default, primary/recommended, selected-for-comparison if included in final design.
  - Density toggle: only if the final design still includes the feature.
- Pixel diff target:
  - 0 mismatched layout-critical pixels for shell geometry, spacing, typography scale, and component positions.
  - Small anti-aliasing differences are acceptable only around text glyph edges and chart/SVG curves.
  - Any color, spacing, wrapping, or component-state mismatch must be fixed, not waived.

## Task 1: Import And Freeze Final Design References

**Files:**
- Create: `docs/hr-paysim/final-design-acceptance.md`
- Create: `prototypes/hr-paysim-redesign/design-references/README.md`
- Add assets under: `prototypes/hr-paysim-redesign/design-references/`

- [ ] **Step 1: Collect the approved final design source**

Ask for the other session link/thread ID or exported screenshots. If a thread ID is provided, read the final design notes and copy the visual references into this workspace. If screenshots are provided, save them under `prototypes/hr-paysim-redesign/design-references/`.

- [ ] **Step 2: Name references with stable screen IDs**

Use this exact naming convention:

```text
desktop-01-entry.png
desktop-02-intake.png
desktop-03-summary.png
desktop-04-diagnosis.png
desktop-05-scenarios.png
desktop-06-ai-check.png
desktop-07-comparison.png
desktop-08-memo.png
mobile-01-entry.png
mobile-02-intake.png
mobile-03-summary.png
mobile-04-diagnosis.png
mobile-05-scenarios.png
mobile-06-ai-check.png
mobile-07-comparison.png
mobile-08-memo.png
```

- [ ] **Step 3: Create the acceptance document**

Write `docs/hr-paysim/final-design-acceptance.md` with this structure:

```markdown
# HR PaySim Final Design Acceptance

## Design Source

- Source type: approved Codex thread, design link, or exported screenshot pack
- Source location: recorded URL, thread ID, or local folder path
- Approval date: 2026-07-03

## Required Screens

| Step | App State | Desktop Reference | Mobile Reference | Required Interactive Checks |
| --- | --- | --- | --- | --- |
| 1 | Entry / Mode Check | `desktop-01-entry.png` | `mobile-01-entry.png` | mode selection, reset |
| 2 | Data Intake | `desktop-02-intake.png` | `mobile-02-intake.png` | input focus, edited field marks downstream stale |
| 3 | Input Summary | `desktop-03-summary.png` | `mobile-03-summary.png` | inline next button |
| 4 | Diagnosis | `desktop-04-diagnosis.png` | `mobile-04-diagnosis.png` | stale-state trigger |
| 5 | Recommended Scenarios | `desktop-05-scenarios.png` | `mobile-05-scenarios.png` | scenario select |
| 6 | AI Check | `desktop-06-ai-check.png` | `mobile-06-ai-check.png` | conditional visibility |
| 7 | Decision Comparison | `desktop-07-comparison.png` | `mobile-07-comparison.png` | comparison cards |
| 8 | Decision Memo Preview | `desktop-08-memo.png` | `mobile-08-memo.png` | final next button label |

## Sign-Off Checklist

- [ ] Desktop screenshots match approved references.
- [ ] Mobile screenshots match approved references.
- [ ] No screen is implemented as a flat design-image overlay.
- [ ] Navigation works across all 8 steps.
- [ ] Mode selection updates shell copy and selected state.
- [ ] Input editing marks downstream steps stale.
- [ ] Reset returns the app to step 1 and HR Prism mode.
- [ ] Korean text renders without mojibake.
- [ ] Product exclusions from `docs/hr-paysim/00_product_thesis.md` are still respected.
```

- [ ] **Step 4: Commit reference import**

Run:

```bash
git add docs/hr-paysim/final-design-acceptance.md prototypes/hr-paysim-redesign/design-references
git commit -m "chore: add HR PaySim final design references"
```

Expected: commit succeeds with only design reference and acceptance-doc changes.

## Task 2: Normalize App Shell And Copy Encoding

**Files:**
- Modify: `prototypes/hr-paysim-redesign/index.html`
- Modify: `prototypes/hr-paysim-redesign/README.md`

- [ ] **Step 1: Replace mojibake shell text with valid Korean text**

Update the static copy in `index.html`:

```html
<h1>보상 의사결정 흐름</h1>
```

```html
<nav class="stepper" id="stepper" aria-label="8단계 진행 상태"></nav>
```

```html
<button class="icon-button" type="button" data-action="toggle-density" aria-label="시각 밀도 전환">
  <span aria-hidden="true">↕</span>
</button>
<button class="ghost-button" type="button" data-action="reset">처음으로</button>
```

```html
<button class="secondary-button" type="button" data-action="back">이전</button>
<div class="control-copy" id="controlCopy">필요한 내용을 확인하고 다음 단계로 넘어갑니다.</div>
<button class="primary-button" type="button" data-action="next">다음</button>
```

- [ ] **Step 2: Replace sidebar note copy**

Use this copy unless the approved final design provides different exact wording:

```html
<div class="rail-note">
  <strong>설계 원칙</strong>
  <p>첫 화면에서 모든 숫자를 보여주지 않고, 대표가 필요한 질문을 순서대로 따라가도록 구성합니다.</p>
</div>
```

- [ ] **Step 3: Correct README mojibake**

Replace the corrupted bullets with valid Korean:

```markdown
- Decision comparison with `얻는 것` and `감수할 것`
```

- [ ] **Step 4: Open the static app**

Open `prototypes/hr-paysim-redesign/index.html` in a browser.

Expected:
- No mojibake appears in the persistent shell.
- Stepper, footer, reset, density toggle, and navigation still work.

- [ ] **Step 5: Commit shell normalization**

Run:

```bash
git add prototypes/hr-paysim-redesign/index.html prototypes/hr-paysim-redesign/README.md
git commit -m "fix: normalize HR PaySim shell copy"
```

## Task 3: Convert Final Design Into CSS Tokens

**Files:**
- Modify: `prototypes/hr-paysim-redesign/styles.css`

- [ ] **Step 1: Extract design tokens**

From the final design reference, record exact values for:

```css
:root {
  --bg: value-from-final-design;
  --canvas: value-from-final-design;
  --surface: value-from-final-design;
  --text: value-from-final-design;
  --muted: value-from-final-design;
  --line: value-from-final-design;
  --accent: value-from-final-design;
  --accent-strong: value-from-final-design;
  --blue: value-from-final-design;
  --warning: value-from-final-design;
  --danger: value-from-final-design;
  --success: value-from-final-design;
  --shadow: value-from-final-design;
  --radius: value-from-final-design;
  --radius-sm: value-from-final-design;
  --rail-width: value-from-final-design;
}
```

- [ ] **Step 2: Replace placeholder token values with exact final design values**

Edit the existing `:root` block in `styles.css`; do not add duplicate token names lower in the file.

Expected:
- The app shell immediately reflects the final design palette, radius, shadows, and rail width.
- No old token value remains if the final design changed it.

- [ ] **Step 3: Verify the color theme is not a one-note palette**

Scan `styles.css` colors after editing.

Expected:
- The final palette matches the approved design.
- The UI is not dominated by a single hue unless the approved final design intentionally requires it.

- [ ] **Step 4: Commit token conversion**

Run:

```bash
git add prototypes/hr-paysim-redesign/styles.css
git commit -m "style: align HR PaySim design tokens"
```

## Task 4: Rebuild The Persistent Layout To Match Final Geometry

**Files:**
- Modify: `prototypes/hr-paysim-redesign/index.html`
- Modify: `prototypes/hr-paysim-redesign/styles.css`

- [ ] **Step 1: Match the desktop shell**

Adjust these selectors against the desktop reference:

```css
.app-shell {}
.flow-rail {}
.brand-lockup {}
.mode-card {}
.stepper {}
.workspace {}
.topbar {}
.screen {}
.flow-controls {}
```

Expected:
- Sidebar width, topbar height, screen max width, footer position, and gutters match the desktop reference.
- The footer does not cover meaningful screen content.

- [ ] **Step 2: Match the mobile shell**

Adjust the `@media (max-width: 760px)` rules for:

```css
.flow-rail {}
.stepper {}
.topbar {}
.screen {}
.flow-controls {}
```

Expected:
- Mobile stepper, content width, sticky elements, and footer layout match `mobile-*.png` references.
- No text overlaps at `390x844`.

- [ ] **Step 3: Verify shell interactions**

Use the app manually:

```text
1. Click next through all 8 steps.
2. Click previous back to step 1.
3. Select each mode on step 1.
4. Click reset.
5. Toggle density if the control remains in the final design.
```

Expected:
- Every interaction still works.
- Shell layout does not shift unexpectedly between screens.

- [ ] **Step 4: Commit layout geometry**

Run:

```bash
git add prototypes/hr-paysim-redesign/index.html prototypes/hr-paysim-redesign/styles.css
git commit -m "style: match HR PaySim shell geometry"
```

## Task 5: Sync Shared Components To The Final Design

**Files:**
- Modify: `prototypes/hr-paysim-redesign/styles.css`
- Modify: `prototypes/hr-paysim-redesign/app.js`

- [ ] **Step 1: Align shared component markup**

Update helper functions in `app.js` only where the final design requires different structure:

```js
threadItem()
modeOption()
inputGroup()
field()
metricCard()
insightItem()
scenarioCard()
barLine()
comparisonCard()
memoSection()
```

Expected:
- Markup remains semantic and interactive.
- No component is replaced by a single screenshot or background image.

- [ ] **Step 2: Align shared component styles**

Update these CSS groups against the final design:

```css
.panel {}
.panel-header {}
.panel-title {}
.panel-body {}
.status-pill {}
.tag {}
.primary-button {}
.secondary-button {}
.ghost-button {}
.icon-button {}
.field {}
.field input {}
.metric-card {}
.scenario-card {}
.comparison-card {}
.memo-card {}
```

Expected:
- Border radius, stroke, fill, spacing, typography, hover, focus-visible, disabled, and selected states match the design.

- [ ] **Step 3: Add missing focus-visible styles**

If the final design does not explicitly show focus, use visible focus rings that fit the palette:

```css
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Commit shared component sync**

Run:

```bash
git add prototypes/hr-paysim-redesign/app.js prototypes/hr-paysim-redesign/styles.css
git commit -m "style: sync HR PaySim shared components"
```

## Task 6: Sync Each Of The 8 Screens

**Files:**
- Modify: `prototypes/hr-paysim-redesign/app.js`
- Modify: `prototypes/hr-paysim-redesign/styles.css`

- [ ] **Step 1: Sync step 1, Entry / Mode Check**

Update:

```js
renderEntry()
flowPreviewSvg()
modeOption()
```

Expected:
- Hero composition, mode cards, visual preview, and selected state match `desktop-01-entry.png` and `mobile-01-entry.png`.
- Selecting HR Prism, Direct, and Sample modes updates the shell copy.

- [ ] **Step 2: Sync step 2, Data Intake**

Update:

```js
renderIntake()
inputGroup()
field()
```

Expected:
- Grouping, labels, input sizes, optional AI details, and disabled CSV affordance match references.
- Editing any input marks downstream steps stale.

- [ ] **Step 3: Sync step 3, Input Summary**

Update:

```js
renderSummary()
summaryChartSvg()
summaryBar()
```

Expected:
- Summary strip, tags, chart, and inline CTA match references.
- Inline CTA advances to diagnosis.

- [ ] **Step 4: Sync step 4, Diagnosis**

Update:

```js
renderDiagnosis()
metricCard()
gaugeSvg()
debtBarsSvg()
inversionSvg()
payrollSvg()
```

Expected:
- CEI, CED, inversion risk, payroll baseline, interpretation block, and next-question block match references.
- Stale-state trigger still marks later steps.

- [ ] **Step 5: Sync step 5, Recommended Scenarios**

Update:

```js
renderScenarios()
scenarioCard()
```

Expected:
- Current State / No Action remains a first-class option.
- Recommended and non-recommended scenario styling matches references.
- Scenario buttons remain real buttons.

- [ ] **Step 6: Sync step 6, AI Check**

Update:

```js
renderAiCheck()
barLine()
seniorPremiumSvg()
```

Expected:
- AI remains an advanced scenario lens only.
- No copy implies AI substitution percentage, job replacement, or a standalone AI simulator.

- [ ] **Step 7: Sync step 7, Decision Comparison**

Update:

```js
renderComparison()
comparisonCard()
```

Expected:
- `얻는 것` and `감수할 것` sections match references.
- Comparison cards keep real text and data, not rasterized card images.

- [ ] **Step 8: Sync step 8, Decision Memo Preview**

Update:

```js
renderMemo()
memoSection()
```

Expected:
- Memo preview layout and free-preview framing match references.
- It remains a preview, not a final legal/tax-grade deliverable.

- [ ] **Step 9: Commit screen sync**

Run:

```bash
git add prototypes/hr-paysim-redesign/app.js prototypes/hr-paysim-redesign/styles.css
git commit -m "style: sync HR PaySim flow screens"
```

## Task 7: Product Guardrail Review

**Files:**
- Modify if needed: `prototypes/hr-paysim-redesign/app.js`
- Modify if needed: `docs/hr-paysim/final-design-acceptance.md`

- [ ] **Step 1: Search for prohibited framing**

Run:

```bash
rg -n "AI substitution|replacement|Total Work Cost|attrition probability|market data|salary calculator|legal|tax|주민등록|개인 연봉|대체율|퇴사 확률|시장 연봉" prototypes/hr-paysim-redesign docs/hr-paysim
```

Expected:
- No UI copy violates `docs/hr-paysim/00_product_thesis.md`.
- Mentions of excluded concepts appear only as exclusions, not product claims.

- [ ] **Step 2: Check HR Prism sequencing**

Confirm the UI still communicates:

```text
HR Prism can trigger HR PaySim, but HR PaySim recalculates from its own aggregate inputs.
```

Expected:
- HR PaySim is not positioned as a replacement for HR Prism.
- HR PaySim does not ask for employee-level sensitive data.

- [ ] **Step 3: Commit guardrail fixes if files changed**

Run:

```bash
git add prototypes/hr-paysim-redesign/app.js docs/hr-paysim/final-design-acceptance.md
git commit -m "fix: preserve HR PaySim product guardrails"
```

Expected:
- If no files changed, do not create an empty commit.

## Task 8: Pixel QA And Interaction Verification

**Files:**
- Create: `prototypes/hr-paysim-redesign/qa/README.md`
- Add generated screenshots under: `prototypes/hr-paysim-redesign/qa/`
- Modify if needed: `prototypes/hr-paysim-redesign/app.js`
- Modify if needed: `prototypes/hr-paysim-redesign/styles.css`

- [ ] **Step 1: Capture desktop screenshots**

Open `prototypes/hr-paysim-redesign/index.html` and capture all 8 steps at `1440x1024`.

Save captures as:

```text
qa/desktop-01-entry.actual.png
qa/desktop-02-intake.actual.png
qa/desktop-03-summary.actual.png
qa/desktop-04-diagnosis.actual.png
qa/desktop-05-scenarios.actual.png
qa/desktop-06-ai-check.actual.png
qa/desktop-07-comparison.actual.png
qa/desktop-08-memo.actual.png
```

- [ ] **Step 2: Capture mobile screenshots**

Capture all 8 steps at `390x844`.

Save captures as:

```text
qa/mobile-01-entry.actual.png
qa/mobile-02-intake.actual.png
qa/mobile-03-summary.actual.png
qa/mobile-04-diagnosis.actual.png
qa/mobile-05-scenarios.actual.png
qa/mobile-06-ai-check.actual.png
qa/mobile-07-comparison.actual.png
qa/mobile-08-memo.actual.png
```

- [ ] **Step 3: Compare actual screenshots to references**

For each reference/actual pair:

```text
reference: design-references/<viewport-step>.png
actual: qa/<viewport-step>.actual.png
```

Expected:
- Shell geometry, component geometry, spacing, and colors match the reference.
- Text wraps at the same positions as the reference.
- No image overlay is used to hide mismatches.

- [ ] **Step 4: Fix mismatches in tight loops**

For every mismatch, edit only the smallest affected selector or renderer.

Expected:
- Each loop ends with a new screenshot proving the mismatch was removed.
- QA notes record the mismatch and the selector/function changed.

- [ ] **Step 5: Perform functional smoke test**

Manual checks:

```text
1. Step 1: select all three modes; shell mode card updates.
2. Step 1-8: click next through the full flow.
3. Step 8-1: click previous back through the full flow.
4. Step 2: edit one input; downstream steps become stale.
5. Step 4: click stale-state demo button; scenario/comparison steps show stale state.
6. Any step: click reset; app returns to step 1 HR Prism mode.
7. Mobile: repeat next/back/reset and confirm footer controls are reachable.
```

Expected:
- All checks pass.
- No layout overlap appears on desktop or mobile.

- [ ] **Step 6: Write QA README**

Create `prototypes/hr-paysim-redesign/qa/README.md`:

```markdown
# HR PaySim Pixel QA

## Viewports

- Desktop: 1440x1024
- Mobile: 390x844

## Result

- Desktop references matched: yes/no
- Mobile references matched: yes/no
- Functional smoke test passed: yes/no

## Notes

- Record each visual mismatch fixed during QA.
- Record any accepted anti-aliasing-only differences.
```

- [ ] **Step 7: Commit QA artifacts and final fixes**

Run:

```bash
git add prototypes/hr-paysim-redesign prototypes/hr-paysim-redesign/qa
git commit -m "test: verify HR PaySim final design match"
```

Expected:
- Commit contains final UI changes plus QA notes/screenshots that support the final claim.

## Task 9: Final Review Checklist

**Files:**
- Read: `docs/hr-paysim/final-design-acceptance.md`
- Read: `docs/hr-paysim/00_product_thesis.md`
- Read: `prototypes/hr-paysim-redesign/qa/README.md`

- [ ] **Step 1: Confirm visual coverage**

Expected:
- All 8 screens have desktop and mobile references.
- All 8 screens have desktop and mobile actual screenshots.
- QA notes identify any remaining differences.

- [ ] **Step 2: Confirm implementation coverage**

Expected:
- UI is implemented with real DOM, CSS, SVG, inputs, and buttons.
- No full-screen or card-level screenshot overlay is used as the app UI.
- Existing state transitions still work.

- [ ] **Step 3: Confirm product coverage**

Expected:
- HR PaySim remains a compensation governance simulator.
- AI appears only as a relevant advanced scenario lens.
- Strict exclusions from the product thesis are preserved.

- [ ] **Step 4: Report final status**

Final report should include:

```text
- Files changed
- Screens verified
- Viewports verified
- Remaining visual differences, if any
- Functional smoke-test result
- Whether final design source was attached, linked, or imported from thread
```

