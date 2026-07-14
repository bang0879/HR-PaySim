import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveStatementsForDestination,
  type ClaimDestination,
} from "../../src/lib/hr-paysim/interpretation/resolveStatements.ts";
import type { InterpretationStatement } from "../../src/lib/hr-paysim/interpretation/types.ts";

const destinations: ClaimDestination[] = [
  "SCREEN_2_EVIDENCE",
  "SCREEN_3_REVIEW_PERSPECTIVE",
  "SCREEN_4_CONFIRMED",
  "SCREEN_4_FOLLOW_UP",
  "FACILITATOR_GUIDE",
  "METHODOLOGY",
  "EXPORT_CONFIRMED",
  "EXPORT_FOLLOW_UP",
];

test("practitioner experience never enters confirmed result areas", () => {
  const statement = claim("kyle-context", "KYLE_EXPERIENCE_BASED", "TYPICAL_INTERPRETATION");

  assert.deepEqual(resolveStatementsForDestination([statement], "SCREEN_4_CONFIRMED"), []);
  assert.deepEqual(resolveStatementsForDestination([statement], "EXPORT_CONFIRMED"), []);
  assert.deepEqual(resolveStatementsForDestination([statement], "SCREEN_2_EVIDENCE"), []);
  assert.equal(resolveStatementsForDestination([statement], "FACILITATOR_GUIDE").length, 1);
  assert.equal(resolveStatementsForDestination([statement], "METHODOLOGY").length, 1);
});

test("external context alone cannot confirm a client mechanism", () => {
  const statement = claim("external-mechanism", "VERIFIED_EXTERNAL", "DEEPER_MECHANISM");

  assert.deepEqual(resolveStatementsForDestination([statement], "SCREEN_4_CONFIRMED"), []);
  assert.deepEqual(resolveStatementsForDestination([statement], "EXPORT_CONFIRMED"), []);
  assert.equal(resolveStatementsForDestination([statement], "SCREEN_3_REVIEW_PERSPECTIVE").length, 1);
});

test("working hypotheses remain review perspectives or follow-ups", () => {
  const statement = claim("working-hypothesis", "WORKING_HYPOTHESIS", "DEEPER_MECHANISM");

  assert.deepEqual(resolveStatementsForDestination([statement], "SCREEN_4_CONFIRMED"), []);
  assert.deepEqual(resolveStatementsForDestination([statement], "EXPORT_CONFIRMED"), []);
  assert.equal(resolveStatementsForDestination([statement], "SCREEN_3_REVIEW_PERSPECTIVE").length, 1);
  assert.equal(resolveStatementsForDestination([statement], "SCREEN_4_FOLLOW_UP").length, 1);
  assert.equal(resolveStatementsForDestination([statement], "EXPORT_FOLLOW_UP").length, 1);
});

test("only client-data surface observations enter evidence and confirmed destinations", () => {
  const surface = claim("client-surface", "SUPPORTED_BY_CLIENT_DATA", "SURFACE_OBSERVATION");
  const mechanism = claim("client-mechanism", "SUPPORTED_BY_CLIENT_DATA", "DEEPER_MECHANISM");

  assert.deepEqual(
    resolveStatementsForDestination([surface, mechanism], "SCREEN_2_EVIDENCE"),
    [surface],
  );
  assert.deepEqual(
    resolveStatementsForDestination([surface, mechanism], "SCREEN_4_CONFIRMED"),
    [surface],
  );
  assert.deepEqual(
    resolveStatementsForDestination([surface, mechanism], "EXPORT_CONFIRMED"),
    [surface],
  );
});

test("unsupported statements never render at any destination", () => {
  const unsupported = claim("unsupported", "UNSUPPORTED_DO_NOT_USE", "SURFACE_OBSERVATION");

  for (const destination of destinations) {
    assert.deepEqual(resolveStatementsForDestination([unsupported], destination), []);
  }
});

test("malformed runtime statements and destinations fail closed", () => {
  const surface = claim("client-surface", "SUPPORTED_BY_CLIENT_DATA", "SURFACE_OBSERVATION");
  const malformedStatements = [null, { ...surface, claimStatus: "PROMOTED_AT_RUNTIME" }, surface] as unknown as InterpretationStatement[];

  assert.deepEqual(
    resolveStatementsForDestination(malformedStatements, "SCREEN_2_EVIDENCE"),
    [surface],
  );
  assert.deepEqual(
    resolveStatementsForDestination(
      [surface],
      "UNKNOWN_DESTINATION" as ClaimDestination,
    ),
    [],
  );
});

test("destination resolution is input-order independent without mutating callers", () => {
  const a = claim("a-statement", "SUPPORTED_BY_CLIENT_DATA", "SURFACE_OBSERVATION");
  const z = claim("z-statement", "SUPPORTED_BY_CLIENT_DATA", "SURFACE_OBSERVATION");
  const forward = [a, z];
  const reverse = [z, a];
  const forwardSnapshot = [...forward];
  const reverseSnapshot = [...reverse];

  assert.deepEqual(
    resolveStatementsForDestination(forward, "SCREEN_4_CONFIRMED").map((item) => item.id),
    ["a-statement", "z-statement"],
  );
  assert.deepEqual(
    resolveStatementsForDestination(reverse, "SCREEN_4_CONFIRMED").map((item) => item.id),
    ["a-statement", "z-statement"],
  );
  assert.deepEqual(forward, forwardSnapshot);
  assert.deepEqual(reverse, reverseSnapshot);
});

function claim(
  id: string,
  claimStatus: InterpretationStatement["claimStatus"],
  kind: InterpretationStatement["kind"],
): InterpretationStatement {
  return {
    id,
    kind,
    copyKey: `copy.${id}`,
    claimStatus,
    triggerEvidenceIds: [],
    reviewDependencyIds: [],
    sourceRefs: [],
    mustNotClaimKeys: [],
  };
}
