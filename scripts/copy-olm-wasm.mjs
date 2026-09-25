// @matrix-org/olm ships as an Emscripten module: olm.js does a runtime
// `fetch()` for its .wasm binary using a same-origin relative URL (see
// node_modules/@matrix-org/olm/olm.js). Webpack/Turbopack can't resolve that
// runtime fetch the way it resolves static imports, so the .wasm file needs
// to be served as a plain static asset and located explicitly via the
// `locateFile` option we pass to `Olm.init()` (see src/lib/signal/olmLoader.ts).
//
// This script copies the .wasm file from node_modules into public/ so it's
// always in sync with the installed @matrix-org/olm version. It runs via the
// `postinstall` npm script, so a fresh `npm install` always has it.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const src = join(repoRoot, "node_modules", "@matrix-org", "olm", "olm.wasm");
const destDir = join(repoRoot, "public");
const dest = join(destDir, "olm.wasm");

if (!existsSync(src)) {
  console.warn(
    "[copy-olm-wasm] node_modules/@matrix-org/olm/olm.wasm not found -- skipping copy. " +
      "Chat encryption will not work until `npm install` completes successfully.",
  );
  process.exit(0);
}

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

copyFileSync(src, dest);
console.log("[copy-olm-wasm] copied olm.wasm to public/olm.wasm");
