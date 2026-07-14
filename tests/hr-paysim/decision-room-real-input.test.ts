import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";
import { prepareProductEngineerRoster } from "../../src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts";
import { KOREAN_ROSTER_HEADERS } from "../../src/lib/hr-paysim/preparation/koreanRosterAdapter.ts";
import { createEmptyDecisionRoomSession } from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";

const actualRosterPaste = [
  KOREAN_ROSTER_HEADERS.join("\t"),
  "73000000\t10\t61\tProduct Engineer\t\t아니오\t아니오",
  "77000000\t9\t50\tProduct Engineer\t\t아니오\t아니오",
  "81000000\t8\t39\tProduct Engineer\t\t아니오\t아니오",
  "91000000\t7\t13\tSenior Product Engineer\t\t예\t아니오",
  "88000000\t6\t20\tProduct Engineer\t\t아니오\t예",
].join("\n");

test("facilitated copy derives every roster fact from the current Product Engineer session", () => {
  const prepared = prepareProductEngineerRoster(actualRosterPaste);
  assert.equal(prepared.status, "ready_for_confirmation");
  assert.ok(prepared.draft);

  const model = createDecisionRoomViewModel({
    ...createEmptyDecisionRoomSession("facilitated"),
    ...prepared.draft,
  });
  const rendered = JSON.stringify(model);

  for (const expected of [
    "Product Engineer 5명",
    "7,300만원",
    "9,100만원",
    "1,800만원",
    "관련 경력 10년",
    "관련 경력 7년",
    "회사 근속 61개월",
    "회사 근속 13개월",
  ]) {
    assert.equal(rendered.includes(expected), true, expected);
  }

  for (const syntheticOnly of [
    "Product Engineer 6명",
    "6,800만원",
    "9,500만원",
    "2,700만원",
    "700만원이 추가됐지만",
    "Platform Engineer",
    "GTM",
  ]) {
    assert.equal(rendered.includes(syntheticOnly), false, syntheticOnly);
  }
});