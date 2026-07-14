import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionRoomViewModel } from "../../src/features/decision-room/decisionRoomViewModel.ts";
import { prepareProductEngineerRoster } from "../../src/lib/hr-paysim/preparation/prepareProductEngineerRoster.ts";
import { createEmptyDecisionRoomSession } from "../../src/lib/hr-paysim/session/decisionRoomReducer.ts";

const actualRosterPaste = [
  "rowId\troleGroup\ttitle\tlevelLabel\tlevelRank\tbaseSalaryKRW\tstartDate\ttenureMonths\texceptionFlag\tcounterOfferFlag\tmanagerLabel\tteamLabel",
  "actual_001\tProduct Engineer\tProduct Engineer\tnone\t\t73000000\t2021-06-01\t61\tfalse\tfalse\tmanager_private\tteam_private",
  "actual_002\tProduct Engineer\tProduct Engineer\tnone\t\t77000000\t2022-05-01\t50\tfalse\tfalse\tmanager_private\tteam_private",
  "actual_003\tProduct Engineer\tProduct Engineer\tnone\t\t81000000\t2023-04-01\t39\tfalse\tfalse\tmanager_private\tteam_private",
  "actual_004\tProduct Engineer\tProduct Engineer\tnone\t\t91000000\t2025-06-01\t13\ttrue\tfalse\tmanager_private\tteam_private",
  "actual_005\tProduct Engineer\tProduct Engineer\tnone\t\t88000000\t2024-11-01\t20\tfalse\ttrue\tmanager_private\tteam_private",
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
    "Product Engineer 5\uBA85",
    "7,300\uB9CC\uC6D0",
    "9,100\uB9CC\uC6D0",
    "1,800\uB9CC\uC6D0",
    "61\uAC1C\uC6D4",
    "13\uAC1C\uC6D4",
  ]) {
    assert.equal(rendered.includes(expected), true, expected);
  }

  for (const syntheticOnly of [
    "Product Engineer 6\uBA85",
    "6,800\uB9CC\uC6D0",
    "9,500\uB9CC\uC6D0",
    "2,700\uB9CC\uC6D0",
    "700\uB9CC\uC6D0\uC774 \uCD94\uAC00\uB410\uC9C0\uB9CC",
    "Platform Engineer",
    "GTM",
  ]) {
    assert.equal(rendered.includes(syntheticOnly), false, syntheticOnly);
  }
});
