# HR PaySim Roster Wedge Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild HR PaySim around the roster-based "compensation comparison bomb / explainability" wedge so the app reveals structural pay risks the founder cannot see from aggregate inputs.

**Architecture:** Keep the Vite + React runtime and existing route/session foundations, but replace the scalar intake and scalar diagnosis model with a client-side de-identified roster pipeline. Build the new flow in `PaySimShell + screens` as the canonical architecture; keep `PrototypePaySimApp` only as a temporary visual/reference artifact until the new vertical slice passes QA. Treat `2026-07-06-hr-paysim-engine-reconciliation.md` as parked and superseded by this roster-wedge plan.

**Tech Stack:** Vite, React, TypeScript, sessionStorage, native History API, Node test runner, Playwright/manual browser QA.

## Global Constraints

- Main source of truth: `C:/Users/bang0/Downloads/10_product_redesign_brief.md`.
- Target customer: growth-stage startups with 15-80 employees, no internal compensation team, founder directly deciding or approving compensation.
- Product wedge: focus on "compensation comparison bomb / explainability"; do not broaden into payroll runway, attrition prediction, or AI workforce planning.
- Input model: de-identified structure roster, processed client-side.
- Required first aha input: title/role, current base salary, start date.
- Remove diagnostic scalar inputs such as `inversionCaseCount` and `exceptionRaiseCount`; the app must calculate these from roster structure.
- PII rule: reject or strip names, emails, phone numbers, resident IDs, employee IDs, and other direct identifiers.
- Manager/team may exist only as opaque labels such as `manager_a`, `team_b`.
- Core flow excludes `ai_check`; AI tooling/headcount trade-offs are deferred outside the wedge.
- Keep URL as current-step source of truth; keep sensitive roster/session state in sessionStorage only.
- Do not merge to main before product vertical slice, accessibility/focus QA, and branch strategy review.

---

## Scope Decision

This plan implements a value-first vertical slice before full engine expansion.

Vertical slice includes:

- Roster paste/CSV parsing for 15-80 rows.
- De-identification confirmation.
- Three structural findings: pay inversion, band overlap / level fiction, loyalty tax.
- Roster-specific expert interpretation.
- Do-nothing cost trajectory as a first-class scenario.
- Comparison and decision memo output.

The remaining catalog items are planned after the slice proves value:

- exception clustering,
- top compression / thin senior spread,
- adjacent leakage.

This is intentional. The brief says the execution decision only becomes meaningful after the first vertical slice scope is defined; this plan defines that slice.

---

## File Structure

- Create: `docs/hr-paysim/12_roster_wedge_product_contract.md`
  - Freezes the new wedge, target, non-goals, and vertical-slice acceptance criteria.
- Create: `docs/hr-paysim/13_roster_data_contract.md`
  - Defines allowed columns, rejected PII, de-identification behavior, and parsing rules.
- Create: `docs/hr-paysim/14_roster_vertical_slice_qa.md`
  - Records browser QA, accessibility/focus checks, numeric input regression status, and remaining risks.
- Modify: `docs/hr-paysim/10_build_rules.md`
  - Marks CSV/paste roster intake as core and `ai_check` as deferred.
- Modify: `src/lib/hr-paysim/domain.ts`
  - Replaces scalar diagnosis inputs with roster and structural finding contracts.
- Create: `src/lib/hr-paysim/roster.ts`
  - Parses pasted tabular text/CSV, validates columns, rejects PII, and returns de-identified roster rows.
- Create: `src/lib/hr-paysim/rosterFixtures.ts`
  - Provides safe sample roster data for the entry preview and tests.
- Create: `src/lib/hr-paysim/structuralFindings.ts`
  - Detects inversion, band overlap, and loyalty tax findings and sorts them by severity/cost.
- Modify: `src/lib/hr-paysim/calculations.ts`
  - Becomes a compatibility barrel or delegates to roster findings during transition.
- Modify: `src/lib/hr-paysim/recommendations.ts`
  - Generates roster-specific scenarios from findings rather than fixed cards.
- Modify: `src/lib/hr-paysim/copy.ts`
  - Provides finding-specific expert interpretation copy using actual roster-derived values.
- Modify: `src/lib/hr-paysim/memo.ts`
  - Generates the decision memo from findings, scenario choices, and do-nothing trajectory.
- Modify: `src/lib/hr-paysim/consent.ts`
  - Reframes consent as de-identified structure analysis; no server emission.
- Modify: `src/lib/hr-paysim/session.ts`
  - Stores roster analysis state and new step order; excludes raw PII.
- Modify: `src/routes/hr-paysim/stepRegistry.ts`
  - Replaces old 9-step scalar flow with new 8-step roster wedge flow.
- Modify: `src/components/hr-paysim/PaySimShell.tsx`
  - Canonical app shell for the new flow.
- Modify: `src/components/hr-paysim/PaySimStepper.tsx`
  - New step labels and stale states.
- Modify: `src/components/hr-paysim/screens/index.tsx`
  - Implements new screens: entry, roster intake, de-identification confirm, structural findings, expert interpretation, recommendations, comparison, memo preview.
- Modify: `src/App.tsx`
  - Mounts `PaySimShell` once the new vertical slice is wired.
- Delete later: `src/components/hr-paysim/PrototypePaySimApp.tsx`
  - Delete only after browser QA and user review confirm the new slice replaces the old prototype path.
- Create/modify tests under `tests/hr-paysim/`
  - `roster.test.ts`, `structural-findings.test.ts`, `recommendations.test.ts`, `memo.test.ts`, `session.test.ts`, `copy.test.ts`, `consent.test.ts`.

---

### Task 1: Product And Data Contract Freeze

**Files:**
- Create: `docs/hr-paysim/12_roster_wedge_product_contract.md`
- Create: `docs/hr-paysim/13_roster_data_contract.md`
- Modify: `docs/hr-paysim/10_build_rules.md`

**Interfaces:**
- Consumes: the redesign brief and previous Devil's Advocate review.
- Produces: product/data constraints that all later tasks must follow.

- [ ] **Step 1: Create product contract document**

Create `docs/hr-paysim/12_roster_wedge_product_contract.md`:

```markdown
# HR PaySim Roster Wedge Product Contract

## Product Promise

"당신이 모르는 새 만들어버린 보상 구조를, 팀원들이 먼저 발견하기 전에."

## Target

- 성장기 스타트업
- 15-80명
- 사내 보상팀 없음
- 대표가 연봉을 직접 정하거나 승인

## Wedge

HR PaySim focuses only on compensation comparison risk and explainability. It reveals whether the company's informal pay structure can survive the moment employees compare compensation.

## Core Input

The app accepts a de-identified structure roster. The founder gives facts, not diagnosis:

- role or title
- optional level
- current base salary
- start date or tenure
- optional latest raise date
- optional latest raise amount
- optional exception flag
- optional counteroffer flag
- optional manager/team opaque label

## Core Output

The app returns 1-3 structural findings ranked by severity and do-nothing cost:

- pay inversion
- band overlap / level fiction
- loyalty tax
- exception clustering
- top compression / thin senior spread
- adjacent leakage

The first vertical slice implements pay inversion, band overlap / level fiction, and loyalty tax.

## Non-Goals

- No salary calculator.
- No market salary benchmark.
- No attrition probability.
- No AI substitution or workforce replacement claim.
- No employee-level named reporting.
- No server-side roster storage.
- No `ai_check` core step.

## Flow

1. Entry / positioning
2. Roster intake
3. De-identification and confirm
4. Structural findings
5. Expert interpretation
6. Recommended scenarios
7. Comparison
8. Decision memo
```

- [ ] **Step 2: Create data contract document**

Create `docs/hr-paysim/13_roster_data_contract.md`:

```markdown
# HR PaySim Roster Data Contract

## Allowed Columns

Required minimum:

- `role`
- `baseSalary`
- `startDate`

Optional:

- `level`
- `latestRaiseDate`
- `latestRaiseAmount`
- `exceptionFlag`
- `counterOfferFlag`
- `managerLabel`
- `teamLabel`

## Rejected Columns

The parser rejects columns whose header or values indicate direct identification:

- name
- email
- phone
- resident id
- employee id
- staff id
- social security number
- address

## De-Identification

The app stores only generated row ids such as `row_001`. Manager and team values are normalized into opaque labels such as `manager_a` and `team_b`. Original direct identifiers are never stored in sessionStorage.

## Client-Side Processing

Roster parsing, validation, and structural finding detection run in the browser. No server endpoint receives roster rows.

## Supported Input Size

15-80 rows are the target range. Fewer than 5 valid rows produces a blocking validation error. More than 120 rows produces a warning and asks the user to narrow the roster before analysis.
```

- [ ] **Step 3: Update build rules**

Modify `docs/hr-paysim/10_build_rules.md`:

```markdown
## v1.0 Scope

- De-identified roster paste/CSV intake.
- Sample roster preview.
- Client-side roster parsing and validation.
- De-identification confirmation.
- Structural findings for pay inversion, band overlap / level fiction, and loyalty tax.
- Founder-facing Korean expert interpretation that cites roster-derived facts.
- Do-nothing scenario with cost trajectory as a first-class option.
- Scenario comparison.
- Decision memo preview.
- De-identified structure analysis consent UI.

## Deferred Scope

- AI tooling / headcount scenario step.
- External salary market data integration.
- Server-side roster persistence.
- Named employee reporting.
- Full six-finding engine expansion beyond the first three findings.
```

- [ ] **Step 4: Commit contracts**

Run:

```powershell
git add docs/hr-paysim/10_build_rules.md docs/hr-paysim/12_roster_wedge_product_contract.md docs/hr-paysim/13_roster_data_contract.md
git commit -m "docs: define HR PaySim roster wedge contract"
```

Expected:

```text
Commit succeeds with documentation-only changes.
```

---

### Task 2: Roster Domain And Parser

**Files:**
- Modify: `src/lib/hr-paysim/domain.ts`
- Create: `src/lib/hr-paysim/roster.ts`
- Create: `src/lib/hr-paysim/rosterFixtures.ts`
- Create: `tests/hr-paysim/roster.test.ts`

**Interfaces:**
- Produces:
  - `parseRosterText(text: string): RosterParseResult`
  - `normalizeRosterRows(rows: RawRosterRow[]): RosterParseResult`
  - `sampleRosterText: string`
  - `sampleRosterRows: RosterRow[]`

- [ ] **Step 1: Add roster domain types**

Modify `src/lib/hr-paysim/domain.ts`:

```ts
export type PaySimStep =
  | "entry"
  | "roster_intake"
  | "deidentify_confirm"
  | "structural_findings"
  | "expert_interpretation"
  | "recommendations"
  | "comparison"
  | "memo_preview";

export interface PaySimStepDefinition {
  id: PaySimStep;
  route: string;
  title: string;
  subtitle: string;
}

export type RosterColumnKey =
  | "role"
  | "level"
  | "baseSalary"
  | "startDate"
  | "latestRaiseDate"
  | "latestRaiseAmount"
  | "exceptionFlag"
  | "counterOfferFlag"
  | "managerLabel"
  | "teamLabel";

export interface RawRosterRow {
  [key: string]: string;
}

export interface RosterRow {
  rowId: string;
  role: string;
  level?: string;
  baseSalary: number;
  startDate: string;
  latestRaiseDate?: string;
  latestRaiseAmount?: number;
  exceptionFlag?: boolean;
  counterOfferFlag?: boolean;
  managerLabel?: string;
  teamLabel?: string;
}

export interface RosterParseResult {
  rows: RosterRow[];
  warnings: string[];
  errors: string[];
  rejectedColumns: string[];
}

export type StructuralFindingType =
  | "pay_inversion"
  | "band_overlap"
  | "loyalty_tax"
  | "exception_clustering"
  | "top_compression"
  | "adjacent_leakage";

export interface StructuralFinding {
  id: string;
  type: StructuralFindingType;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  summary: string;
  evidence: string[];
  affectedRowIds: string[];
  estimatedDoNothingCost: number;
  explanationText: string;
  confidence: "low" | "medium" | "high";
}
```

- [ ] **Step 2: Write parser tests**

Create `tests/hr-paysim/roster.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { parseRosterText } from "../../src/lib/hr-paysim/roster.ts";

test("parseRosterText accepts the minimum de-identified roster columns", () => {
  const input = [
    "role\tbaseSalary\tstartDate",
    "Product Engineer\t72000000\t2022-03-01",
    "Product Engineer\t91000000\t2025-01-10",
    "Platform Engineer\t86000000\t2021-09-15",
    "Designer\t69000000\t2023-04-20",
    "Designer\t81000000\t2024-11-01",
  ].join("\n");

  const result = parseRosterText(input);

  assert.deepEqual(result.errors, []);
  assert.equal(result.rows.length, 5);
  assert.equal(result.rows[0]?.rowId, "row_001");
  assert.equal(result.rows[1]?.baseSalary, 91000000);
});

test("parseRosterText rejects direct identifier columns", () => {
  const input = [
    "name\temail\trole\tbaseSalary\tstartDate",
    "Kim\tkim@example.com\tEngineer\t70000000\t2023-01-01",
    "Lee\tlee@example.com\tEngineer\t80000000\t2024-01-01",
  ].join("\n");

  const result = parseRosterText(input);

  assert.ok(result.errors.some((error) => error.includes("식별 정보")));
  assert.ok(result.rejectedColumns.includes("name"));
  assert.ok(result.rejectedColumns.includes("email"));
  assert.equal(result.rows.length, 0);
});

test("parseRosterText normalizes manager and team into opaque labels", () => {
  const input = [
    "role\tbaseSalary\tstartDate\tmanagerLabel\tteamLabel",
    "Engineer\t70000000\t2023-01-01\tHead of Product\tProduct",
    "Engineer\t80000000\t2024-01-01\tHead of Product\tProduct",
    "Designer\t65000000\t2023-06-01\tDesign Lead\tDesign",
    "Designer\t76000000\t2024-06-01\tDesign Lead\tDesign",
    "PM\t83000000\t2022-02-01\tCOO\tOps",
  ].join("\n");

  const result = parseRosterText(input);

  assert.deepEqual(result.errors, []);
  assert.equal(result.rows[0]?.managerLabel, "manager_a");
  assert.equal(result.rows[2]?.managerLabel, "manager_b");
  assert.equal(result.rows[0]?.teamLabel, "team_a");
  assert.equal(result.rows[4]?.teamLabel, "team_c");
});
```

- [ ] **Step 3: Implement parser**

Create `src/lib/hr-paysim/roster.ts`:

```ts
import type { RawRosterRow, RosterParseResult, RosterRow } from "./domain.ts";

const piiHeaders = [/name/i, /email/i, /phone/i, /resident/i, /employee.?id/i, /staff.?id/i, /ssn/i, /address/i, /이름/, /이메일/, /전화/, /사번/, /주민/];

const headerMap: Record<string, keyof RosterRow> = {
  role: "role",
  title: "role",
  직함: "role",
  역할: "role",
  level: "level",
  레벨: "level",
  baseSalary: "baseSalary",
  salary: "baseSalary",
  연봉: "baseSalary",
  base연봉: "baseSalary",
  startDate: "startDate",
  joinedAt: "startDate",
  입사일: "startDate",
  latestRaiseDate: "latestRaiseDate",
  최근인상일: "latestRaiseDate",
  latestRaiseAmount: "latestRaiseAmount",
  최근인상액: "latestRaiseAmount",
  exceptionFlag: "exceptionFlag",
  예외: "exceptionFlag",
  counterOfferFlag: "counterOfferFlag",
  카운터오퍼: "counterOfferFlag",
  managerLabel: "managerLabel",
  매니저: "managerLabel",
  teamLabel: "teamLabel",
  팀: "teamLabel",
};

export function parseRosterText(text: string): RosterParseResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return emptyResult(["헤더와 최소 1개 이상의 행이 필요합니다."]);

  const delimiter = lines[0]?.includes("\t") ? "\t" : ",";
  const headers = splitLine(lines[0] ?? "", delimiter);
  const rejectedColumns = headers.filter((header) => piiHeaders.some((pattern) => pattern.test(header)));
  if (rejectedColumns.length > 0) {
    return { rows: [], warnings: [], errors: ["식별 정보 컬럼은 사용할 수 없습니다."], rejectedColumns };
  }

  const rawRows = lines.slice(1).map((line) => {
    const values = splitLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });

  return normalizeRosterRows(rawRows);
}

export function normalizeRosterRows(rawRows: RawRosterRow[]): RosterParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const managerMap = new Map<string, string>();
  const teamMap = new Map<string, string>();
  const rows: RosterRow[] = [];

  for (const [index, raw] of rawRows.entries()) {
    const normalized = normalizeRawRow(raw, index, managerMap, teamMap);
    if (typeof normalized === "string") errors.push(normalized);
    else rows.push(normalized);
  }

  if (rows.length < 5) errors.push("분석에는 최소 5개 이상의 유효 행이 필요합니다.");
  if (rows.length > 120) warnings.push("120개를 초과한 행은 v1 범위를 벗어납니다. 15-80명 범위로 좁혀 주세요.");

  return { rows: errors.length > 0 ? [] : rows, warnings, errors, rejectedColumns: [] };
}

function normalizeRawRow(
  raw: RawRosterRow,
  index: number,
  managerMap: Map<string, string>,
  teamMap: Map<string, string>,
): RosterRow | string {
  const get = (key: keyof RosterRow) => {
    const source = Object.entries(raw).find(([header]) => headerMap[header.trim()] === key);
    return source?.[1]?.trim() ?? "";
  };

  const role = get("role");
  const baseSalary = parseMoney(get("baseSalary"));
  const startDate = get("startDate");

  if (!role) return `${index + 2}행: role/title이 필요합니다.`;
  if (!Number.isFinite(baseSalary) || baseSalary <= 0) return `${index + 2}행: baseSalary가 필요합니다.`;
  if (!startDate) return `${index + 2}행: startDate가 필요합니다.`;

  return {
    rowId: `row_${String(index + 1).padStart(3, "0")}`,
    role,
    level: optional(get("level")),
    baseSalary,
    startDate,
    latestRaiseDate: optional(get("latestRaiseDate")),
    latestRaiseAmount: optionalNumber(get("latestRaiseAmount")),
    exceptionFlag: parseBoolean(get("exceptionFlag")),
    counterOfferFlag: parseBoolean(get("counterOfferFlag")),
    managerLabel: opaqueLabel(get("managerLabel"), "manager", managerMap),
    teamLabel: opaqueLabel(get("teamLabel"), "team", teamMap),
  };
}

function splitLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((part) => part.trim());
}

function parseMoney(value: string): number {
  return Number(value.replace(/[,\s원만원]/g, ""));
}

function optional(value: string): string | undefined {
  return value ? value : undefined;
}

function optionalNumber(value: string): number | undefined {
  const parsed = parseMoney(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseBoolean(value: string): boolean | undefined {
  if (!value) return undefined;
  return /true|yes|y|1|예|있음|해당/i.test(value);
}

function opaqueLabel(value: string, prefix: string, map: Map<string, string>): string | undefined {
  if (!value) return undefined;
  if (!map.has(value)) map.set(value, `${prefix}_${String.fromCharCode(97 + map.size)}`);
  return map.get(value);
}

function emptyResult(errors: string[]): RosterParseResult {
  return { rows: [], warnings: [], errors, rejectedColumns: [] };
}
```

- [ ] **Step 4: Create sample roster fixture**

Create `src/lib/hr-paysim/rosterFixtures.ts`:

```ts
import { parseRosterText } from "./roster.ts";

export const sampleRosterText = [
  "role\tlevel\tbaseSalary\tstartDate\tlatestRaiseDate\tlatestRaiseAmount\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
  "Product Engineer\tJunior\t68000000\t2021-03-01\t2023-04-01\t3000000\tfalse\tfalse\tManager A\tProduct",
  "Product Engineer\tJunior\t85000000\t2025-01-10\t\t\ttrue\ttrue\tManager B\tProduct",
  "Product Engineer\tSenior\t92000000\t2020-08-15\t2022-09-01\t2500000\tfalse\tfalse\tManager A\tProduct",
  "Platform Engineer\tMid\t88000000\t2022-02-01\t2024-02-01\t5000000\tfalse\tfalse\tManager C\tPlatform",
  "Platform Engineer\tSenior\t94000000\t2019-11-20\t2022-10-01\t2500000\tfalse\tfalse\tManager C\tPlatform",
  "Designer\tMid\t76000000\t2021-06-10\t2023-06-01\t3000000\tfalse\tfalse\tManager D\tDesign",
  "Designer\tSenior\t79000000\t2019-05-01\t2022-05-01\t1500000\tfalse\tfalse\tManager D\tDesign",
].join("\n");

export const sampleRosterRows = parseRosterText(sampleRosterText).rows;
```

- [ ] **Step 5: Run parser tests**

Run:

```powershell
npm test -- tests/hr-paysim/roster.test.ts
```

Expected:

```text
All roster parser tests pass.
```

- [ ] **Step 6: Commit parser**

Run:

```powershell
git add src/lib/hr-paysim/domain.ts src/lib/hr-paysim/roster.ts src/lib/hr-paysim/rosterFixtures.ts tests/hr-paysim/roster.test.ts
git commit -m "feat: add de-identified roster parser"
```

Expected:

```text
Commit succeeds.
```

---

### Task 3: Structural Findings Engine Slice

**Files:**
- Create: `src/lib/hr-paysim/structuralFindings.ts`
- Modify: `src/lib/hr-paysim/calculations.ts`
- Create: `tests/hr-paysim/structural-findings.test.ts`

**Interfaces:**
- Consumes:
  - `RosterRow[]`
- Produces:
  - `detectStructuralFindings(rows: RosterRow[]): StructuralFinding[]`
  - `estimateDoNothingCost(finding: StructuralFinding): number`

- [ ] **Step 1: Write findings tests**

Create `tests/hr-paysim/structural-findings.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";

test("detectStructuralFindings finds inversion, band overlap, and loyalty tax", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const types = findings.map((finding) => finding.type);

  assert.ok(types.includes("pay_inversion"));
  assert.ok(types.includes("band_overlap"));
  assert.ok(types.includes("loyalty_tax"));
});

test("findings include roster-derived evidence and explanation text", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const top = findings[0];

  assert.ok(top);
  assert.ok(top.evidence.length >= 2);
  assert.ok(top.explanationText.length >= 30);
  assert.ok(top.affectedRowIds.every((id) => id.startsWith("row_")));
  assert.ok(top.estimatedDoNothingCost > 0);
});

test("findings are sorted by severity and do-nothing cost", () => {
  const findings = detectStructuralFindings(sampleRosterRows);

  assert.ok(findings.length >= 3);
  assert.ok(findings[0]!.estimatedDoNothingCost >= findings[findings.length - 1]!.estimatedDoNothingCost);
});
```

- [ ] **Step 2: Implement first three detectors**

Create `src/lib/hr-paysim/structuralFindings.ts`:

```ts
import type { RosterRow, StructuralFinding } from "./domain.ts";

export function detectStructuralFindings(rows: RosterRow[]): StructuralFinding[] {
  return [
    ...detectPayInversion(rows),
    ...detectBandOverlap(rows),
    ...detectLoyaltyTax(rows),
  ].sort((a, b) => severityScore(b) - severityScore(a) || b.estimatedDoNothingCost - a.estimatedDoNothingCost);
}

export function estimateDoNothingCost(finding: StructuralFinding): number {
  return finding.estimatedDoNothingCost;
}

function detectPayInversion(rows: RosterRow[]): StructuralFinding[] {
  const findings: StructuralFinding[] = [];
  const byRole = groupBy(rows, (row) => row.role);

  for (const [role, roleRows] of byRole) {
    const sortedByTenure = [...roleRows].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const senior = sortedByTenure[0];
    const junior = sortedByTenure[sortedByTenure.length - 1];
    if (!senior || !junior || senior.rowId === junior.rowId) continue;
    const gap = junior.baseSalary - senior.baseSalary;
    if (gap <= 0) continue;
    findings.push({
      id: `finding_pay_inversion_${role.toLowerCase().replace(/\W+/g, "_")}`,
      type: "pay_inversion",
      severity: gap >= 10000000 ? "critical" : "high",
      title: "신규/후입사자가 기존 구성원보다 높게 형성된 역전",
      summary: `${role}에서 후입사자의 base 연봉이 장기 근속자보다 ${formatWon(gap)} 높습니다.`,
      evidence: [
        `${senior.rowId}: ${role}, 입사 ${senior.startDate}, base ${formatWon(senior.baseSalary)}`,
        `${junior.rowId}: ${role}, 입사 ${junior.startDate}, base ${formatWon(junior.baseSalary)}`,
      ],
      affectedRowIds: [senior.rowId, junior.rowId],
      estimatedDoNothingCost: Math.max(gap * 2, 5000000),
      explanationText: "이 문제는 단순히 한 명의 연봉이 높은 것이 아니라, 다음 유사 채용과 내부 설명의 기준을 흔드는 선례가 될 수 있습니다.",
      confidence: "high",
    });
  }

  return findings;
}

function detectBandOverlap(rows: RosterRow[]): StructuralFinding[] {
  const byRole = groupBy(rows.filter((row) => row.level), (row) => row.role);
  const findings: StructuralFinding[] = [];

  for (const [role, roleRows] of byRole) {
    const byLevel = groupBy(roleRows, (row) => row.level ?? "unknown");
    const levels = [...byLevel.entries()];
    if (levels.length < 2) continue;

    const ranges = levels.map(([level, levelRows]) => ({
      level,
      min: Math.min(...levelRows.map((row) => row.baseSalary)),
      max: Math.max(...levelRows.map((row) => row.baseSalary)),
      rows: levelRows,
    }));

    for (let index = 0; index < ranges.length - 1; index += 1) {
      const lower = ranges[index]!;
      const upper = ranges[index + 1]!;
      const overlap = lower.max - upper.min;
      if (overlap <= 0) continue;
      findings.push({
        id: `finding_band_overlap_${role.toLowerCase().replace(/\W+/g, "_")}_${index}`,
        type: "band_overlap",
        severity: overlap >= 7000000 ? "high" : "medium",
        title: "레벨 간 연봉 범위가 겹쳐 레벨 설명력이 약해짐",
        summary: `${role}의 ${lower.level}와 ${upper.level} 연봉 범위가 ${formatWon(overlap)} 겹칩니다.`,
        evidence: [
          `${lower.level}: ${formatWon(lower.min)}-${formatWon(lower.max)}`,
          `${upper.level}: ${formatWon(upper.min)}-${formatWon(upper.max)}`,
        ],
        affectedRowIds: [...lower.rows, ...upper.rows].map((row) => row.rowId),
        estimatedDoNothingCost: overlap * 1.5,
        explanationText: "레벨이 있어도 연봉 범위가 겹치면 승진, 보상, 채용 대화에서 기준점이 사라집니다.",
        confidence: "medium",
      });
    }
  }

  return findings;
}

function detectLoyaltyTax(rows: RosterRow[]): StructuralFinding[] {
  const currentYear = 2026;
  const longTenure = rows.filter((row) => currentYear - new Date(row.startDate).getFullYear() >= 4);
  const recent = rows.filter((row) => currentYear - new Date(row.startDate).getFullYear() <= 2);
  if (longTenure.length === 0 || recent.length === 0) return [];

  const longAvg = average(longTenure.map((row) => row.baseSalary));
  const recentAvg = average(recent.map((row) => row.baseSalary));
  const gap = recentAvg - longAvg;
  if (gap <= 3000000) return [];

  return [
    {
      id: "finding_loyalty_tax",
      type: "loyalty_tax",
      severity: gap >= 8000000 ? "high" : "medium",
      title: "초기 구성원이 시장 드리프트 대비 낮아진 근속 페널티",
      summary: `최근 입사자 평균 base가 장기 근속자 평균보다 ${formatWon(gap)} 높습니다.`,
      evidence: [
        `장기 근속 평균: ${formatWon(longAvg)}`,
        `최근 입사 평균: ${formatWon(recentAvg)}`,
      ],
      affectedRowIds: [...longTenure, ...recent].map((row) => row.rowId),
      estimatedDoNothingCost: gap * Math.min(longTenure.length, 5),
      explanationText: "초기 구성원이 외부 면접을 보기 전까지는 조용하지만, 비교가 시작되면 신뢰와 retention 비용이 동시에 커질 수 있습니다.",
      confidence: "medium",
    },
  ];
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return map;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function severityScore(finding: StructuralFinding): number {
  const scores = { low: 1, medium: 2, high: 3, critical: 4 };
  return scores[finding.severity];
}

function formatWon(value: number): string {
  return `${Math.round(value / 10000).toLocaleString("ko-KR")}만원`;
}
```

- [ ] **Step 3: Transition `calculations.ts`**

Modify `src/lib/hr-paysim/calculations.ts` to export the roster finding API during transition:

```ts
export { detectStructuralFindings, estimateDoNothingCost } from "./structuralFindings.ts";
export type { StructuralFinding } from "./domain.ts";
```

Expected:

```text
Old scalar diagnosis call sites will fail until later UI/session tasks migrate them. That is acceptable inside this task only if tests for the new engine pass and typecheck is deferred until Task 6 rewires call sites.
```

- [ ] **Step 4: Run findings tests**

Run:

```powershell
npm test -- tests/hr-paysim/structural-findings.test.ts
```

Expected:

```text
All structural finding tests pass.
```

- [ ] **Step 5: Commit findings engine**

Run:

```powershell
git add src/lib/hr-paysim/structuralFindings.ts src/lib/hr-paysim/calculations.ts tests/hr-paysim/structural-findings.test.ts
git commit -m "feat: detect roster structural pay findings"
```

Expected:

```text
Commit succeeds.
```

---

### Task 4: Roster-Specific Interpretation, Recommendations, And Memo

**Files:**
- Modify: `src/lib/hr-paysim/copy.ts`
- Modify: `src/lib/hr-paysim/recommendations.ts`
- Modify: `src/lib/hr-paysim/memo.ts`
- Create/modify: `tests/hr-paysim/copy.test.ts`
- Create/modify: `tests/hr-paysim/recommendations.test.ts`
- Modify: `tests/hr-paysim/memo.test.ts`

**Interfaces:**
- Consumes:
  - `StructuralFinding[]`
- Produces:
  - `getFindingInterpretation(findings: StructuralFinding[]): InterpretationText`
  - `recommendScenarios(findings: StructuralFinding[]): ScenarioRecommendation[]`
  - `generateMemoPreviewText(input: MemoPreviewInput): string`

- [ ] **Step 1: Write interpretation tests**

Add to `tests/hr-paysim/copy.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getFindingInterpretation } from "../../src/lib/hr-paysim/copy.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";

test("getFindingInterpretation cites roster-derived evidence", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const interpretation = getFindingInterpretation(findings);

  assert.match(interpretation.headline, /비교|설명|구조|지뢰/);
  assert.ok(interpretation.body.length >= 40);
  assert.ok(interpretation.supportingPoints.length >= 3);
  assert.ok(interpretation.supportingPoints.some((point) => point.includes("row_")));
});
```

- [ ] **Step 2: Write recommendation tests**

Create `tests/hr-paysim/recommendations.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { recommendScenarios } from "../../src/lib/hr-paysim/recommendations.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";

test("recommendScenarios includes do-nothing as a first-class scenario", () => {
  const findings = detectStructuralFindings(sampleRosterRows);
  const scenarios = recommendScenarios(findings);

  assert.equal(scenarios[0]?.scenarioId, "baseline_current_state");
  assert.match(scenarios[0]?.reason ?? "", /방치|비용|선례/);
  assert.ok(scenarios.some((scenario) => scenario.reason.includes("row_") || scenario.whatItChecks.includes("지뢰")));
});
```

- [ ] **Step 3: Update memo tests**

Modify `tests/hr-paysim/memo.test.ts` so memo output includes:

```ts
assert.match(memoText, /보상 구조 지뢰|비교 폭탄|설명 가능성/);
assert.match(memoText, /얻는 것/);
assert.match(memoText, /감수할 것/);
assert.match(memoText, /방치 비용/);
assert.match(memoText, /다음 90일/);
```

- [ ] **Step 4: Implement finding interpretation**

Modify `src/lib/hr-paysim/copy.ts`:

```ts
import type { StructuralFinding } from "./domain.ts";

export interface InterpretationText {
  headline: string;
  body: string;
  supportingPoints: string[];
  caution?: string;
}

export const FORBIDDEN_PAY_SIM_WORDING = [
  "AI substitution",
  "job replacement",
  "Total Work Cost",
  "attrition probability",
  "salary calculator",
  "퇴직 확률",
  "대체율",
] as const;

export function getFindingInterpretation(findings: StructuralFinding[]): InterpretationText {
  const top = findings[0];
  if (!top) {
    return {
      headline: "비교 폭탄으로 보이는 구조 지뢰는 아직 발견되지 않았습니다.",
      body: "현재 입력된 비식별 로스터만으로는 즉시 조치가 필요한 보상 비교 리스크가 크지 않습니다.",
      supportingPoints: ["최소 입력 기준으로 분석했습니다.", "인상 이력과 예외 여부를 추가하면 더 정밀하게 볼 수 있습니다."],
    };
  }

  return {
    headline: "팀원들이 먼저 발견하기 전에 봐야 할 보상 구조 지뢰가 있습니다.",
    body: `${top.title}이 가장 먼저 보입니다. 이 문제는 연봉 수준 하나의 문제가 아니라, 구성원이 서로 비교하는 순간 설명 가능한 기준이 버티는지의 문제입니다.`,
    supportingPoints: [
      ...top.evidence.map((item) => `${top.id}: ${item}`),
      `방치 비용 추정: ${Math.round(top.estimatedDoNothingCost / 10000).toLocaleString("ko-KR")}만원`,
      `신뢰도: ${top.confidence}`,
    ],
    caution: "이 해석은 이름 없는 구조 분석이며 개인별 연봉 추천이 아닙니다.",
  };
}
```

- [ ] **Step 5: Implement roster-specific recommendations**

Modify `src/lib/hr-paysim/recommendations.ts`:

```ts
import type { ScenarioRecommendation, StructuralFinding } from "./domain.ts";

export function recommendScenarios(findings: StructuralFinding[]): ScenarioRecommendation[] {
  const top = findings[0];
  const scenarios: ScenarioRecommendation[] = [
    {
      scenarioId: "baseline_current_state",
      priority: "primary",
      reason: top
        ? `지금 방치하면 ${top.title}이 선례와 설명 부채로 커질 수 있습니다. 방치 비용을 먼저 비교합니다.`
        : "현재 구조를 유지하는 선택의 조건을 확인합니다.",
      whatItChecks: "아무것도 하지 않을 때 구조 지뢰가 어떻게 커지는지 봅니다.",
      whatItWillNotClaim: "개인별 적정 연봉이나 이탈 확률을 예측하지 않습니다.",
      expectedDecisionOutput: "방치 조건과 재점검 시점",
    },
  ];

  if (top) {
    scenarios.push({
      scenarioId: top.type === "band_overlap" ? "redesign_salary_bands" : "resolve_pay_inversion",
      priority: "secondary",
      reason: `${top.affectedRowIds.slice(0, 3).join(", ")}에서 보이는 지뢰를 먼저 정리합니다.`,
      whatItChecks: `${top.title} 대응 비용과 설명 가능성 회복 범위를 확인합니다.`,
      whatItWillNotClaim: "시장 연봉 데이터나 개인별 보상 처방을 제공하지 않습니다.",
      expectedDecisionOutput: "정리할 비교 구간과 설명 기준",
    });
  }

  return scenarios;
}
```

- [ ] **Step 6: Update memo generator**

Modify `src/lib/hr-paysim/memo.ts` so generated memo has these sections:

```text
- 지금 보이는 보상 구조 지뢰
- 왜 단순 연봉 수준 문제가 아닌가
- 얻는 것
- 감수할 것
- 방치 비용
- 다음 90일 질문
```

- [ ] **Step 7: Run copy/recommendation/memo tests**

Run:

```powershell
npm test -- tests/hr-paysim/copy.test.ts tests/hr-paysim/recommendations.test.ts tests/hr-paysim/memo.test.ts
```

Expected:

```text
All selected tests pass.
```

- [ ] **Step 8: Commit interpretation layer**

Run:

```powershell
git add src/lib/hr-paysim/copy.ts src/lib/hr-paysim/recommendations.ts src/lib/hr-paysim/memo.ts tests/hr-paysim/copy.test.ts tests/hr-paysim/recommendations.test.ts tests/hr-paysim/memo.test.ts
git commit -m "feat: generate roster-specific interpretation"
```

Expected:

```text
Commit succeeds.
```

---

### Task 5: Session And Step Registry Migration

**Files:**
- Modify: `src/routes/hr-paysim/stepRegistry.ts`
- Modify: `src/lib/hr-paysim/session.ts`
- Modify: `tests/hr-paysim/session.test.ts`

**Interfaces:**
- Consumes:
  - `RosterParseResult`
  - `StructuralFinding[]`
- Produces:
  - `PaySimSessionState` with roster parse and findings state.

- [ ] **Step 1: Update step registry tests**

Modify `tests/hr-paysim/session.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { PAY_SIM_STEPS } from "../../src/routes/hr-paysim/stepRegistry.ts";

test("PAY_SIM_STEPS follows the roster wedge flow and excludes ai_check", () => {
  assert.deepEqual(
    PAY_SIM_STEPS.map((step) => step.id),
    [
      "entry",
      "roster_intake",
      "deidentify_confirm",
      "structural_findings",
      "expert_interpretation",
      "recommendations",
      "comparison",
      "memo_preview",
    ],
  );
});
```

- [ ] **Step 2: Update step registry**

Modify `src/routes/hr-paysim/stepRegistry.ts`:

```ts
import type { PaySimStepDefinition } from "../../lib/hr-paysim/domain";

export const PAY_SIM_STEPS: PaySimStepDefinition[] = [
  { id: "entry", route: "/hr-paysim/entry", title: "시작", subtitle: "보상 비교 폭탄" },
  { id: "roster_intake", route: "/hr-paysim/roster", title: "로스터", subtitle: "비식별 입력" },
  { id: "deidentify_confirm", route: "/hr-paysim/deidentify", title: "확인", subtitle: "비식별 검증" },
  { id: "structural_findings", route: "/hr-paysim/findings", title: "지뢰", subtitle: "구조 발견" },
  { id: "expert_interpretation", route: "/hr-paysim/interpretation", title: "해석", subtitle: "전문가 관점" },
  { id: "recommendations", route: "/hr-paysim/recommendations", title: "대응", subtitle: "시나리오" },
  { id: "comparison", route: "/hr-paysim/comparison", title: "비교", subtitle: "트레이드오프" },
  { id: "memo_preview", route: "/hr-paysim/memo-preview", title: "메모", subtitle: "의사결정 메모" },
];
```

- [ ] **Step 3: Update session state**

Modify `src/lib/hr-paysim/session.ts`:

```ts
import type { PaySimStep, RosterParseResult, ScenarioId, StructuralFinding } from "./domain.ts";

export interface PaySimSessionState {
  currentStep: PaySimStep;
  completedSteps: PaySimStep[];
  mode: "hr_prism_triggered" | "preview";
  rosterText?: string;
  rosterParse?: RosterParseResult;
  findings: StructuralFinding[];
  selectedScenarioIds: ScenarioId[];
  stale: {
    rosterParse: boolean;
    findings: boolean;
    recommendations: boolean;
    comparison: boolean;
    memoPreview: boolean;
  };
}
```

Update `createInitialSession()` so `findings: []` and stale flags match this shape.

- [ ] **Step 4: Update input invalidation**

Replace `updateInputDraft()` with:

```ts
export function updateRosterText(session: PaySimSessionState, rosterText: string): PaySimSessionState {
  return {
    ...session,
    rosterText,
    rosterParse: undefined,
    findings: [],
    completedSteps: session.completedSteps.filter((step) => step === "entry"),
    stale: {
      rosterParse: true,
      findings: true,
      recommendations: true,
      comparison: true,
      memoPreview: true,
    },
  };
}
```

- [ ] **Step 5: Run session tests**

Run:

```powershell
npm test -- tests/hr-paysim/session.test.ts
```

Expected:

```text
Session tests pass with the new 8-step flow.
```

- [ ] **Step 6: Commit session migration**

Run:

```powershell
git add src/routes/hr-paysim/stepRegistry.ts src/lib/hr-paysim/session.ts tests/hr-paysim/session.test.ts
git commit -m "feat: migrate session to roster wedge flow"
```

Expected:

```text
Commit succeeds.
```

---

### Task 6: Canonical Shell Screens For Vertical Slice

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/hr-paysim/PaySimShell.tsx`
- Modify: `src/components/hr-paysim/PaySimStepper.tsx`
- Modify: `src/components/hr-paysim/screens/index.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes:
  - `parseRosterText`
  - `detectStructuralFindings`
  - `getFindingInterpretation`
  - `recommendScenarios`
  - `generateMemoPreviewText`
- Produces:
  - A running 8-step roster wedge vertical slice.

- [ ] **Step 1: Mount `PaySimShell`**

Modify `src/App.tsx`:

```tsx
import { PaySimShell } from "./components/hr-paysim/PaySimShell.tsx";

export default function App() {
  return <PaySimShell />;
}
```

- [ ] **Step 2: Implement shell-owned state flow**

Modify `src/components/hr-paysim/PaySimShell.tsx` so it owns session state and derives:

```ts
const rosterParse = session.rosterText ? parseRosterText(session.rosterText) : undefined;
const findings = rosterParse?.errors.length ? [] : detectStructuralFindings(rosterParse?.rows ?? []);
const interpretation = getFindingInterpretation(findings);
const recommendations = recommendScenarios(findings);
const memoText = generateMemoPreviewText({ findings, recommendations, interpretation });
```

Expected:

```text
The shell no longer expects an external `session` prop.
```

- [ ] **Step 3: Implement screen components**

Modify `src/components/hr-paysim/screens/index.tsx` to export and render:

```text
EntryScreen
RosterIntakeScreen
DeidentifyConfirmScreen
StructuralFindingsScreen
ExpertInterpretationScreen
RecommendationsScreen
ComparisonScreen
MemoPreviewScreen
```

Minimum content requirements:

```text
Entry: product promise plus sample roster preview CTA.
Roster intake: textarea paste input, sample fill, validation output.
Deidentify confirm: valid row count, rejected columns, opaque manager/team labels.
Structural findings: top findings with evidence and do-nothing cost.
Expert interpretation: finding-specific interpretation using row ids and amounts.
Recommendations: do-nothing first, then response scenario.
Comparison: cash cost, explanation debt, execution burden.
Memo preview: final memo text and copy button.
```

- [ ] **Step 4: Remove `type="number"` from remaining amount fields**

For any remaining scalar amount fields in the vertical slice, use:

```tsx
<input type="text" inputMode="decimal" />
```

Expected:

```text
The reported two-digit numeric input bug cannot recur in the new roster path.
```

- [ ] **Step 5: Run app gates**

Run:

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

Expected:

```text
All gates pass.
```

- [ ] **Step 6: Commit shell vertical slice**

Run:

```powershell
git add src/App.tsx src/components/hr-paysim/PaySimShell.tsx src/components/hr-paysim/PaySimStepper.tsx src/components/hr-paysim/screens/index.tsx src/styles.css
git commit -m "feat: build roster wedge vertical slice"
```

Expected:

```text
Commit succeeds.
```

---

### Task 7: Consent, Privacy, And Copy Integrity

**Files:**
- Modify: `src/lib/hr-paysim/consent.ts`
- Modify: `tests/hr-paysim/consent.test.ts`
- Modify: `scripts/check-forbidden-copy.ts`
- Modify: `docs/hr-paysim/14_roster_vertical_slice_qa.md`

**Interfaces:**
- Produces:
  - `createRosterAnalysisConsentPayload(...)`
  - copy lint that rejects mojibake and prohibited framing.

- [ ] **Step 1: Update consent tests**

Modify `tests/hr-paysim/consent.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createRosterAnalysisConsentPayload } from "../../src/lib/hr-paysim/consent.ts";
import { sampleRosterRows } from "../../src/lib/hr-paysim/rosterFixtures.ts";

test("createRosterAnalysisConsentPayload returns null before consent", () => {
  const payload = createRosterAnalysisConsentPayload({ consentForDeidentifiedStructureAnalysis: false }, sampleRosterRows);
  assert.equal(payload, null);
});

test("createRosterAnalysisConsentPayload excludes direct identifiers and raw names", () => {
  const payload = createRosterAnalysisConsentPayload({ consentForDeidentifiedStructureAnalysis: true }, sampleRosterRows);
  const serialized = JSON.stringify(payload);

  assert.ok(payload);
  for (const forbidden of ["name", "email", "phone", "residentId", "employeeId", "rawCsv"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
```

- [ ] **Step 2: Implement roster consent payload**

Modify `src/lib/hr-paysim/consent.ts`:

```ts
import type { RosterRow } from "./domain.ts";

export interface RosterAnalysisConsentState {
  consentForDeidentifiedStructureAnalysis: boolean;
}

export function createRosterAnalysisConsentPayload(
  consent: RosterAnalysisConsentState,
  rows: RosterRow[],
) {
  if (!consent.consentForDeidentifiedStructureAnalysis) return null;
  return {
    rowCount: rows.length,
    roles: Array.from(new Set(rows.map((row) => row.role))).sort(),
    hasManagerLabels: rows.some((row) => row.managerLabel),
    hasTeamLabels: rows.some((row) => row.teamLabel),
  };
}
```

- [ ] **Step 3: Add mojibake lint**

Modify `scripts/check-forbidden-copy.ts` so it rejects common mojibake markers:

```ts
const mojibake = ["�", "?댁", "?곗", "?쒕", "吏", "蹂", "湲", "媛"];
```

Expected:

```text
Lint fails if newly committed Korean copy is mojibake-contaminated.
```

- [ ] **Step 4: Run privacy/copy gates**

Run:

```powershell
npm test -- tests/hr-paysim/consent.test.ts
npm run lint
```

Expected:

```text
Consent tests and copy lint pass.
```

- [ ] **Step 5: Commit privacy updates**

Run:

```powershell
git add src/lib/hr-paysim/consent.ts tests/hr-paysim/consent.test.ts scripts/check-forbidden-copy.ts
git commit -m "fix: reframe consent for de-identified roster analysis"
```

Expected:

```text
Commit succeeds.
```

---

### Task 8: Browser QA And Decision Gate

**Files:**
- Create/modify: `docs/hr-paysim/14_roster_vertical_slice_qa.md`
- Modify app files only if QA finds defects.

**Interfaces:**
- Produces:
  - Browser evidence and user decision gate before full detector expansion.

- [ ] **Step 1: Start local server**

Run:

```powershell
npm run dev -- --port 5173
```

Expected:

```text
Vite serves the app at http://127.0.0.1:5173/hr-paysim/entry.
```

- [ ] **Step 2: Run desktop flow QA**

Verify:

```text
entry -> roster -> deidentify -> findings -> interpretation -> recommendations -> comparison -> memo-preview
```

Expected:

```text
Sample roster produces at least three findings.
Findings cite row ids and amounts.
Do-nothing appears as a first-class scenario.
Memo includes the core decision framing.
No console errors.
```

- [ ] **Step 3: Run privacy QA**

Verify:

```text
Paste a roster with name/email columns.
The parser rejects the input and does not proceed.
SessionStorage does not contain names/emails/employee ids.
Manager/team labels are opaque.
```

Expected:

```text
Direct identifiers are blocked or absent from persisted state.
```

- [ ] **Step 4: Run numeric input regression QA**

Verify any remaining numeric text fields:

```text
Type 12, 80, 120, 1,000, and 72000000.
Values remain editable and do not truncate to one digit.
```

Expected:

```text
The two-digit input bug is not reproducible in the new vertical slice.
```

- [ ] **Step 5: Run accessibility/focus QA**

Verify:

```text
Step changes move focus to the main heading.
Current step exposes aria-current="step".
Locked future steps are not keyboard-activatable.
Textarea, sample CTA, consent controls, copy button, and back/next buttons are keyboard reachable.
```

Expected:

```text
Accessibility/focus checks pass.
```

- [ ] **Step 6: Write QA report**

Create or update `docs/hr-paysim/14_roster_vertical_slice_qa.md`:

```markdown
# HR PaySim Roster Vertical Slice QA

## Commands

- npm test
- npm run lint
- npm run typecheck
- npm run build

## Browser Flow

- Desktop result:
- Mobile result:
- Console errors:

## Privacy

- PII column rejection:
- SessionStorage direct identifier check:
- Opaque manager/team label check:

## Numeric Input Regression

- Two-digit entry result:

## Accessibility And Focus

- Route focus:
- Stepper aria-current:
- Keyboard reachability:

## Decision Gate

- Ready to expand remaining findings: yes/no
- Ready to delete PrototypePaySimApp: yes/no
- Ready to revisit main merge: no
```

- [ ] **Step 7: Stop for user review**

Report:

```text
The roster wedge vertical slice is implemented and QA evidence is saved. Please review before expanding the remaining findings or deleting PrototypePaySimApp.
```

Do not delete `PrototypePaySimApp` or merge to main before user approval.

---

### Task 9: Post-Slice Expansion Plan

**Files:**
- Modify: `src/lib/hr-paysim/structuralFindings.ts`
- Modify: `tests/hr-paysim/structural-findings.test.ts`
- Modify: `docs/hr-paysim/14_roster_vertical_slice_qa.md`

**Interfaces:**
- Extends:
  - `detectStructuralFindings(rows)`

- [ ] **Step 1: Add detector tests for remaining catalog**

Add tests for:

```text
exception_clustering
top_compression
adjacent_leakage
```

Expected:

```text
Tests fail until detectors are added.
```

- [ ] **Step 2: Implement remaining detectors**

Extend `detectStructuralFindings(rows)` with:

```text
- exception clustering by manager/team
- top compression between senior and lead levels
- adjacent leakage between comparable roles
```

- [ ] **Step 3: Full gates**

Run:

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

Expected:

```text
All gates pass.
```

- [ ] **Step 4: Architecture cleanup decision**

After user approval, delete the old monolithic path:

```powershell
git add -u src/components/hr-paysim/PrototypePaySimApp.tsx
git commit -m "refactor: remove legacy PaySim prototype app"
```

Expected:

```text
Only the canonical PaySimShell flow remains.
```

---

## Self-Review

- Spec coverage: The plan follows the new brief as the main source: roster wedge, de-identified client-side processing, value-first flow, do-nothing scenario, rich interpretation, AI step deferred, and vertical slice first.
- Prior request compatibility: It keeps main merge hold, duplicate architecture cleanup, accessibility/focus QA, old engine as reference only, and the numeric input bug record. It does not execute the parked engine reconciliation plan.
- Placeholder scan: No task uses TBD/TODO placeholders. Unknown later scope is expressed as explicit post-slice expansion.
- Type consistency: `RosterRow`, `RosterParseResult`, `StructuralFinding`, and new `PaySimStep` values are defined before tasks reference them.
