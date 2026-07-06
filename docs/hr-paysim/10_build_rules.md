# HR PaySim Build Rules

## v1.0 Scope

- Direct aggregate input.
- Sample data preview.
- Session-restored wizard flow.
- Aggregate review.
- CEI, CED, pay inversion, payroll forecast diagnosis.
- Founder-facing Korean interpretation.
- Scenario recommendations with `baseline_current_state` as a first-class option.
- Optional AI check as an advanced scenario lens.
- Calculated comparison with derived baseline.
- Memo preview with plain-text copy.
- Aggregate consent UI and local payload validator.

## Deferred Scope

- CSV full upload.
- PDF generation.
- Server-side aggregate logging endpoint.
- Legal/tax-grade stock option calculation.
- External salary market data integration.

## Strict Exclusions

- No salary calculator framing.
- No employee-level pay recommendation.
- No AI substitution percentage.
- No job replacement claims.
- No fake attrition probability.
- No `Total Work Cost` metric.
- No employee-level sensitive data storage.
- No raw CSV persistence.

## Privacy Rules

- URL stores only the current step.
- Session data stays in `sessionStorage`.
- Aggregate log payloads exclude employee names, emails, phone numbers, resident IDs, raw salaries, raw CSV rows, and company name unless a later policy explicitly allows a separate company-name permission.
- Declining aggregate analysis consent must not block memo preview.

## Korean Copy Rules

- Use plain Korean.
- Use `얻는 것` and `감수할 것`.
- Avoid consulting-heavy exaggeration.
- Do not say AI replaces people.
- Do not use `이직 확률`, `생산성 향상률`, or `Total Work Cost`.

## Build Gate

The app cannot move to the next implementation task while any of these fail:

```text
npm test
npm run typecheck
npm run build
```

## Risk Loop

For each task, try at most three fix loops for the same failure. If the failure remains, stop and report the blocker with evidence.

