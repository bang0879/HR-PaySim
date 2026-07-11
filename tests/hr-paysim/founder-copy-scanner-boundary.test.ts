import assert from "node:assert/strict";
import test from "node:test";
import { findForbiddenRenderedCopy } from "../../scripts/check-forbidden-copy.ts";

test("copy scanning ignores internal JSX handlers and non-visible data attributes", () => {
  const source = `
    export function Button() {
      return <button data-step="theme" onClick={() => setStep("memo")}>안내</button>;
    }
  `;

  assert.deepEqual(findForbiddenRenderedCopy(source), []);
});

test("copy scanning checks quoted choices in visible JSX attributes", () => {
  const source = `
    export function Button({ active }: { active: boolean }) {
      return <button aria-label={active ? "memo" : \`relationship\`}>안내</button>;
    }
  `;

  assert.deepEqual(findForbiddenRenderedCopy(source), ["relationship", "memo"]);
});
