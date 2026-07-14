export type BuildSurface = "PUBLIC_DEMO" | "FACILITATOR_LOCAL";

export function resolveBuildSurface(mode: string | undefined): BuildSurface {
  return mode === "facilitator-local" ? "FACILITATOR_LOCAL" : "PUBLIC_DEMO";
}
