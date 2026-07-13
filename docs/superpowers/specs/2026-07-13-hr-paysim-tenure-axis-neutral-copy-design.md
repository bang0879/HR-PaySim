# HR PaySim Tenure-Axis Evidence And Neutral Copy Design

## Status

Approved Task 9 correction design after the first five-second comprehension review exposed two ambiguities: arbitrary vertical employee placement and actor-specific `대표님` language.

This design modifies only the existing four-screen Product Engineer vertical slice. It does not complete the human gate, authorize Task 10, change detector findings, alter the upstream governance baseline, or modify HR Prism.

## Problem

The current salary plot places alternating employees at different heights only to avoid label overlap. The height has no data meaning, but it looks meaningful. The screen also labels employees as `장기 근속자` and `최근 입사자` using fixed thresholds. Those labels can imply a general employment classification, omit employees outside the two ranges, and fail to generalize to real rosters.

All four screens also assume that the person viewing or operating the session is the founder. The facilitated workflow may be operated by Kyle, an HR owner, or another company decision participant, so action and state copy must not assign the interface action to `대표님`.

## Goals

1. Give every plotted employee a position whose horizontal and vertical coordinates both have explicit factual meaning.
2. Display every employee in the selected Product Engineer evidence set without assigning a long-tenure or recent-hire category.
3. Make the highlighted comparison fully factual and data-derived.
4. Remove `대표님` from every founder-facing runtime string across Screens 1 through 4 and the ended-session surface.
5. Preserve internal types, state ownership, invalidation, four-screen navigation, and three primary actions.
6. Restart the human comprehension gate after fresh automated verification.

## Chosen Visualization

Use a two-dimensional employee scatter plot.

- Horizontal axis: current base salary in won, formatted in 만원.
- Vertical axis: actual tenure in months.
- One point: one de-identified employee.
- Point label: session-local employee label and salary.
- Highlighted points: the existing headline pair only.
- No `장기 근속`, `최근 입사`, `오래 근무`, or equivalent cohort label.

The current synthetic Product Engineer points remain:

| Employee | Base salary | Tenure |
|---|---:|---:|
| 직원 A | 6,800만원 | 64개월 |
| 직원 C | 7,200만원 | 56개월 |
| 직원 D | 7,600만원 | 48개월 |
| 직원 E | 8,800만원 | 22개월 |
| 직원 F | 9,000만원 | 18개월 |
| 직원 B | 9,500만원 | 14개월 |

Employees above, below, or between those tenure values use their actual vertical position. They are never hidden for not matching a cohort threshold.

## Missing-Tenure Handling

The selected Product Engineer synthetic slice has tenure for all six employees. The component must still fail visibly rather than omit a future row.

- Rows with a numeric tenure value appear on the scatter.
- Rows without tenure appear in a separate `근속 개월 확인 필요` list immediately below the plot.
- Missing-tenure rows retain employee label and salary.
- The screen does not assign them a fabricated vertical position.
- If every row lacks tenure, replace the scatter with the existing insufficient-data state and continue showing the evidence table.

## Axes And Position Semantics

Salary and tenure domains are derived from the displayed rows, not fixed to the synthetic fixture.

- Salary ticks: minimum, midpoint, maximum of displayed base salaries.
- Tenure ticks: minimum, midpoint, maximum of available tenure months.
- The plot visibly labels `가로축 · 기본 연봉` and `세로축 · 근속 개월`.
- Accessible description: `가로 위치는 기본 연봉, 세로 위치는 근속 개월을 뜻합니다. 근속 개월이 확인된 직원 전체를 표시합니다.`
- Point coordinates carry meaning. Text labels may use a small collision offset, but the point itself may not move away from its salary and tenure coordinate.

The existing `nth-child(even)` vertical staggering is removed.

## Screen 2 Copy Contract

The headline names the actual highlighted pair rather than invented cohorts:

> Product Engineer 6명 중 근속 64개월인 직원 A와 근속 14개월인 직원 B의 연봉은 2,700만원 차이납니다.

The values are resolved from the current view model:

- displayed employee count;
- lower-paid employee label and tenure;
- higher-paid employee label and tenure;
- `headlineGapKRW`.

The supporting copy becomes:

> 직원 6명의 기본 연봉과 근속 개월을 함께 비교했습니다. 현재 자료에 기록된 역할·근속 기간·채용 예외 기록만으로는 직원 A와 직원 B의 차이를 일관되게 설명할 기준을 확인하기 어렵습니다.

The action block becomes:

- Label: `지금 확인해 봐야 할 기준`
- Prompt: `이 차이가 생긴 가장 가까운 이유를 하나 선택하고, 그 설명을 확인할 기록이 있는지 이어서 답해 주세요.`

The supporting observations describe actual salary and tenure facts without cohort names. They must not imply that a tenure range is a company-approved category.

## Four-Screen Neutral Copy Contract

All user-visible runtime strings remove `대표님`. Neutralization applies to headings, kickers, aria labels, status messages, action descriptions, copy/export text, report columns, and ended-session copy.

Required expression changes include:

| Current role-specific expression | Neutral expression |
|---|---|
| `대표님과 함께 확인하는 시간` | `함께 확인하는 시간` |
| `대표님이 설명한 이유` | `선택한 설명` |
| `지금 대표님이 하실 일` | `지금 확인해 봐야 할 기준` |
| `대표님께서 설명해 주실 내용` | `확인할 설명` |
| `대표님이 선택한 설명` | `선택한 설명` |
| `대표님이 정해야 할 조건` | `앞으로 사용하려면 정해야 할 조건` |
| `대표님 확인 완료` | `확인 완료` |
| `대표님 설명` | `확인한 설명` |
| `대표님이 확인한 내용 복사하기` | `확인한 내용 복사하기` |
| `대표님의 선택이 남아 있지 않습니다` | `선택한 내용이 남아 있지 않습니다` |

Sentence rewrites must remain natural Korean and must not mechanically delete the subject when doing so creates an incomplete sentence.

Internal identifiers such as `founderExplanation`, `founderQuestion`, `FounderCopyKey`, or existing enum values remain unchanged unless a compiler-required change is unavoidable. They are implementation language and do not render to users.

## Copy Ownership

- Dynamic conclusion and supporting-copy formatters live in `src/lib/hr-paysim/copy/founderCopy.ts`.
- Important labels, states, non-claims, actions, and result-column copy remain in `FOUNDER_COPY`.
- Local JSX may contain only structural labels that are not duplicated product conclusions, states, non-claims, or actions.
- A repository scan distinguishes quoted visible copy from internal identifiers.

## State And Flow Preservation

This correction does not change:

- four top-level screens;
- exactly three primary actions to the synthetic result;
- Product Engineer headline-pair selection;
- `EvidenceStatus`, explanation, repeatability, decision, or report state;
- invalidation when explanation or evidence changes;
- observed precedent versus approved rule distinction;
- in-memory session lifecycle;
- copy, print, and explicit end-session behavior.

## Tests

Focused tests must prove:

1. Headline and supporting copy derive employee count, both labels, both tenure values, and gap from session data.
2. Every Product Engineer row appears either as a plotted point or in the missing-tenure list.
3. Salary and tenure axis domains are derived from current rows.
4. Point coordinates change when salary or tenure changes.
5. No founder-facing copy contains `대표님`, `장기 근속`, `최근 입사`, or `오래 근무`.
6. Internal identifiers containing `founder` remain allowed.
7. Screen order, one-action rule, three-click result, focus, invalidation, copy, storage, and session clearing remain intact.

## Browser QA

Run the existing QA at 1280×720, 1440×900, and 390px after updating its Screen 2 cues.

Required Screen 2 cues:

- `직원 A` and `직원 B`;
- `64개월` and `14개월`;
- `2,700만원`;
- visible salary-axis and tenure-axis labels;
- `지금 확인해 봐야 할 기준` and the explanation/evidence prompt.

The script must also assert that `대표님`, `장기 근속`, `최근 입사`, and `오래 근무` are absent from visible runtime text.

## Human STOP GATE

The earlier feedback is a failed comprehension attempt, not passing evidence. After implementation and fresh automated verification:

1. Generate a new 1280×720 Screen 2 viewport image.
2. Show it without explanation for five seconds to at least two non-HR participants.
3. Include at least one target-adjacent founder or operator.
4. Ask what is compared, what salary difference is visible, and what must be checked or selected next.
5. Record actual wording only.

If any participant treats vertical position as unexplained status, invents a tenure category, misses the 2,700만원 gap, or cannot identify the next check, revise and repeat the full gate.

## Verification Commands

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
node scripts/qa-decision-room.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```

## Commit Boundary

- Commit this design independently.
- Keep Task 9 implementation uncommitted until the repeated human gate passes.
- After a passing gate, stage only the Task 9 implementation, tests, QA, and real comprehension record.
- Use the locked Task 9 commit message: `feat: build Product Engineer decision-room slice`.
- Do not begin Task 10 before Task 9 review and explicit approval.
