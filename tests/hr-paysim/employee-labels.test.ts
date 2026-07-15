import assert from "node:assert/strict";
import test from "node:test";
import type { NormalizedRosterRow } from "../../src/lib/hr-paysim/domain.ts";
import { createEmployeeLabels } from "../../src/lib/hr-paysim/presentation/createEmployeeLabels.ts";

function row(rowId: string, roleGroup = "Backend Engineer"): NormalizedRosterRow {
  return {
    rowId,
    roleGroup,
    baseSalaryKRW: 60_000_000,
  };
}

test("assigns A and B to the headline pair", () => {
  const labels = createEmployeeLabels([row("lower"), row("higher")], "lower", "higher");

  assert.equal(labels.get("lower"), "직원 A");
  assert.equal(labels.get("higher"), "직원 B");
});

test("assigns unbounded Excel-style labels within one role", () => {
  const rows = Array.from({ length: 10 }, (_, index) => row(`employee-${index + 1}`));
  const labels = createEmployeeLabels(rows, "employee-1", "employee-2");

  assert.deepEqual(
    rows.map((item) => labels.get(item.rowId)),
    ["직원 A", "직원 B", "직원 C", "직원 D", "직원 E", "직원 F", "직원 G", "직원 H", "직원 I", "직원 J"],
  );
});

test("restarts role-local labels when roles are presented separately", () => {
  const backend = [row("backend-low"), row("backend-high")];
  const design = [row("design-low", "Product Designer"), row("design-high", "Product Designer")];

  const backendLabels = createEmployeeLabels(backend, "backend-low", "backend-high");
  const designLabels = createEmployeeLabels(design, "design-low", "design-high");

  assert.deepEqual([...backendLabels.values()], ["직원 A", "직원 B"]);
  assert.deepEqual([...designLabels.values()], ["직원 A", "직원 B"]);
});
