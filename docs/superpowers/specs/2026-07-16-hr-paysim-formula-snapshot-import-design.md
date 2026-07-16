# HR PaySim Safe Formula Snapshot Import Design

**Date:** 2026-07-16  
**Status:** Approved in conversation; written review pending  
**Scope:** Facilitator-local `.xlsx` roster intake only

## 1. Context and authority

The inspected workbook `HR-PaySim-company-roster-template.xlsx` is a valid two-sheet roster workbook. The current parser reads 26 accepted rows with no adapter issues, but the preflight formula scan finds 44 formula cells in the `입력 양식` salary and grade-order columns. The application therefore returns `UNREADABLE_WORKBOOK` before the otherwise valid roster reaches confirmation.

This design supersedes only the formula-cell blocking statement in `docs/superpowers/specs/2026-07-15-hr-paysim-multi-role-roster-input-design.md` section 10. All other multi-role roster, privacy, workbook-size, worksheet-inflation, comparison, claim, and session-lifecycle contracts remain unchanged.

## 2. Goal

Accept a workbook whose selected input sheet contains formulas when Excel has saved a usable cached result for every selected-sheet formula cell, without evaluating formulas or weakening existing roster validation.

The facilitator must be told that the analysis uses the values saved in the workbook, not newly calculated results.

## 3. Non-goals

- Do not execute Excel formulas in the browser.
- Do not recalculate volatile, external, shared, array, or dynamic formulas.
- Do not follow external workbook links or fetch remote data.
- Do not persist the source workbook, formula text, cached raw rows, or filename.
- Do not accept encrypted, corrupt, macro-enabled, oversized, or inflation-limit-violating workbooks.
- Do not change the seven-column roster schema, calculations, thresholds, or decision-room outputs.

## 4. Selected approach

Use an in-memory value snapshot before the existing workbook parser runs.

1. Read the `.xlsx` ZIP under the existing file-size, worksheet-count, per-sheet XML, and aggregate XML limits.
2. Map workbook sheet names to worksheet parts using `workbook.xml` and its relationships.
3. For each formula cell, preserve its saved scalar value and remove only the formula element in an in-memory workbook copy.
4. Parse the in-memory copy with the existing `read-excel-file` path and select the same preferred `입력 양식` sheet.
5. If every formula on the selected sheet had a non-error cached value, run the unchanged Korean roster adapter on those values.
6. If a selected-sheet formula lacks a cached value or contains a cached Excel error, block with `FORMULA_RESULT_UNAVAILABLE` rather than `UNREADABLE_WORKBOOK`.
7. Ignore unresolved formulas on non-selected sheets because those sheets are not analyzed.

The original file is never modified or written to disk. Formula text is used only to recognize formula elements and is not returned to the UI or logs.

## 5. Result and UI contract

`FacilitatorPreparationResult` gains a safe boolean indicating that saved formula results were used. It contains no workbook name, cell value, formula text, or sheet content.

When the result reaches confirmation with that boolean set, the screen shows a notice equivalent to:

> 수식이 포함된 셀은 엑셀에 마지막으로 저장된 값으로 읽었습니다. 현재 값이 맞는지 확인한 뒤 세션을 시작해 주세요.

Error copy is split:

- `FORMULA_RESULT_UNAVAILABLE`: the workbook contains a formula whose saved result cannot be used; recalculate and save in Excel or paste values only.
- `UNREADABLE_WORKBOOK`: the workbook container or worksheet cannot be parsed; use an unencrypted, macro-free `.xlsx` workbook.

The notice is informational, not a fairness or correctness claim. Existing confirmation remains the human review gate.

## 6. Privacy and safety boundaries

- Formula execution remains impossible; the importer consumes only saved scalar cell values.
- External links and formula dependencies are never resolved.
- The transformed workbook exists only in memory for the current read invocation.
- Existing raw-input clearing, no-storage, no-URL, no-network, and public-bundle separation remain mandatory.
- Returned errors expose only safe issue codes and, when useful, source row and roster field. They never expose formula text or raw cell values.
- Existing ZIP inflation limits run before worksheet transformation.

This preserves `DP-01`, `DP-02`, `DP-03`, and the product-specific privacy lifecycle while replacing a misleading generic rejection with a locally validated snapshot workflow.

## 7. Failure handling

- Missing or error cached value on the selected sheet: `FORMULA_RESULT_UNAVAILABLE`.
- Unsupported formula XML shape that cannot be transformed safely: `FORMULA_RESULT_UNAVAILABLE`.
- Encrypted or invalid ZIP/XML: `UNREADABLE_WORKBOOK`.
- Worksheet count or XML inflation limit exceeded: fail closed as `UNREADABLE_WORKBOOK` without parsing rows.
- Cached value fails the existing numeric, category, PII, grade, or review-subject rules: return the existing adapter issue unchanged.

## 8. Test contract

Implementation follows RED-GREEN TDD.

Required regression coverage:

1. A workbook shaped like the reported file, with saved salary and grade-order formula results, fails under the old behavior and succeeds after the change.
2. The resulting rows equal the saved scalar values, formulas are never evaluated, and the formula-snapshot notice is set.
3. A selected-sheet formula without a saved value returns `FORMULA_RESULT_UNAVAILABLE`.
4. A selected-sheet cached Excel error returns `FORMULA_RESULT_UNAVAILABLE`.
5. An unresolved formula on `작성 예시` does not block a valid `입력 양식`.
6. Corrupt, encrypted-like, oversized, and worksheet-inflation fixtures remain fail-closed.
7. The UI shows distinct formula-snapshot, formula-result-unavailable, and unreadable-workbook copy.
8. Privacy and public-bundle tests prove no formula text, raw values, filename, persistence, or network emission.
9. The supplied workbook is run through the exact reader as a local verification fixture without committing or logging its roster values.

## 9. Acceptance criteria

- The supplied workbook reaches `ready_for_confirmation` using 26 accepted rows and reports that saved formula results were used.
- No formula is executed or recalculated.
- Missing cached formula results fail with specific remediation copy.
- The two rendered sheets remain unchanged because the importer does not rewrite the source workbook.
- Focused tests, full tests, typecheck, both builds, privacy verification, governance verification, and facilitator browser QA pass freshly.
- No push, PR, merge, or deployment occurs before final verification and review.
