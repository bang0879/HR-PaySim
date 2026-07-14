import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { basename, join } from "node:path";
import {
  findBlockedLiteralPaySimHrefs,
  findBlockedPaySimHrefs,
} from "./qa-evidence-policy.mjs";

const outDir = "dist/public";
const html = readFileSync(join(outDir, "index.html"), "utf8");
const manifest = JSON.parse(
  readFileSync(join(outDir, "paysim-module-manifest.json"), "utf8"),
);
const fail = (message) => {
  throw new Error(message);
};

if (
  !/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']\s*\/?>/i
    .test(html)
) {
  fail("public HTML is missing noindex,nofollow");
}
const blockedHtmlLinks = findBlockedLiteralPaySimHrefs(html);
if (blockedHtmlLinks.length > 0) {
  fail(`public HTML advertises blocked PaySim routes:\n${blockedHtmlLinks.join("\n")}`);
}
if (manifest.surface !== "PUBLIC_DEMO") {
  fail(`unexpected surface: ${manifest.surface}`);
}

const forbidden = manifest.modules.filter(
  (path) =>
    path === "src/App.tsx"
    || path === "src/routes/hr-paysim/appRoute.ts"
    || path === "src/components/hr-paysim/PrototypePaySimApp.tsx"
    || path === "src/components/hr-paysim/RosterDiagnosticApp.tsx"
    || path.startsWith("src/features/facilitator-preparation/")
    || path.startsWith("src/lib/hr-paysim/preparation/"),
);
if (forbidden.length > 0) {
  fail(`forbidden public modules:\n${forbidden.join("\n")}`);
}

const blockedSourceLinks = manifest.modules
  .filter((path) => path.startsWith("src/"))
  .flatMap((path) => findBlockedLiteralPaySimHrefs(readFileSync(path, "utf8"))
    .map((href) => `${path}: ${href}`));
if (blockedSourceLinks.length > 0) {
  fail(`public source graph advertises blocked PaySim routes:\n${blockedSourceLinks.join("\n")}`);
}

function filesUnder(path) {
  return statSync(path).isDirectory()
    ? readdirSync(path).flatMap((entry) => filesUnder(join(path, entry)))
    : [path];
}

const sitemapFiles = filesUnder(outDir)
  .filter((path) => /^sitemap(?:[-.].*)?$/i.test(basename(path)));
const blockedSitemapLinks = sitemapFiles.flatMap((path) => {
  const contents = readFileSync(path, "utf8");
  const hrefs = [...contents.matchAll(/https?:\/\/[^\s<"']+|\/hr-paysim\/[^\s<"']+/gi)]
    .map((match) => match[0]);
  return findBlockedPaySimHrefs(hrefs)
    .map((href) => `${path}: ${href}`);
});
if (blockedSitemapLinks.length > 0) {
  fail(`public sitemap advertises blocked PaySim routes:\n${blockedSitemapLinks.join("\n")}`);
}

const secrets = filesUnder("src")
  .filter((path) => /\.(ts|tsx|js|jsx)$/.test(path))
  .flatMap((path) => {
    const matches = readFileSync(path, "utf8").match(
      /VITE_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD)[A-Z0-9_]*/g,
    );
    return matches ? matches.map((match) => `${path}: ${match}`) : [];
  });
if (secrets.length > 0) {
  fail(`client secret-like contracts:\n${secrets.join("\n")}`);
}

console.log(
  "[OK] public noindex, rendered-source link, sitemap, module, and client-secret checks passed",
);
