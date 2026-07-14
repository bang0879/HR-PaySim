import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { publicBundleBoundaryPlugin } from "./scripts/public-bundle-boundary.ts";
import { resolveBuildSurface } from "./src/lib/hr-paysim/access/buildSurface.ts";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const surface = resolveBuildSurface(mode);
  const entry = surface === "FACILITATOR_LOCAL"
    ? "src/surfaces/FacilitatorLocalApp.tsx"
    : "src/surfaces/PublicDemoApp.tsx";
  return {
    plugins: [react(), publicBundleBoundaryPlugin(root, surface)],
    resolve: {
      alias: {
        "@paysim-surface-entry": resolve(root, entry),
      },
    },
    build: {
      outDir: surface === "FACILITATOR_LOCAL"
        ? "dist/facilitator-local"
        : "dist/public",
    },
  };
});
