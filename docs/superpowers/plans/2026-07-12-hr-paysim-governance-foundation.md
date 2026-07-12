# HR PaySim Governance Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one portable PaySim diagnostic-product Adapter, verify it against pinned Transition Gap governance sources without committing a local machine path, record a Governance Preflight, and install concise future-agent authority guidance without touching product code or Task 9 implementation.

**Architecture:** A committed Adapter points to `.governance/upstream/docs/...`; an ignored local junction or symlink resolves that path to the real `transition-gap` checkout. A Node resolver validates repository identity and commit `790eb99`, while the installed Python governance verifier remains the schema authority. The Preflight records only repository identity, revision, evidence mappings, boundaries, and gate status.

**Tech Stack:** Markdown, Node.js ESM and built-in test runner, Git CLI, Python 3, installed `diagnostic-product-governance` skill, PowerShell on Windows.

## Global Constraints

- Work only in the existing repository root on branch `codex/facilitated-decision-room`.
- Scope remains `GOVERNANCE_ONLY`; do not modify `src/`, product tests, fixtures, browser QA, or the current Task 9 working files.
- Do not modify the Transition Gap repository, the shared Constitution, casebook, Adapter template, installed skill, or HR Prism code.
- Pin shared governance to repository `transition-gap`, branch context `codex/diagnostic-product-governance`, commit `790eb99`.
- Commit no absolute upstream checkout path, home directory, OneDrive path, junction, symlink, or local config.
- Create exactly one PaySim Adapter at `docs/diagnostic-product-adapter.md`; never create `docs/hr-paysim/diagnostic-product-adapter.md`.
- The Adapter references `DP-*` and `CASE-*` IDs and does not reproduce shared Constitution prose.
- Task 9 remains uncommitted until its real human comprehension gate passes; governance verification cannot certify it.
- `PAYSIM_GOVERNANCE_UPSTREAM` takes precedence over `.governance/governance.local.json`.
- Fail closed on missing configuration, wrong repository identity, absent pinned commit, unsafe existing link, or unresolved authority conflict.
- Stage every governance commit by exact path and preserve all unrelated dirty-worktree files.

---

## File Responsibility Map

- `.gitignore`: keeps the entire local `.governance/` resolver directory out of Git.
- `scripts/verify-diagnostic-governance.mjs`: resolves local configuration, verifies the upstream Git checkout and pin, safely prepares the ignored link, and prints a path-free JSON report.
- `tests/governance/diagnostic-governance-resolver.test.mjs`: locks configuration precedence, fail-closed parsing, drift reporting, and path-redaction behavior.
- `docs/diagnostic-product-adapter.md`: canonical PaySim scope, authority, principle mapping, candidate evidence, local rules, forbidden transfers, feedback path, and verification commands.
- `docs/hr-paysim/validation/2026-07-12-governance-preflight.md`: dated, evidence-backed Governance Preflight and open-gate record.
- `AGENTS.md`: short root read order, scope lock, product authority split, verification, and stop gates.
- `docs/hr-paysim/final-design-acceptance.md`: receives only a legacy-authority banner.
- `docs/hr-paysim/19_sample_output_contract.md`: receives only a fixture-authority banner.

### Task 1: Build The Portable Upstream Resolver

**Files:**
- Modify: `.gitignore`
- Create: `tests/governance/diagnostic-governance-resolver.test.mjs`
- Create: `scripts/verify-diagnostic-governance.mjs`

**Interfaces:**
- Consumes: `PAYSIM_GOVERNANCE_UPSTREAM`, optional `.governance/governance.local.json` shaped as `{ "upstreamRoot": "..." }`, Git CLI, repository root.
- Produces: `selectUpstreamSource({ envValue, configText })`, `createGovernanceReport({ source, branch, head, pinnedCommit })`, `prepareUpstreamLink({ projectRoot, upstreamRoot })`, and CLI JSON with `status`, `repository`, `source`, `branch`, `head`, `pinnedCommit`, `drift`, and `adapterRoot`.

- [ ] **Step 1: Add the ignored local resolver directory**

Append exactly this line to `.gitignore`:

```gitignore
.governance/
```

- [ ] **Step 2: Write failing resolver unit tests**

Create `tests/governance/diagnostic-governance-resolver.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import {
  PINNED_COMMIT,
  createGovernanceReport,
  selectUpstreamSource,
} from "../../scripts/verify-diagnostic-governance.mjs";

test("environment configuration takes precedence without entering the report", () => {
  const selected = selectUpstreamSource({
    envValue: "C:/private/transition-gap",
    configText: JSON.stringify({ upstreamRoot: "D:/other/transition-gap" }),
  });

  assert.deepEqual(selected, {
    source: "environment",
    upstreamRoot: "C:/private/transition-gap",
  });

  const report = createGovernanceReport({
    source: selected.source,
    branch: "codex/diagnostic-product-governance",
    head: PINNED_COMMIT,
    pinnedCommit: PINNED_COMMIT,
  });
  assert.equal(JSON.stringify(report).includes("C:/private"), false);
  assert.equal(report.drift, false);
});

test("ignored local config is the fallback", () => {
  assert.deepEqual(
    selectUpstreamSource({
      envValue: "",
      configText: JSON.stringify({ upstreamRoot: "C:/local/transition-gap" }),
    }),
    { source: "local_config", upstreamRoot: "C:/local/transition-gap" },
  );
});

test("missing or malformed local configuration fails closed", () => {
  assert.throws(
    () => selectUpstreamSource({ envValue: "", configText: undefined }),
    /GOVERNANCE_UPSTREAM_NOT_CONFIGURED/,
  );
  assert.throws(
    () => selectUpstreamSource({ envValue: "", configText: "{}" }),
    /GOVERNANCE_LOCAL_CONFIG_INVALID/,
  );
  assert.throws(
    () => selectUpstreamSource({ envValue: "", configText: "not-json" }),
    /GOVERNANCE_LOCAL_CONFIG_INVALID/,
  );
});

test("branch movement is reported without changing the pin", () => {
  const report = createGovernanceReport({
    source: "environment",
    branch: "codex/diagnostic-product-governance",
    head: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    pinnedCommit: PINNED_COMMIT,
  });

  assert.equal(report.pinnedCommit, "790eb99");
  assert.equal(report.drift, true);
  assert.equal("upstreamRoot" in report, false);
});
```

- [ ] **Step 3: Run the focused test and verify red**

Run:

```powershell
node --test tests/governance/diagnostic-governance-resolver.test.mjs
```

Expected: FAIL because `scripts/verify-diagnostic-governance.mjs` does not exist.

- [ ] **Step 4: Implement the resolver and fail-closed CLI**

Create `scripts/verify-diagnostic-governance.mjs`:

```js
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PINNED_COMMIT = "790eb99";
export const REPOSITORY_ID = "transition-gap";
const REQUIRED_FILES = [
  "docs/diagnostic-product-constitution.md",
  "docs/diagnostic-before-after-casebook.md",
  "docs/templates/diagnostic-product-adapter-template.md",
];

export function selectUpstreamSource({ envValue, configText }) {
  const fromEnvironment = envValue?.trim();
  if (fromEnvironment) {
    return { source: "environment", upstreamRoot: fromEnvironment };
  }

  if (configText === undefined) {
    throw new Error("GOVERNANCE_UPSTREAM_NOT_CONFIGURED");
  }

  try {
    const parsed = JSON.parse(configText);
    if (typeof parsed.upstreamRoot !== "string" || !parsed.upstreamRoot.trim()) {
      throw new Error("invalid");
    }
    return { source: "local_config", upstreamRoot: parsed.upstreamRoot.trim() };
  } catch {
    throw new Error("GOVERNANCE_LOCAL_CONFIG_INVALID");
  }
}

export function createGovernanceReport({ source, branch, head, pinnedCommit }) {
  return {
    status: "OK",
    repository: REPOSITORY_ID,
    source,
    branch,
    head,
    pinnedCommit,
    drift: !head.startsWith(pinnedCommit),
    adapterRoot: ".governance/upstream",
  };
}

function runGit(upstreamRoot, args) {
  return execFileSync("git", ["-C", upstreamRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function validateUpstreamRepository(upstreamRoot) {
  const realRoot = realpathSync(resolve(upstreamRoot));
  const gitRoot = realpathSync(runGit(realRoot, ["rev-parse", "--show-toplevel"]));
  if (realRoot !== gitRoot || basename(realRoot).toLowerCase() !== REPOSITORY_ID) {
    throw new Error("GOVERNANCE_UPSTREAM_REPOSITORY_MISMATCH");
  }
  for (const relativePath of REQUIRED_FILES) {
    if (!existsSync(join(realRoot, relativePath))) {
      throw new Error(`GOVERNANCE_UPSTREAM_FILE_MISSING:${relativePath}`);
    }
  }
  runGit(realRoot, ["cat-file", "-e", `${PINNED_COMMIT}^{commit}`]);
  return {
    realRoot,
    branch: runGit(realRoot, ["branch", "--show-current"]) || "DETACHED",
    head: runGit(realRoot, ["rev-parse", "HEAD"]),
  };
}

export function prepareUpstreamLink({ projectRoot, upstreamRoot }) {
  const governanceDirectory = join(projectRoot, ".governance");
  const linkPath = join(governanceDirectory, "upstream");
  mkdirSync(governanceDirectory, { recursive: true });

  if (existsSync(linkPath)) {
    const stat = lstatSync(linkPath);
    if (!stat.isSymbolicLink() || realpathSync(linkPath) !== upstreamRoot) {
      throw new Error("GOVERNANCE_UPSTREAM_LINK_UNSAFE");
    }
    return linkPath;
  }

  symlinkSync(upstreamRoot, linkPath, process.platform === "win32" ? "junction" : "dir");
  return linkPath;
}

function main() {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const configPath = join(projectRoot, ".governance", "governance.local.json");
  const selected = selectUpstreamSource({
    envValue: process.env.PAYSIM_GOVERNANCE_UPSTREAM,
    configText: existsSync(configPath) ? readFileSync(configPath, "utf8") : undefined,
  });
  const upstream = validateUpstreamRepository(selected.upstreamRoot);
  prepareUpstreamLink({ projectRoot, upstreamRoot: upstream.realRoot });
  console.log(JSON.stringify(createGovernanceReport({
    source: selected.source,
    branch: upstream.branch,
    head: upstream.head,
    pinnedCommit: PINNED_COMMIT,
  }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
```

- [ ] **Step 5: Run the focused test and verify green**

Run:

```powershell
node --test tests/governance/diagnostic-governance-resolver.test.mjs
```

Expected: 4 tests pass and the process exits `0`.

- [ ] **Step 6: Run the resolver against the real local checkout**

Set `PAYSIM_GOVERNANCE_UPSTREAM` only in the current shell, then run:

```powershell
if (-not $env:PAYSIM_GOVERNANCE_UPSTREAM) { throw 'Set PAYSIM_GOVERNANCE_UPSTREAM for this shell before continuing.' }
node scripts/verify-diagnostic-governance.mjs
```

Expected JSON:

```json
{
  "status": "OK",
  "repository": "transition-gap",
  "source": "environment",
  "branch": "codex/diagnostic-product-governance",
  "head": "790eb99ea783603af2a601794e1ccc3a90b1f967",
  "pinnedCommit": "790eb99",
  "drift": false,
  "adapterRoot": ".governance/upstream"
}
```

The full HEAD begins with the pinned abbreviated SHA, so `drift` is `false`.

- [ ] **Step 7: Commit the resolver only**

Run:

```powershell
git add -- .gitignore scripts/verify-diagnostic-governance.mjs tests/governance/diagnostic-governance-resolver.test.mjs
git diff --cached --check
git diff --cached --name-status
git commit -m "chore: add portable governance resolver"
```

Expected: only the three listed paths are committed. Task 9 files remain unstaged.

### Task 2: Create The Canonical PaySim Adapter

**Files:**
- Create: `docs/diagnostic-product-adapter.md`

**Interfaces:**
- Consumes: `.governance/upstream`, Constitution and casebook at `790eb99`, current four-screen product design, product contracts, and named PaySim tests.
- Produces: one Adapter satisfying the nine required headings, scope and authority enums, `DP-01` through `DP-05`, and `CASE-*` evidence status.

- [ ] **Step 1: Confirm the resolver-created sources are readable**

Run:

```powershell
Get-Content -Raw -Encoding UTF8 '.governance/upstream/docs/diagnostic-product-constitution.md' | Out-Null
Get-Content -Raw -Encoding UTF8 '.governance/upstream/docs/diagnostic-before-after-casebook.md' | Out-Null
```

Expected: both commands exit `0` and print no file content.

- [ ] **Step 2: Create the Adapter from the upstream template**

Create `docs/diagnostic-product-adapter.md` with all of the following sections and facts:

```markdown
# Diagnostic Product Adapter — HR PaySim

## 1. Metadata and authority

- Product: HR PaySim
- Adapter status: `AUTHORITATIVE`
- Adapter owner: this repository
- Upstream repository: `transition-gap`
- Upstream branch context: `codex/diagnostic-product-governance`
- Constitution: `.governance/upstream/docs/diagnostic-product-constitution.md`
- Constitution baseline commit: `790eb99`
- Casebook: `.governance/upstream/docs/diagnostic-before-after-casebook.md`
- Local product authority: `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- Last validated: 2026-07-12

공통 원칙 문구를 복사하지 않고 `DP-*` ID와 PaySim 적용 위치만 기록한다.

## 2. Scope Lock

- `GOVERNANCE_ONLY`: Adapter, resolver, Preflight, agent guidance, authority note, 계획만 변경하며 제품 코드를 수정하지 않는다.
- `PRODUCT_IMPLEMENTATION`: 승인된 PaySim 작업 패키지의 코드·테스트·UI만 변경한다.
- `REVIEW_ONLY`: 읽기·검증·피드백만 수행한다.

Task 9 휴먼 게이트는 거버넌스 작업과 독립적으로 진행하며 거버넌스 검증으로 대체하지 않는다.

## 3. Authority map

| Source | Authority | Use |
|---|---|---|
| `.governance/upstream/docs/diagnostic-product-constitution.md` at `790eb99` | `AUTHORITATIVE` | 공통 `LOCKED` 원칙 |
| `.governance/upstream/docs/diagnostic-before-after-casebook.md` at `790eb99` | `REFERENCE_ONLY` | 사례와 공통화 후보 근거 |
| `docs/diagnostic-product-adapter.md` | `AUTHORITATIVE` | PaySim 범위·매핑·충돌 처리 |
| `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md` | `PRODUCT-SPECIFIC` | 현재 4화면 UX·상태·개인정보·파일럿 계약 |
| `docs/hr-paysim/17_strategy_gtm_career_contract.md` | `PRODUCT-SPECIFIC` | 파일럿 KPI와 정직한 대외 주장 |
| `docs/hr-paysim/19_sample_output_contract.md` | `PRODUCT-SPECIFIC` | 합성 roster·fixture·탐지 기대값 |
| `docs/hr-paysim/21_anonymous_pilot_learning_log_contract.md` | `PRODUCT-SPECIFIC` | 동의·수동 가명 기록 경계 |
| `src/lib/hr-paysim/copy/founderCopy.ts` | `PRODUCT-SPECIFIC` | 중요 founder-facing copy SSOT |
| 기존 구현 계획과 통합 설계 | `REFERENCE_ONLY` | 승인 이력과 작업 순서 참고 |
| `docs/hr-paysim/final-design-acceptance.md` | `LEGACY` | 과거 8단계 시각 참고 |

충돌 시 최신 사용자 지시, 이 Adapter, 현재 PaySim canonical 계약, 승인된 현재 계획, 참고 계획, legacy 순서로 판단한다.

## 4. LOCKED principle mappings

| Principle | Product application | Verification |
|---|---|---|
| `DP-01` | roster evidence에서 theme·review·repeat·decision·report·export까지 구조화된 추적 | `dependency-invalidation.test.ts`, report derivation, export invalidation |
| `DP-02` | explanation·repeat·confirmed output의 claim status와 non-claim | `claim-rendering.test.ts`, observed-precedent non-claim tests |
| `DP-03` | detector·row ID·계산 언어와 founder copy 분리 | `founder-copy.test.ts`, `decision-room-ui.test.ts`, browser visible-text scan |
| `DP-04` | 급여 차이와 반복 금액의 정의·근거·단위·한계 | data-derived headline and amount-context tests |
| `DP-05` | 대표가 설명·선택·승인하는 4화면 흐름 | one-action screen tests, no score/risk hero |

## 5. Candidate validation

| Cases | Validation | Product evidence |
|---|---|---|
| `CASE-01` | `CONFIRMED` | forbidden-term, expanded-language, visible-text checks |
| `CASE-02` | `CONFIRMED` | anonymous founder comparison and model-owned evidence tests |
| `CASE-05` | `CONFIRMED` | amount unit/context and data-derived headline tests |
| `CASE-08` | `CONFIRMED` | action prompt and one-concrete-action tests |
| `CASE-10` | `CONFIRMED` | source order, component ownership, browser gaze order |
| `CASE-11` | `CONFIRMED` | reducer, UI, and browser invalidation tests |
| `CASE-12` | `CONFIRMED` | destination matrix and repeat non-claim tests |
| `CASE-13` | `CONFIRMED` | bottom action, three clicks, focus, keyboard, overflow QA |
| `CASE-03`, `CASE-04`, `CASE-06` | `ADAPTED` | facilitated founder question and compensation-decision mechanics |
| `CASE-07`, `CASE-09`, `CASE-14` | `NOT_TESTED` | current PaySim evidence is insufficient; Task 9 and pilot may change `CASE-14` |

## 6. Product-specific rules

- HR PaySim은 facilitated compensation-explainability decision room이다.
- 시장연봉, 퇴사, 생산성 손실, 법률 노출, 개인별 적정 연봉을 추정하지 않는다.
- raw roster text는 parsing 후 제거하며 browser storage·URL·server로 보내지 않는다.
- `EvidenceStatus`와 interpretation claim status를 분리한다.
- observed precedent와 founder-approved reusable rule을 분리한다.
- `repeatabilityStatus: unanswered`는 policy copy가 될 수 없다.
- explanation 또는 evidence 변경은 모든 dependent output을 render 전에 무효화한다.
- pilot learning record는 별도 동의 후 앱 밖에서 수동 가명 기록한다.
- Task 9는 자동 검증과 별도로 실제 참여자 이해도 게이트를 통과해야 한다.

## 7. Forbidden literal transfers

- Constitution 원문, Prism screen flow, Matrix, scenario card, roadmap, glossary, benchmark formula, 교정 문구를 복사하지 않는다.
- Prism Adapter의 제품 규칙이나 HR Prism component를 PaySim에 이식하지 않는다.
- casebook UI 형태를 공통 component로 조기 추출하지 않는다.
- PaySim claim state, privacy rule, fixture, pilot record를 common casebook에 복제하지 않는다.
- upstream 절대경로, `.governance/` link, local config를 commit하지 않는다.

## 8. Feedback return path

1. PaySim 피드백은 화면, before, 실패 원인, after, 테스트 또는 동의된 pilot evidence와 함께 PaySim 문서에 기록한다.
2. 제품 고유 변경은 이 Adapter의 rule 또는 case validation만 갱신한다.
3. 두 제품에서 반복 가능성이 생긴 candidate만 upstream casebook 제안으로 반환한다.
4. Constitution 승격은 별도 사용자 승인 후 upstream 원문에서만 수행한다.

## 9. Verification commands

```powershell
node --test tests/governance/diagnostic-governance-resolver.test.mjs
node scripts/verify-diagnostic-governance.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
```
```

- [ ] **Step 3: Run the installed governance verifier**

Run:

```powershell
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
```

Expected: `[OK]` and exit `0` for the current project root.

- [ ] **Step 4: Scan the Adapter for forbidden duplication and machine paths**

Run:

```powershell
rg -n "C:\\Users|OneDrive|바탕 화면|Diagnostic Product Working Constitution v0.1|데이터가 말하지 않는" docs/diagnostic-product-adapter.md
```

Expected: no matches.

- [ ] **Step 5: Commit the Adapter only**

Run:

```powershell
git add -- docs/diagnostic-product-adapter.md
git diff --cached --check
git diff --cached --name-status
git commit -m "docs: add PaySim diagnostic adapter"
```

Expected: only `docs/diagnostic-product-adapter.md` is committed.

### Task 3: Record The Governance Preflight

**Files:**
- Create: `docs/hr-paysim/validation/2026-07-12-governance-preflight.md`

**Interfaces:**
- Consumes: resolver JSON, installed verifier output, Adapter, product git state, and Task 9 gate status.
- Produces: the compact Preflight block plus deterministic revision, drift, boundary, and open-gate evidence.

- [ ] **Step 1: Capture fresh governance and repository evidence**

Run:

```powershell
node scripts/verify-diagnostic-governance.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git status --short --branch
git log -3 --oneline
```

Expected: resolver and Python verifier exit `0`; status still lists the existing Task 9 files; the Adapter commits are present.

- [ ] **Step 2: Create the dated Preflight record**

Create `docs/hr-paysim/validation/2026-07-12-governance-preflight.md`:

```markdown
# HR PaySim Governance Preflight — 2026-07-12

Governance Preflight
- Scope: `GOVERNANCE_ONLY`
- Authority: `docs/diagnostic-product-adapter.md`; `transition-gap@790eb99`; `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`
- Applies: `DP-01`, `DP-02`, `DP-03`, `DP-04`, `DP-05`
- Cases to check: `CASE-01`–`CASE-14`; confirmed evidence is named in the Adapter
- Product boundaries: facilitated compensation explainability; no individual salary recommendation; in-memory roster lifecycle; observed precedent is not approved policy; pilot learning stays manual and consented
- Conflicts/blockers: Task 9 real-participant comprehension gate remains open; it is not a governance blocker and cannot be self-certified
- Authorized next work: finish G3 guidance while P9-H participant recruitment proceeds independently; do not start product implementation under this scope

## Revision evidence

- Upstream repository: `transition-gap`
- Branch observed: `codex/diagnostic-product-governance`
- HEAD observed: `790eb99ea783603af2a601794e1ccc3a90b1f967`
- Pinned baseline: `790eb99`
- Branch drift beyond pin: none
- Local resolution source: environment variable or ignored local config; absolute path intentionally not recorded

## Verification evidence

- `node --test tests/governance/diagnostic-governance-resolver.test.mjs`: pass
- `node scripts/verify-diagnostic-governance.mjs`: pass
- installed `verify_diagnostic_governance.py --project-root .`: pass
- `git diff --check`: pass

## Product gate status

- Task 9 automated checks were previously green but are not reused as current product-completion evidence.
- Task 9 implementation remains uncommitted until at least two real participants pass the five-second comprehension gate, including one target-adjacent participant.
- P11-B0 and PILOT-1 remain outside `GOVERNANCE_ONLY` and require their approved product plan.
```

If fresh HEAD differs, write the observed full SHA and `Branch drift beyond pin: yes`; keep the baseline `790eb99` and stop if the pinned commit is unavailable.

- [ ] **Step 3: Verify no local path or invented human evidence entered the record**

Run:

```powershell
rg -n "C:\\Users|OneDrive|바탕 화면|Participant 1|Participant 2|통과했다" docs/hr-paysim/validation/2026-07-12-governance-preflight.md
```

Expected: no matches.

- [ ] **Step 4: Keep the Preflight uncommitted until G3 guidance is ready**

Run `git status --short` and confirm only the Preflight is newly untracked in this task.

### Task 4: Add Agent Guidance, Authority Banners, And Final Governance Verification

**Files:**
- Create: `AGENTS.md`
- Modify: `docs/hr-paysim/final-design-acceptance.md`
- Modify: `docs/hr-paysim/19_sample_output_contract.md`
- Include: `docs/hr-paysim/validation/2026-07-12-governance-preflight.md`

**Interfaces:**
- Consumes: validated Adapter and Preflight.
- Produces: future-agent read order, scope discipline, document authority split, verification commands, and stop gates.

- [ ] **Step 1: Create the root work guide**

Create `AGENTS.md`:

```markdown
# HR PaySim Work Guide

## Required read order

1. Read `docs/diagnostic-product-adapter.md` completely.
2. Resolve and read the Constitution and casebook paths declared by the Adapter.
3. Read `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`.
4. Read the approved plan for the current work package.

## Scope

- Classify each request as `GOVERNANCE_ONLY`, `PRODUCT_IMPLEMENTATION`, or `REVIEW_ONLY` before editing.
- Governance-only work must not modify product code, product tests, shared governance, or HR Prism.
- Product work must remain inside the explicitly approved task package.

## Authority

- Shared `DP-*` text belongs only to the upstream Constitution pinned by the Adapter.
- PaySim product rules belong to the current four-screen design and product contracts.
- `docs/hr-paysim/19_sample_output_contract.md` owns synthetic fixture and expected detector output, not current screen structure or founder copy.
- `docs/hr-paysim/final-design-acceptance.md` is legacy visual reference, not current runtime authority.
- Important founder-facing conclusion, state, non-claim, and action copy belongs in `src/lib/hr-paysim/copy/founderCopy.ts`.

## Verification

Run the Adapter commands for every governance preflight or postflight. Run fresh product commands only for authorized product work; stale green output is not completion evidence.

## Stop gates

- Do not self-certify the Task 9 real-participant comprehension gate.
- Do not start a real-roster pilot before the approved P11-B0 privacy and lifecycle package passes.
- Do not promote a `CASE-*` candidate to `LOCKED` or modify upstream governance in this repository.
- Stop on unresolved canonical-versus-legacy conflict, missing evidence, unsafe route exposure, privacy failure, or a required cross-repository change.
```

- [ ] **Step 2: Add the legacy visual-authority banner**

Immediately below `# HR PaySim Final Design Acceptance`, add:

```markdown
> **Authority:** `LEGACY` visual and historical reference for the earlier eight-step design. The current founder-facing runtime and copy order are governed by `docs/superpowers/specs/2026-07-11-hr-paysim-facilitated-decision-room-design.md`.
```

Do not change its screenshot paths or visual tokens in this task.

- [ ] **Step 3: Add the fixture-authority banner**

Immediately below `# HR PaySim Sample Output Contract`, add:

```markdown
> **Authority:** `PRODUCT-SPECIFIC` for the synthetic roster, fixture values, and expected detection output. It is not the authority for the current four-screen structure or founder-facing copy.
```

Do not rewrite fixture values.

- [ ] **Step 4: Run final governance verification**

Run:

```powershell
node --test tests/governance/diagnostic-governance-resolver.test.mjs
node scripts/verify-diagnostic-governance.mjs
python "$HOME/.codex/skills/diagnostic-product-governance/scripts/verify_diagnostic_governance.py" --project-root .
git diff --check
rg -n "C:\\Users|OneDrive|바탕 화면" docs/diagnostic-product-adapter.md docs/hr-paysim/validation/2026-07-12-governance-preflight.md AGENTS.md scripts/verify-diagnostic-governance.mjs
```

Expected: 4 resolver tests pass; resolver and Python verifier exit `0`; diff check passes; path scan returns no matches.

- [ ] **Step 5: Verify product code and Task 9 files were not changed by governance work**

Run:

```powershell
git status --short
git diff --name-only HEAD -- src tests/hr-paysim scripts/qa-decision-room.mjs
```

Expected: the second command lists only the same pre-existing Task 9 paths that were dirty before G1. No governance action adds a product-code diff.

- [ ] **Step 6: Stage and inspect only G3 governance files**

Run:

```powershell
git add -- AGENTS.md docs/hr-paysim/final-design-acceptance.md docs/hr-paysim/19_sample_output_contract.md docs/hr-paysim/validation/2026-07-12-governance-preflight.md
git diff --cached --check
git diff --cached --name-status
```

Expected: exactly four paths are staged.

- [ ] **Step 7: Commit the verified Preflight and guidance**

Run:

```powershell
git commit -m "docs: record PaySim governance preflight"
```

Expected: commit succeeds without staging any Task 9 file.

- [ ] **Step 8: Produce the postflight status**

Report:

```markdown
Governance Postflight
- Scope used: `GOVERNANCE_ONLY`
- Changed product code: no
- Adapter verification: pass
- Upstream pin: `790eb99`; drift status recorded in Preflight
- Candidate changes: none promoted; statuses remain Adapter-local
- Open product gate: Task 9 real-participant comprehension
- Authorized next action: execute the existing P9-H human-gate plan; write a separate P11-B0/PILOT-1 product plan only after Task 9 closes
```

Do not run Task 9 product checks merely to make this governance commit appear stronger.
