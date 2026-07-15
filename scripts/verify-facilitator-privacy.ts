import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { findForbiddenPrivacyApis } from "./public-bundle-boundary.ts";

const manifestPath = "dist/facilitator-local/paysim-module-manifest.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
  surface: string;
  modules: string[];
};

if (manifest.surface !== "FACILITATOR_LOCAL") {
  throw new Error(`unexpected surface: ${manifest.surface}`);
}

const requiredPrivacyOwners = [
  "src/features/facilitator-preparation/FacilitatorPreparationScreen.tsx",
  "src/features/facilitator-preparation/readFacilitatorWorkbook.ts",
  "src/lib/hr-paysim/preparation/koreanRosterAdapter.ts",
];
const missingOwners = requiredPrivacyOwners.filter(
  (owner) => !manifest.modules.includes(owner),
);
if (missingOwners.length > 0) {
  throw new Error(`facilitator-local module graph is missing privacy owners:\n${missingOwners.join("\n")}`);
}
const reachableSources = Object.fromEntries(
  manifest.modules
    .filter((modulePath) => modulePath.startsWith("src/"))
    .map((modulePath) => [
      modulePath,
      readFileSync(resolve(modulePath), "utf8"),
    ]),
);
const forbidden = findForbiddenPrivacyApis(reachableSources);
if (forbidden.length > 0) {
  throw new Error(
    `facilitator-local reachable modules contain persistence or emission APIs:\n${forbidden.join("\n")}`,
  );
}

console.log(
  "[OK] facilitator-local reachable source graph contains no persistence or emission API",
);
