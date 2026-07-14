import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const removedRuntimeFiles = [
  "src/App.tsx",
  "src/components/hr-paysim/PrototypePaySimApp.tsx",
  "src/components/hr-paysim/RosterDiagnosticApp.tsx",
  "src/components/hr-paysim/PaySimShell.tsx",
  "src/components/hr-paysim/PaySimStepper.tsx",
  "src/components/hr-paysim/screens/index.tsx",
  "src/routes/hr-paysim/appRoute.ts",
  "src/routes/hr-paysim/router.ts",
  "src/routes/hr-paysim/stepRegistry.ts",
  "src/lib/hr-paysim/session.ts",
  "src/lib/hr-paysim/prototypeViewModel.ts",
  "src/lib/hr-paysim/rosterDiagnosticViewModel.ts",
] as const;

test("obsolete alternate runtime files are absent", () => {
  assert.deepEqual(
    removedRuntimeFiles.filter((path) => existsSync(path)),
    [],
  );
});

test("shared domain exposes canonical roster evidence without nine-step scenario types", () => {
  const source = readFileSync("src/lib/hr-paysim/domain.ts", "utf8");
  assert.doesNotMatch(
    source,
    /PaySimStep|QuickInputDraft|DiagnosisResult|ScenarioId|ScenarioRecommendation|CEIBand|CEDBand|PayInversionSeverity/,
  );
  assert.match(source, /export interface NormalizedRosterRow/);
  assert.match(source, /export interface StructuralFinding/);
  assert.match(source, /correctionFloorKRW\?: number/);
});
