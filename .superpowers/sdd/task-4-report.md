# Task 4 Report: Select Subjects And Model Review State

## Status

Implemented the Task 4 subject-selection and theme-review contracts on
`codex/facilitated-decision-room` from starting commit `0c93083`.

## Added Files

- `src/lib/hr-paysim/themes/selectReviewSubjects.ts`
- `src/lib/hr-paysim/review/types.ts`
- `src/lib/hr-paysim/review/updateThemeReview.ts`
- `tests/hr-paysim/review-subject-selection.test.ts`
- `tests/hr-paysim/theme-review.test.ts`

No package-lock, UI, route, repeat, decision, or report-domain files were changed.

## TDD Evidence

### Subject Selection

RED command:

```text
node --experimental-strip-types --test tests/hr-paysim/review-subject-selection.test.ts
```

Observed expected failure:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
.../src/lib/hr-paysim/themes/selectReviewSubjects.ts
tests 1, pass 0, fail 1
```

GREEN command:

```text
node --experimental-strip-types --test tests/hr-paysim/review-subject-selection.test.ts
```

Observed result:

```text
tests 3, pass 3, fail 0
```

Coverage includes the Product Engineer / Platform Engineer / GTM sample order,
the full frozen priority tuple, the maximum-three cap, valid override ordering,
invalid override filtering, recommended IDs, and unselected retention.

### Theme Review State

RED command:

```text
node --experimental-strip-types --test tests/hr-paysim/theme-review.test.ts
```

Observed expected failure:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
.../src/lib/hr-paysim/review/updateThemeReview.ts
tests 1, pass 0, fail 1
```

GREEN command:

```text
node --experimental-strip-types --test \
  tests/hr-paysim/theme-review.test.ts \
  tests/hr-paysim/review-subject-selection.test.ts
```

Observed result:

```text
tests 8, pass 8, fail 0
```

Coverage includes all six review outcomes; distinct unanswered,
founder-cannot-explain, and insufficient-data states; documented, observable,
and leader-assertion evidence derivation; one-time-exception precedence;
change-sensitive repeat/decision invalidation; enum-derived approved sentence
keys; and serialized absence of `baseSalaryKRW` and `freeText`.

## Full Verification Evidence

The first complete verification gate passed:

```text
npm test             -> 64 tests, 64 pass, 0 fail
npm run typecheck    -> exit 0
npm run lint         -> exit 0
npm run build        -> exit 0; Vite built 32 modules
```

## Self-Review

- Confirmed sorting is deterministic and follows every tuple element in order.
- Confirmed overrides use only valid unique IDs, preserve supplied order, and
  cannot select more than three subjects.
- Confirmed review outcomes are derived rather than accepted from callers.
- Confirmed explanation/evidence changes invalidate dependent state, while
  repeatability-only and same-value evidence updates preserve it.
- Confirmed review writes accept no roster salary or founder free-text field.
- Confirmed `git diff --check` is clean and `package-lock.json` is unchanged.

No unresolved concerns were found in the Task 4 scope.

## Review Follow-Up: Selection And Runtime Boundaries

### Deterministic Code-Unit Ordering

RED:

    node --experimental-strip-types --test tests/hr-paysim/review-subject-selection.test.ts
    tests 4, pass 3, fail 1

The locale-aware comparator produced a different case, punctuation, and accent
order from the required JavaScript code-unit order.

GREEN:

    node --experimental-strip-types --test tests/hr-paysim/review-subject-selection.test.ts
    tests 4, pass 4, fail 0

The final role-group and theme-ID tie-breaks now use an explicit code-unit
comparator.

### Hostile Runtime Update Payload

RED:

    node --experimental-strip-types --test tests/hr-paysim/theme-review.test.ts
    tests 6, pass 5, fail 1

A wider runtime object bypassed the TypeScript boundary and leaked freeText
and baseSalaryKRW through the update object spread.

GREEN:

    node --experimental-strip-types --test tests/hr-paysim/theme-review.test.ts
    tests 6, pass 6, fail 0
    node --experimental-strip-types --test tests/hr-paysim/review-subject-selection.test.ts tests/hr-paysim/theme-review.test.ts
    tests 10, pass 10, fail 0

The updater now copies only defined explanation, evidence, repeatability, and
evidence-follow-up fields.

### Follow-Up Full Verification

    npm test             -> 72 tests, 72 pass, 0 fail
    npm run lint         -> exit 0
    npm run typecheck    -> exit 0
    npm run build        -> exit 0; Vite built 32 modules

No unresolved concerns were found in this follow-up scope.
