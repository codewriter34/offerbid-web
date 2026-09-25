/**
 * @matrix-org/olm is an Emscripten (WASM) module. Its default export must be
 * initialized once with `Olm.init()` before any of its classes (Account,
 * Session, Utility, ...) can be constructed. Initialization loads
 * `olm.wasm`, which we serve as a static asset from `public/olm.wasm` (see
 * scripts/copy-olm-wasm.mjs) and point at explicitly via `locateFile` --
 * left to its default behavior, olm.js resolves the wasm file relative to
 * its own bundled module URL, which does not survive being bundled by
 * webpack/Turbopack.
 *
 * This must only ever run in the browser: it touches `window.crypto` and
 * `fetch`, and pulls in a ~150KB wasm binary we do not want in any
 * server-rendered path. Every caller in this module lives behind an async
 * function invoked from a client-side effect or event handler, never at
 * module load time.
 *
 * Note on typing: we deliberately never write `import type Olm from
 * "@matrix-org/olm"` anywhere in this codebase. The package's own
 * index.d.ts declares `export as namespace Olm`, a UMD global-namespace
 * declaration; TypeScript then resolves a same-named default import binding
 * as that namespace rather than as "the type of the default export value",
 * which fails to typecheck as an ordinary type. Instead we let TypeScript
 * infer everything from the actual awaited value below (via `typeof
 * loadOlm` at call sites, e.g. in crypto.ts) -- the shape still comes from
 * our own module augmentation in src/types/olm.d.ts, we just never name the
 * colliding identifier.
 */

async function loadOlmModule() {
  const mod = await import("@matrix-org/olm");
  const OlmModule = mod.default;
  await OlmModule.init({ locateFile: () => "/olm.wasm" });
  return OlmModule;
}

let olmPromise: ReturnType<typeof loadOlmModule> | null = null;

export async function loadOlm() {
  if (typeof window === "undefined") {
    throw new Error("Olm (chat encryption) is only available in the browser");
  }
  if (!olmPromise) {
    olmPromise = loadOlmModule().catch((err) => {
      // Allow a later call to retry instead of caching a permanent failure.
      olmPromise = null;
      throw err;
    });
  }
  return olmPromise;
}
