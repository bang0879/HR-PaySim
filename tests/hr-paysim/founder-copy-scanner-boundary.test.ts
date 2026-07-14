import assert from "node:assert/strict";
import test from "node:test";
import { findForbiddenRenderedCopy } from "../../scripts/check-forbidden-copy.ts";

test("copy scanning ignores internal JSX handlers and non-visible data attributes", () => {
  const source = `
    export function Button() {
      return (
        <button
          data-step="theme"
          onClick={() => {
            const label = "memo";
            setStep(label);
          }}
        >
          안내
        </button>
      );
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

test("copy scanning checks plain text rendered by a React fragment", () => {
  const source = `
    export function View() {
      return <>memo relationship</>;
    }
  `;

  assert.deepEqual(findForbiddenRenderedCopy(source), ["relationship", "memo"]);
});

test("copy scanning checks quoted choices in a React fragment child expression", () => {
  const source = `
    export function View({ active }: { active: boolean }) {
      return <>{active ? "memo" : \`relationship\`}</>;
    }
  `;

  assert.deepEqual(findForbiddenRenderedCopy(source), ["relationship", "memo"]);
});
