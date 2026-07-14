import assert from "node:assert/strict";
import test from "node:test";
import type { NormalizedRosterRow } from "../../src/lib/hr-paysim/domain.ts";
import {
  buildMaterialCareerPairs,
  resolveOrderedLevelPolicy,
} from "../../src/lib/hr-paysim/detectors/careerComparablePairs.ts";
import { detectStructuralFindings } from "../../src/lib/hr-paysim/structuralFindings.ts";

test("rejects a higher-career new hire without a tenure-only fallback", () => {
  const pairs = buildMaterialCareerPairs([
    row("long-tenure", 70_000_000, 48, 48),
    row("new-hire", 90_000_000, 120, 2),
  ]);

  assert.deepEqual(pairs, []);
});

test("accepts a dominated comparison and keeps exception evidence in the raw pair", () => {
  const underpaid = row("underpaid", 70_000_000, 120, 60);
  const comparator = {
    ...row("comparator", 90_000_000, 96, 12),
    exceptionFlag: true,
    counterOfferFlag: true,
  };

  assert.deepEqual(
    buildMaterialCareerPairs([underpaid, comparator]).map(pairKey),
    ["underpaid->comparator"],
  );
});

test("resolves no, complete, partial, and incompatible ordered-level evidence", () => {
  assert.equal(resolveOrderedLevelPolicy([
    row("a", 70_000_000, 120, 60),
    row("b", 90_000_000, 96, 12),
  ]), "none");

  assert.equal(resolveOrderedLevelPolicy([
    ranked("a", 2, "L2", 70_000_000, 120, 60),
    ranked("b", 1, "L1", 90_000_000, 96, 12),
  ]), "complete");

  assert.equal(resolveOrderedLevelPolicy([
    ranked("a", 2, "L2", 70_000_000, 120, 60),
    row("b", 90_000_000, 96, 12),
  ]), "partial");

  assert.equal(resolveOrderedLevelPolicy([
    ranked("a", 2, "L2", 70_000_000, 120, 60),
    ranked("b", 1, "L2", 90_000_000, 96, 12),
  ]), "partial");
});

test("activates complete ranks and fails direct comparison closed on partial ranks", () => {
  const complete = [
    ranked("underpaid", 2, "L2", 70_000_000, 120, 60),
    ranked("comparator", 1, "L1", 90_000_000, 96, 12),
  ];
  assert.deepEqual(buildMaterialCareerPairs(complete).map(pairKey), ["underpaid->comparator"]);
  assert.ok(detectStructuralFindings(complete).some((finding) => finding.type === "pay_inversion"));

  const partial = [complete[0]!, { ...complete[1]!, levelLabel: undefined, levelRank: undefined }];
  assert.deepEqual(buildMaterialCareerPairs(partial), []);
  assert.equal(
    detectStructuralFindings(partial).some((finding) => finding.type === "pay_inversion"),
    false,
  );
});

test("rejects missing career, conflicting dimensions, different roles, and immaterial gaps", () => {
  const underpaid = row("underpaid", 70_000_000, 120, 60);
  assert.deepEqual(buildMaterialCareerPairs([
    { ...underpaid, relevantExperienceMonths: undefined },
    row("comparator", 90_000_000, 96, 12),
  ]), []);

  assert.deepEqual(buildMaterialCareerPairs([
    underpaid,
    row("more-career", 90_000_000, 132, 12),
  ]), []);

  assert.deepEqual(buildMaterialCareerPairs([
    underpaid,
    { ...row("other-role", 90_000_000, 96, 12), roleGroup: "Other" },
  ]), []);

  assert.deepEqual(buildMaterialCareerPairs([
    underpaid,
    row("small-gap", 75_000_000, 96, 12),
  ]), []);
});

test("loyalty finding requires two distinct supported endpoints on each side", () => {
  const rows = [
    row("long-a", 70_000_000, 132, 60),
    row("long-b", 72_000_000, 120, 48),
    { ...row("recent-a", 90_000_000, 96, 12), exceptionFlag: true },
    { ...row("recent-b", 92_000_000, 84, 18), counterOfferFlag: true },
  ];

  const loyalty = detectStructuralFindings(rows).find((finding) => finding.type === "loyalty_tax");
  assert.ok(loyalty);
  assert.deepEqual(loyalty.affectedRowIds, ["long-a", "long-b", "recent-a", "recent-b"]);
  assert.deepEqual(loyalty.comparisonPairs.map(pairKey), [
    "long-a->recent-b",
    "long-a->recent-a",
    "long-b->recent-b",
    "long-b->recent-a",
  ]);
  assert.deepEqual(loyalty.evidence, [
    "long-tenure average: 71,000,000 KRW",
    "recent-hire average: 91,000,000 KRW",
  ]);

  const oneLong = rows.filter((item) => item.rowId !== "long-b");
  assert.equal(
    detectStructuralFindings(oneLong).some((finding) => finding.type === "loyalty_tax"),
    false,
  );
});

test("career pairs and findings are independent of input order", () => {
  const rows = [
    row("long-a", 70_000_000, 132, 60),
    row("long-b", 72_000_000, 120, 48),
    row("recent-a", 90_000_000, 96, 12),
    row("recent-b", 92_000_000, 84, 18),
  ];

  assert.deepEqual(
    buildMaterialCareerPairs([...rows].reverse()),
    buildMaterialCareerPairs(rows),
  );
  assert.deepEqual(
    detectStructuralFindings([...rows].reverse()),
    detectStructuralFindings(rows),
  );
});

function row(
  rowId: string,
  baseSalaryKRW: number,
  relevantExperienceMonths: number,
  tenureMonths: number,
): NormalizedRosterRow {
  return {
    rowId,
    roleGroup: "Product Engineer",
    levelLabel: "none",
    baseSalaryKRW,
    relevantExperienceMonths,
    tenureMonths,
  };
}

function ranked(
  rowId: string,
  levelRank: number,
  levelLabel: string,
  baseSalaryKRW: number,
  relevantExperienceMonths: number,
  tenureMonths: number,
): NormalizedRosterRow {
  return {
    ...row(rowId, baseSalaryKRW, relevantExperienceMonths, tenureMonths),
    levelLabel,
    levelRank,
  };
}

function pairKey(pair: { underpaidRowId: string; comparatorRowId: string }): string {
  return `${pair.underpaidRowId}->${pair.comparatorRowId}`;
}
