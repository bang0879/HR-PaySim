import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, normalize } from "node:path";

const roots = ["src/components", "src/routes", "src/App.tsx"];
const forbidden = [
  "AI substitution",
  "job replacement",
  "Total Work Cost",
  "attrition probability",
  "salary calculator",
  "이직 확률",
  "생산성 향상률",
  "대체율",
];

function filesUnder(path: string): string[] {
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path).flatMap((entry: string) => filesUnder(join(path, entry)));
}

const violations = roots
  .filter((root) => existsSync(root))
  .flatMap((root) => filesUnder(root))
  .filter((file) => /\.(ts|tsx|md|html|css)$/.test(file))
  .filter((file) => !normalize(file).endsWith(normalize("src/lib/hr-paysim/copy.ts")))
  .flatMap((file) => {
    const body = readFileSync(file, "utf8");
    return forbidden.filter((term) => body.includes(term)).map((term) => `${file}: forbidden term "${term}"`);
  });

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}