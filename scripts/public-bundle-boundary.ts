import { relative } from "node:path";
import type { Plugin } from "vite";
import type { BuildSurface } from "../src/lib/hr-paysim/access/buildSurface.ts";

const forbiddenPrefixes = [
  "src/features/facilitator-preparation/",
  "src/lib/hr-paysim/preparation/",
];
const forbiddenExact = new Set([
  "src/App.tsx",
  "src/components/hr-paysim/PrototypePaySimApp.tsx",
  "src/components/hr-paysim/RosterDiagnosticApp.tsx",
  "src/routes/hr-paysim/appRoute.ts",
]);

const forbiddenPrivacyApis = [
  ["fetch", /\bfetch\s*\(/],
  ["XMLHttpRequest", /\bXMLHttpRequest\b/],
  ["sendBeacon", /\bsendBeacon\s*\(/],
  ["WebSocket", /\bWebSocket\s*\(/],
  ["localStorage", /\blocalStorage\b/],
  ["sessionStorage", /\bsessionStorage\b/],
  ["indexedDB", /\bindexedDB\b/],
] as const;

export function findForbiddenPrivacyApis(
  sources: Readonly<Record<string, string>>,
): string[] {
  return Object.entries(sources)
    .flatMap(([path, source]) =>
      forbiddenPrivacyApis
        .filter(([, pattern]) => pattern.test(source))
        .map(([name]) => `${path}: ${name}`),
    )
    .sort();
}

export function normalizeProjectModule(
  root: string,
  moduleId: string,
): string {
  const cleanId = moduleId.split("?")[0] ?? moduleId;
  return relative(root, cleanId).replaceAll("\\", "/");
}

export function findForbiddenPublicModules(
  root: string,
  moduleIds: readonly string[],
): string[] {
  return [...new Set(
    moduleIds
      .map((id) => normalizeProjectModule(root, id))
      .filter(
        (path) =>
          forbiddenExact.has(path)
          || forbiddenPrefixes.some((prefix) => path.startsWith(prefix)),
      ),
  )].sort();
}

export function publicBundleBoundaryPlugin(
  root: string,
  surface: BuildSurface,
): Plugin {
  return {
    name: "paysim-public-bundle-boundary",
    apply: "build",
    generateBundle(_options, bundle) {
      const moduleIds = Object.values(bundle)
        .filter((output) => output.type === "chunk")
        .flatMap((output) => Object.keys(output.modules));
      const modules = [...new Set(
        moduleIds
          .map((id) => normalizeProjectModule(root, id))
          .filter((path) => !path.startsWith("../")),
      )].sort();

      if (surface === "PUBLIC_DEMO") {
        const forbidden = findForbiddenPublicModules(root, moduleIds);
        if (forbidden.length > 0) {
          this.error(
            `PUBLIC_DEMO contains forbidden modules:\n${forbidden.join("\n")}`,
          );
        }
      }

      this.emitFile({
        type: "asset",
        fileName: "paysim-module-manifest.json",
        source: JSON.stringify({ surface, modules }, null, 2),
      });
    },
  };
}
