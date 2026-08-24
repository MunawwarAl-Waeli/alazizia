import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const staticAssetsRoot = path.join(projectRoot, "static-assets");
const sourceRoots = [path.join(projectRoot, "client", "src"), path.join(projectRoot, "client", "index.html")];
const storageReference = /\/manus-storage\/([a-zA-Z0-9][a-zA-Z0-9._/-]*)/g;

function walk(directory) {
  const results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...walk(entryPath));
    else results.push(entryPath);
  }
  return results;
}

function collectReferences() {
  const references = new Set();
  for (const sourceRoot of sourceRoots) {
    if (!existsSync(sourceRoot)) continue;
    const files = statSync(sourceRoot).isDirectory() ? walk(sourceRoot) : [sourceRoot];
    for (const file of files) {
      if (!/\.(tsx?|html)$/i.test(file)) continue;
      const content = readFileSync(file, "utf8");
      for (const match of content.matchAll(storageReference)) references.add(match[1]);
    }
  }
  return [...references].sort();
}

const references = collectReferences();
const missing = references.filter((reference) => {
  const assetPath = path.join(staticAssetsRoot, reference);
  return !assetPath.startsWith(`${staticAssetsRoot}${path.sep}`) || !existsSync(assetPath) || !statSync(assetpath).isFile();
});

if (missing.length) {
  console.error(`Missing ${missing.length} referenced assets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(`Validated ${references.length} project static assets in ${staticAssetsRoot}`);