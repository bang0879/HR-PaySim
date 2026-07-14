import assert from "node:assert/strict";
import test from "node:test";

import { createWorkbookReadCoordinator } from "../../src/features/facilitator-preparation/workbookReadCoordinator.ts";

test("a newer workbook read cancels stale consent without resolving the active read", async () => {
  const coordinator = createWorkbookReadCoordinator();
  const firstRead = coordinator.beginRead();
  const firstConsent = coordinator.requestConsent(firstRead, ["이름"], () => {});

  const secondRead = coordinator.beginRead();
  assert.equal(await firstConsent, false);
  assert.equal(coordinator.isActive(firstRead), false);
  assert.equal(coordinator.isActive(secondRead), true);

  let secondResolved = false;
  const secondConsent = coordinator.requestConsent(secondRead, ["이메일"], () => {});
  void secondConsent.then(() => { secondResolved = true; });
  assert.equal(coordinator.resolveConsent(firstRead, true), false);
  await Promise.resolve();
  assert.equal(secondResolved, false);

  assert.equal(coordinator.resolveConsent(secondRead, true), true);
  assert.equal(await secondConsent, true);
});
