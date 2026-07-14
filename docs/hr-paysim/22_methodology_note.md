# HR PaySim Methodology Note

## 1. Product boundary

HR PaySim is a facilitated compensation decision-support product. It helps a founder or operator inspect relationships already present in an internal roster, confirm what the company can and cannot explain, and record a bounded company rule.

It is not a market benchmark, an employee evaluator, an attrition prediction, or an individual salary recommendation. It does not decide a fair or recommended salary for any employee.

This note describes the pre-pilot MVP implemented in the four-screen Decision Room. `PILOT-1: NOT RUN`.

## 2. Input and normalization

The facilitator prepares one role group at a time. The current guided workbook accepts Product Engineer rows with these fields:

- base salary in KRW;
- relevant experience in years;
- company tenure in months;
- optional title and level;
- whether a documented exception exists;
- whether a counteroffer exists.

Names, employee numbers, email addresses, and free-text employee notes are not required. Internal row identifiers are generated locally and never appear in founder-facing output.

The local adapter fails closed when required values are missing, numeric formats are invalid, a formula cell is present, an unapproved column is present, or a PII-like value remains in an accepted row. Unknown columns require consent for the current read before they can be removed. The raw workbook or pasted table is cleared after safe normalization and is not stored in session state.

## 3. Comparable hierarchy

Comparisons follow this order:

1. same role group;
2. compatible level evidence when complete ordered levels exist;
3. relevant experience for the role;
4. company tenure as supporting context.

Relevant experience is not replaced by company tenure. A newly hired employee with ten years of relevant experience is not treated as directly dominated by a four-year-career employee merely because the latter has longer company tenure.

When level evidence is incomplete or conflicting, the product does not invent a level order. When relevant-experience evidence is missing, it does not fall back to a tenure-only conclusion. Unsupported rows remain visible as missing-evidence cases rather than receiving a fabricated coordinate or comparison.

## 4. Observed evidence and calculations

The product separates four evidence classes:

- **Observed:** roster salaries, relevant experience, tenure, level, and documented exception flags.
- **Calculated:** material comparison pairs, salary gaps, descriptive plot coordinates, and deterministic repeat counts.
- **Confirmed:** the facilitator's enum-backed explanation and evidence status.
- **Chosen:** the company rule, owner, due event, and decision status.

The Screen 2 plot uses relevant experience on the horizontal axis and base salary on the vertical axis. Its observed trend is deterministic ordinary least squares over the central 70 percent of observed career values, displayed from 15 percent to 85 percent of the plot width. It is a description of the submitted roster only. It is not a market average, standard raise rate, recommended salary line, or approved company standard.

A material pair is retained only when the comparison contract is satisfied and the salary gap crosses the configured absolute or percentage threshold. The product may calculate `headlineGapKRW`, a pair repair floor, and role-group payroll context, but those values do not become a salary instruction.

## 5. From raw findings to review subjects

Detectors produce raw relationship evidence. The theme builder groups connected evidence into founder-reviewable subjects without duplicating the same headline pair. Selection is deterministic and capped at three recommended subjects.

The fixed synthetic fixture currently selects:

1. Product Engineer;
2. Platform Engineer;
3. GTM.

Selection does not confirm a cause. A subject can remain unanswered, lack sufficient evidence, or be explained with evidence. Product Engineer is the only prefilled reviewed path in the synthetic demo; Platform Engineer and GTM start unanswered.

## 6. Review and decision gates

The four screens implement these gates:

1. session introduction and scope;
2. observed pay differences and facilitator confirmation;
3. company rule review;
4. session result and explicit session end.

Changing an explanation or evidence status invalidates dependent interpretations, repeated-rule results, decisions, and the shared report. The reducer accepts only known enum values, current theme identifiers, and current canonical claims. Unknown or malformed runtime actions fail closed.

The final record contains observed/confirmed statements, the selected rule, owner, due event, and status. It does not persist founder free text or roster rows.

## 7. Determinism and provenance

The synthetic fixture, detector ordering, theme ordering, review state, repeated precedent, decision record, and report are deterministic. Reversing roster or candidate order does not change the canonical result.

Every confirmed statement resolves to client-data evidence and reviewed state. Working hypotheses stay in follow-up or review context and cannot enter confirmed-result destinations. Practitioner experience and external context cannot confirm a client mechanism by themselves.

## 8. Method limitations

- The MVP uses internal roster evidence only and contains no market benchmark.
- It provides no individual salary recommendation.
- A descriptive internal trend does not establish causality, fairness, or a policy.
- Small or incomplete role groups may be insufficient for a comparison.
- The current facilitator workflow is localhost-only and in-memory.
- Browser refresh intentionally clears the active roster session.
- No external facilitator access control has been deployed or attested.
- No human pilot or comprehension study has been run for this Task 12 evidence package.
