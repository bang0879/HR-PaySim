# HR PaySim Guided Excel Preparation Design

## Status

Revised approved direction for replacing the paste-first preparation screen with one guided Excel-template workflow and a subordinate paste fallback. Comparison meaning and required career evidence follow `2026-07-14-hr-paysim-career-aware-comparison-design.md`.

This revision incorporates the user's 2026-07-14 feedback that the prior file-type, sheet-selection, and paste choices still left the facilitator unsure what to prepare. It does not authorize Task 12, deployment, a real-pilot evidence claim, or any change to the four founder-facing screens.

## Goal

Show the exact required fields and a synthetic example first, provide a ready-to-use Excel template, and then let the facilitator import the completed template locally. Keep paste available only for someone who already has the same small table prepared.

## Authority And Scope

- Product Adapter: `docs/diagnostic-product-adapter.md`
- Canonical product design: `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- Preparation/privacy design: `docs/superpowers/specs/2026-07-13-hr-paysim-p11-b0-facilitator-preparation-design.md`
- Copy SSOT: `src/lib/hr-paysim/copy/founderCopy.ts`

The package remains inside Product Engineer-only local facilitator preparation. It changes preparation guidance and source adaptation. The companion career-aware package changes only the named detector eligibility and Screen 2 evidence axis; review state, four-screen navigation, routing, deployment, and learning-log storage remain unchanged.

## Problem To Solve

The current screen exposes canonical parser fields and asks for a table before explaining the smallest useful data shape. A facilitator with a differently structured company workbook must infer which columns to keep, rename them, create anonymous row IDs, repeat the role group, and choose between several input paths.

Generic file import alone would move the ambiguity from a textarea into a file picker.

## Chosen Approach

Use one linear preparation path:

1. Show the required and optional fields in plain Korean.
2. Show a small synthetic example table with no names, IDs, or company data.
3. Offer `HR PaySim Product Engineer 입력 양식.xlsx` as the first action.
4. Ask the facilitator to fill that template and choose `작성한 Excel 파일 불러오기`.
5. Inspect the file locally, show the existing safe preview, and require explicit session start.
6. Keep `파일을 사용하지 않고 표 붙여넣기` inside a closed secondary disclosure.

The UI says `파일 불러오기`, not `업로드`, because the file never leaves the browser.

### Rejected Alternatives

- **Paste-first preparation:** safe but makes the facilitator reconstruct a technical schema.
- **Generic Excel import with column mapping:** flexible but creates a second data-wrangling product and too many decisions before the session.
- **Multiple advertised file types:** increases choice without helping the primary Excel workflow.
- **Workbook sheet picker:** handles arbitrary workbooks but reintroduces uncertainty.
- **Server upload:** creates transport, retention, deletion, and access-control obligations outside v1.

## User-Prepared Table Contract

The facilitator does not provide employee IDs, names, company names, team names, manager names, or role groups. The local adapter creates session-only row IDs and fixes the role group to `Product Engineer`.

### Required columns

| Template header | Meaning | Accepted value |
|---|---|---|
| `기본연봉(원)` | Current annual base salary | whole-number KRW, commas allowed |
| `관련 경력년수` | Relevant Product Engineer experience across current and previous companies | number from 0 through 60; decimals allowed |
| `회사 근속개월` | Completed months employed by the current company | whole number from 0 through 720 |

### Optional columns

| Template header | Meaning | Accepted value |
|---|---|---|
| `직함` | Current title used only as evidence context | short de-identified text |
| `레벨` | Current level label used only as display and explanation context; it never creates an ordered rank | short de-identified text |
| `문서화된 예외` | Whether a documented pay exception exists | blank, `예`, or `아니오` |
| `카운터오퍼 여부` | Whether pay reflects a counteroffer | blank, `예`, or `아니오` |

At least four accepted data rows are required. Fully blank rows are ignored wherever they occur. Any nonblank row with a missing required cell fails closed. The seven displayed Korean headers are exact and have no additional aliases; any other header uses the existing prohibited-column consent boundary and is never silently mapped.

The adapter:

- generates `file_row_001`, `file_row_002`, and so on from accepted nonblank source-row order while retaining the original worksheet row number only for safe error reporting;
- sets `roleGroup` to `Product Engineer`;
- maps the seven exact Korean headers to canonical fields, including relevant career years normalized once to completed months;
- maps Korean yes/no values to the existing exception flags.

Value rules are identical for Excel and paste:

- salary accepts a finite whole-number cell or a comma-formatted whole-number string;
- relevant career accepts a finite number or plain decimal string from 0 through 60, while `%` and unit-bearing strings fail;
- company tenure accepts a finite whole number or integer string from 0 through 720;
- `문서화된 예외` and `카운터오퍼 여부` accept only blank, `예`, or `아니오`;
- generated IDs follow accepted source order and do not reuse worksheet row numbers.

Generated IDs and the fixed role remain internal and never render.

## Downloadable Excel Template

Create one facilitator-only asset:

`src/features/facilitator-preparation/assets/HR-PaySim-Product-Engineer-input-template.xlsx`

The workbook contains exactly one sheet named `입력 양식` with:

- the seven Korean headers in contract order;
- frozen and visually distinct header cells;
- header-cell comments or data-validation messages explaining that employee names and IDs must not be entered;
- no instruction rows, extra data columns, employee data, hidden rows or sheets, formulas, macros, external links, or identifying workbook metadata.

The visible screen owns the synthetic example. The workbook data region stays blank so a facilitator never has to delete example employees before use.

The asset is imported only by the facilitator-local preparation module and must be absent from public build output.

## Screen Hierarchy

### 1. Preparation explanation

Lead with:

> Product Engineer 직원 최소 4명의 기본연봉, 관련 경력년수, 회사 근속개월을 준비해 주세요. 이름과 사번은 필요하지 않습니다.

Immediately define `관련 경력년수` as experience directly connected to Product Engineer work across current and previous companies. Do not request employer names, dates, education, age, or free-form work histories.

Then show required and optional fields. Internal parser names do not render.

### 2. Synthetic example

Show three or four illustrative rows using only the seven visible columns. Label it `작성 예시` and state that the numbers are synthetic. It demonstrates formatting, is not a salary benchmark, and is never submitted.

### 3. One numbered workflow

- `1. Excel 입력 양식 내려받기`
- `2. 작성한 Excel 파일 불러오기`

If the facilitator already has a file matching the template, step 2 remains usable. Supported-file copy is limited to `.xlsx · 최대 5 MB`.

### 4. Paste fallback

Below the primary workflow, render a closed disclosure labeled `파일을 사용하지 않고 표 붙여넣기`. Opening it shows the same headers, example, one textarea, and the existing inspection action. Canonical English headers do not render.

### 5. Safe confirmation

Both sources converge on the current normalized confirmation table. It shows session-local employee label, salary, normalized relevant career, company tenure, optional display level, and exception evidence. It does not display the filename, worksheet name, raw headers, generated IDs, or unapproved source values.

## Excel Workbook Rules

- Accept `.xlsx` only, up to 5 MB.
- Use `입력 양식` when it exists and contains data rows.
- Without that sheet, accept only a workbook with exactly one non-empty sheet.
- With multiple non-empty sheets and no `입력 양식`, block and direct the facilitator to the template. Do not show a sheet picker.
- Reject empty, password-protected, macro-enabled, or unreadable workbooks.
- The selected reader does not support formula values. Do not inspect, execute, fetch, or evaluate formulas; a formula cell in any accepted field fails closed as missing or malformed.
- Do not follow hyperlinks or external workbook references.

Use the pinned `read-excel-file/browser` API for local XLSX parsing. Import it only from the facilitator-local boundary. The implementation must not claim formula support that the reader does not provide.

Reference: `https://github.com/catamphetamine/read-excel-file`

## Data Flow And Ownership

```text
Visible field contract and example
  -> download blank local XLSX template
  -> choose completed XLSX OR expand paste fallback
  -> local Korean-template adapter
  -> generated row IDs + fixed Product Engineer role
  -> existing prepareProductEngineerRoster()
  -> existing PII checks and all-or-nothing blocking
  -> existing safe preview
  -> explicit session start
  -> clear every source object
```

Create one focused adapter that validates Korean headers and values, creates canonical tab-delimited text only in local function scope, and returns canonical text or one safe issue code. It never returns a filename, worksheet name, rejected value, workbook row array, or `File`.

Workbook rows exist only inside the file-reader call. They never enter React state, a surviving ref, the provider, or reducer. The native input resets in a `finally` path. Paste remains component-owned only until inspection.

## Privacy And Security Contract

- No file, filename, worksheet name, workbook bytes, raw rows, or canonical text is emitted through network, telemetry, forms, logs, or analytics.
- No source data enters browser storage, a URL, provider state, output, or pilot-learning records.
- Filename and path never render.
- The `File` reference and input value clear after every read attempt.
- Existing prohibited-column consent applies only to the current source.
- Existing value-level PII detection clears the source and blocks all rows.
- Unknown headers, invalid yes/no values, missing values, unsupported comparisons, and malformed workbooks fail closed.
- Public builds exclude the template, reader, XLSX parser, and preparation modules.

The adapter and reader join the privacy source-owner audit and built facilitator-local module-graph verification.

## Error States

| Condition | Safe response |
|---|---|
| Unsupported file type | Ask for the provided `.xlsx` template or paste fallback. |
| File exceeds 5 MB | State the limit without retaining the filename. |
| Empty template | Ask for at least four Product Engineer rows. |
| Required value missing or malformed | Show safe row numbers and field category, never the value. |
| Invalid optional yes/no value | Ask for blank, `예`, or `아니오`. |
| Multiple sheets without `입력 양식` | Ask to copy the relevant table into the template. |
| XLSX parse or password failure | Ask for a normal template copy or paste fallback. |
| Unknown or PII-like column | Reuse current per-source stripping consent. |
| PII-like value | Clear the source, show safe row numbers and issue type, and require corrected data. |

Error copy stays in the copy SSOT. Parser exceptions and internal fields never render directly.

## Testing And Verification

### Template artifact

- Render and inspect the XLSX template.
- Verify one visible sheet, seven exact headers, and no data rows, formulas, macros, links, hidden content, or identifying metadata.

### Adapter and reader

- Generate internal IDs from accepted nonblank source order and fix the role without user input.
- Accept only the seven exact Korean headers and reject alias, missing, duplicated, and malformed headers fail-closed.
- Normalize salary, relevant career, company tenure, and Korean yes/no identically for Excel and paste.
- Cover numeric cells, numeric strings, comma salary strings, `%` and unit-bearing strings, blank cells, formula cells, and out-of-range values.
- Prove free-text `레벨` never creates `levelRank`.
- Enforce four accepted rows and 5 MB.
- Read the template after synthetic test rows are inserted.
- Use `입력 양식` when present and reject ambiguous multi-sheet files.
- Prove safe error row numbers use the source sheet while generated IDs use accepted-row order.
- Clear file input and transient source objects after every outcome.
- Feed Excel and paste through identical PII and preparation tests.

### Component, privacy, and browser QA

- Required fields and example precede all actions.
- Download then import appears as one numbered workflow.
- Paste is closed and subordinate.
- English headers, filename, sheet name, and generated IDs never render.
- Public bundle excludes the dependency, template, and reader.
- Completed template reaches confirmation.
- PII blocks all rows and appears in no text, request, storage, or URL.
- Paste completes the same four-screen flow.
- Explicit session end clears roster state.

### Fresh commands

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

## Out Of Scope

- Generic workbook mapping or schema inference.
- CSV, TSV, `.xls`, `.xlsm`, macros, passwords, formulas, remote spreadsheets, or cloud drives.
- Drag-and-drop, recent files, autosave, resume, history, or server upload.
- Task 12, deployment, authentication, or external facilitator routes.
- New role groups, calculation amounts, materiality thresholds, review-state changes, or additional founder-facing screens beyond the separately approved career-aware comparison package.
- Automatic pilot logs, participant evidence, or claims that the template completes PILOT-1.

## Acceptance Criteria

- Before any input choice, the facilitator sees exactly what data to prepare and a synthetic example.
- The primary workflow is download, fill, import, confirm, start.
- The facilitator never creates row IDs, repeats the role, or sees parser headers.
- The template contains seven Korean columns and no employee data.
- Paste uses the same table contract and remains a closed fallback.
- Excel and paste produce identical normalized and fail-closed outcomes.
- Source data is absent from provider state, storage, URLs, emissions, logs, output, and public bundles.
- Existing Product Engineer calculation amounts, materiality threshold, review state, repeat logic, report derivation, and four-screen navigation remain unchanged. Comparison eligibility and the Screen 2 horizontal axis follow the career-aware comparison design.
- a percentage-formatted numeric cell is indistinguishable from a plain numeric cell through the selected reader, so its underlying numeric value is treated as years and the normalized confirmation is the required facilitator check;
