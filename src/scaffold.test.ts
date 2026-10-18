// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const pkg = JSON.parse(read("package.json")) as {
  engines: { node: string };
  scripts: Record<string, string>;
};

describe("scaffold configuration", () => {
  it("test_ac2_tsconfig_has_strict_mode", () => {
    // tsconfig.json is JSON without comments in this scaffold.
    const tsconfig = JSON.parse(read("tsconfig.json")) as {
      compilerOptions: { strict: boolean; paths: Record<string, string[]> };
    };
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.paths["@/*"]).toEqual(["./src/*"]);
  });

  it("test_ac5_check_runs_steps_in_order_and_chains_with_and", () => {
    const steps = pkg.scripts.check.split(" && ");
    expect(steps).toEqual([
      "npm run typecheck",
      "npm run lint",
      "npm run format:check",
      "npm test",
      "npm run build",
    ]);
  });

  it("test_ac9_node_24_is_pinned_in_nvmrc_and_engines", () => {
    expect(read(".nvmrc").trim()).toBe("24");
    expect(pkg.engines.node).toBe("24.x");
  });
});
