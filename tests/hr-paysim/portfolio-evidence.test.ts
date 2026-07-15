import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(`docs/hr-paysim/${name}`, "utf8");

test("portfolio evidence labels synthetic and unrun pilot evidence", () => {
  const files = [
    read("22_methodology_note.md"),
    read("23_sample_founder_result.md"),
    read("24_privacy_and_non_claims.md"),
    read("25_algorithm_and_qa_appendix.md"),
  ];
  const combined = files.join("\n");
  assert.match(combined, /synthetic|합성/);
  assert.match(combined, /PILOT-1:\s*NOT RUN/);
  assert.match(combined, /market benchmark|시장 벤치마크/);
  assert.match(combined, /salary recommendation|연봉 추천/);
  assert.doesNotMatch(combined, /pilot (?:passed|validated)|파일럿 (?:통과|검증 완료)/i);
});

test("QA appendix records both build surfaces and all final gates", () => {
  const appendix = read("25_algorithm_and_qa_appendix.md");
  for (const required of [
    "PUBLIC_DEMO",
    "FACILITATOR_LOCAL",
    "npm.cmd run lint",
    "npm.cmd test",
    "npm.cmd run typecheck",
    "npm.cmd run build",
    "npm.cmd run build:facilitator",
    "qa-decision-room.mjs",
    "verify-route-exposure.mjs",
    "verify-facilitator-privacy.ts",
    "verify_diagnostic_governance.py",
    "git diff --check",
  ]) assert.match(appendix, new RegExp(required.replaceAll(".", "\\.")));
});
