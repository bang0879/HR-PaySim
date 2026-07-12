import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PINNED_COMMIT = "790eb99";
export const REPOSITORY_ID = "transition-gap";

const REQUIRED_FILES = [
  "docs/diagnostic-product-constitution.md",
  "docs/diagnostic-before-after-casebook.md",
  "docs/templates/diagnostic-product-adapter-template.md",
];

export function selectUpstreamSource({ envValue, configText }) {
  const fromEnvironment = envValue?.trim();
  if (fromEnvironment) {
    return { source: "environment", upstreamRoot: fromEnvironment };
  }

  if (configText === undefined) {
    throw new Error("GOVERNANCE_UPSTREAM_NOT_CONFIGURED");
  }

  try {
    const parsed = JSON.parse(configText);
    if (typeof parsed.upstreamRoot !== "string" || !parsed.upstreamRoot.trim()) {
      throw new Error("invalid");
    }
    return { source: "local_config", upstreamRoot: parsed.upstreamRoot.trim() };
  } catch {
    throw new Error("GOVERNANCE_LOCAL_CONFIG_INVALID");
  }
}

export function createGovernanceReport({ source, branch, head, pinnedCommit }) {
  return {
    status: "OK",
    repository: REPOSITORY_ID,
    source,
    branch,
    head,
    pinnedCommit,
    drift: !head.startsWith(pinnedCommit),
    adapterRoot: ".governance/upstream",
  };
}

function runGit(upstreamRoot, args) {
  return execFileSync("git", ["-C", upstreamRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function validateUpstreamRepository(upstreamRoot) {
  const realRoot = realpathSync(resolve(upstreamRoot));
  const gitRoot = realpathSync(runGit(realRoot, ["rev-parse", "--show-toplevel"]));
  if (realRoot !== gitRoot || basename(realRoot).toLowerCase() !== REPOSITORY_ID) {
    throw new Error("GOVERNANCE_UPSTREAM_REPOSITORY_MISMATCH");
  }

  for (const relativePath of REQUIRED_FILES) {
    if (!existsSync(join(realRoot, relativePath))) {
      throw new Error(`GOVERNANCE_UPSTREAM_FILE_MISSING:${relativePath}`);
    }
  }

  runGit(realRoot, ["cat-file", "-e", `${PINNED_COMMIT}^{commit}`]);
  return {
    realRoot,
    branch: runGit(realRoot, ["branch", "--show-current"]) || "DETACHED",
    head: runGit(realRoot, ["rev-parse", "HEAD"]),
  };
}

export function prepareUpstreamLink({ projectRoot, upstreamRoot }) {
  const governanceDirectory = join(projectRoot, ".governance");
  const linkPath = join(governanceDirectory, "upstream");
  mkdirSync(governanceDirectory, { recursive: true });

  if (existsSync(linkPath)) {
    const stat = lstatSync(linkPath);
    if (!stat.isSymbolicLink() || realpathSync(linkPath) !== upstreamRoot) {
      throw new Error("GOVERNANCE_UPSTREAM_LINK_UNSAFE");
    }
    return linkPath;
  }

  symlinkSync(
    upstreamRoot,
    linkPath,
    process.platform === "win32" ? "junction" : "dir",
  );
  return linkPath;
}

function main() {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const configPath = join(projectRoot, ".governance", "governance.local.json");
  const selected = selectUpstreamSource({
    envValue: process.env.PAYSIM_GOVERNANCE_UPSTREAM,
    configText: existsSync(configPath) ? readFileSync(configPath, "utf8") : undefined,
  });
  const upstream = validateUpstreamRepository(selected.upstreamRoot);
  prepareUpstreamLink({ projectRoot, upstreamRoot: upstream.realRoot });
  console.log(
    JSON.stringify(
      createGovernanceReport({
        source: selected.source,
        branch: upstream.branch,
        head: upstream.head,
        pinnedCommit: PINNED_COMMIT,
      }),
      null,
      2,
    ),
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
