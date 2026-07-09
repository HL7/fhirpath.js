// Bundles the ES module entry point (src/fhirpath.mjs) together with all of its
// CommonJS dependencies (antlr4, date-fns, decimal.js, @lhncbc/ucum-lhc, and
// @loxjs/url-join) into a single self-contained ES module: esm/fhirpath.mjs.
//
// Shipping a pre-bundled ES module lets bundlers such as esbuild (used by the
// Angular CLI) consume fhirpath through the package "import" condition without
// hitting "CommonJS or AMD dependency" optimization-bailout warnings, because
// the resulting bundle no longer performs any require() of those CommonJS
// packages.
//
// The build fails (non-zero exit) on any esbuild warning that is not
// explicitly silenced below, so a dependency change can never quietly ship a
// broken or suboptimal bundle.
//
// Run with `npm run build:esm`. It is also wired into the "prepare" and
// "pretest:esm" scripts so the artifact is present in the published tarball
// (and in git/local installs) and exercised by the ESM smoke test.


import { build, formatMessages } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';


const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');


try {
  const result = await build({
    entryPoints: [resolve(projectRoot, 'src/fhirpath.mjs')],
    outfile: resolve(projectRoot, 'esm/fhirpath.mjs'),
    bundle: true,
    format: 'esm',
    // "neutral" keeps the bundle free of Node- and browser-specific
    // assumptions so it runs in both environments. It also means esbuild will
    // not silently pull in a Node built-in: if a dependency ever needs one, the
    // build fails loudly instead of producing an unusable bundle.
    platform: 'neutral',
    // fhirpath's own code is authored as CommonJS and pulls its dependencies in
    // via require(), so dependencies must resolve to their CommonJS builds.
    // esbuild's `conditions` (exports-map conditions) and `mainFields` (legacy
    // top-level package.json fields) are two separate resolution mechanisms:
    //
    // - We deliberately leave `conditions` unset. esbuild activates the
    //   "require" condition automatically for require() calls; adding
    //   "import"/"module" there would instead resolve a require() to a
    //   package's ESM build and hand back a module namespace object instead of
    //   module.exports, breaking deps whose CommonJS entry sets module.exports
    //   to a callable (e.g. decimal.js, whose Decimal.set static would vanish).
    // - `mainFields` (set below) is a different mechanism, consulted only for
    //   deps without an exports map. The neutral platform defaults it to empty,
    //   so we set it explicitly. "main" MUST stay first so those callable
    //   CommonJS defaults resolve to their CJS build; "module" is only a
    //   last-resort fallback for deps shipping a legacy "module" field but no
    //   "main" ("main"-only deps like @lhncbc/ucum-lhc resolve either way).
    mainFields: ['main', 'module'],
    // 'external' writes esm/fhirpath.mjs.map but adds NO sourceMappingURL
    // comment to the bundle. That map is a dev-only artifact, excluded from
    // the published package via "!esm/**/*.map" in package.json "files", so
    // the shipped bundle must not reference it -- otherwise consumers'
    // bundlers and devtools would warn about a missing source map.
    sourcemap: 'external',
    minify: false,
    // esbuild already suppresses warnings originating inside node_modules, so
    // this bundle normally reports none. If we encounter warnings that
    // shouldn't break the build, we can disable their output here.
    // Example:
    // logOverride: { 'suspicious-boolean-not': 'silent' }
  });

  // Fail loudly on any warning that was not explicitly silenced, so a
  // dependency change can never quietly ship a broken or suboptimal bundle.
  if (result.warnings.length > 0) {
    const formatted = await formatMessages(result.warnings, {
      kind: 'warning',
      color: !!process.stderr.isTTY
    });
    console.error(formatted.join('\n'));
    process.exit(1);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}


