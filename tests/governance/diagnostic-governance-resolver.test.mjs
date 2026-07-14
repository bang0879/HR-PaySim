import assert from "node:assert/strict";
import test from "node:test";

import {
  PINNED_COMMIT,
  createGovernanceReport,
  selectUpstreamSource,
} from "../../scripts/verify-diagnostic-governance.mjs";

test("environment configuration takes precedence without entering the report", () => {
  const selected = selectUpstreamSource({
    envValue: "C:/private/transition-gap",
    configText: JSON.stringify({ upstreamRoot: "D:/other/transition-gap" }),
  });

  assert.deepEqual(selected, {
    source: "environment",
    upstreamRoot: "C:/private/transition-gap",
  });

  const report = createGovernanceReport({
    source: selected.source,
    branch: "codex/diagnostic-product-governance",
    head: PINNED_COMMIT,
    pinnedCommit: PINNED_COMMIT,
  });
  assert.equal(JSON.stringify(report).includes("C:/private"), false);
  assert.equal(report.drift, false);
});

test("ignored local config is the fallback", () => {
  assert.deepEqual(
    selectUpstreamSource({
      envValue: "",
      configText: JSON.stringify({ upstreamRoot: "C:/local/transition-gap" }),
    }),
    { source: "local_config", upstreamRoot: "C:/local/transition-gap" },
  );
});

test("missing or malformed local configuration fails closed", () => {
  assert.throws(
    () => selectUpstreamSource({ envValue: "", configText: undefined }),
    /GOVERNANCE_UPSTREAM_NOT_CONFIGURED/,
  );
  assert.throws(
    () => selectUpstreamSource({ envValue: "", configText: "{}" }),
    /GOVERNANCE_LOCAL_CONFIG_INVALID/,
  );
  assert.throws(
    () => selectUpstreamSource({ envValue: "", configText: "not-json" }),
    /GOVERNANCE_LOCAL_CONFIG_INVALID/,
  );
});

test("branch movement is reported without changing the pin", () => {
  const report = createGovernanceReport({
    source: "environment",
    branch: "codex/diagnostic-product-governance",
    head: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    pinnedCommit: PINNED_COMMIT,
  });

  assert.equal(report.pinnedCommit, "790eb99");
  assert.equal(report.drift, true);
  assert.equal("upstreamRoot" in report, false);
});
