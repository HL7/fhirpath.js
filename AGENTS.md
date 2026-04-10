# AGENTS.md

## Project map (read this first)
- This project implements the FHIRPath language in JavaScript and supports DSTU2, STU3, R4, and R5 model contexts.
- Entry point is `src/fhirpath.js`: public API is `parse`, `compile`, `evaluate`, `resolveInternalTypes`, `types`.
- `src/fhirpath.js` also exports `version`, `FP_Decimal`, `ucumUtils`, and `util` (used by external callers and custom function implementations).
- Evaluation flow is `parse()` -> AST -> `_compile()` -> `applyParsedPath()` -> `engine.doEval()`; see `src/fhirpath.js` and `src/parser/index.js`.
- Core behavior is table-driven: `engine.invocationTable` in `src/fhirpath.js` maps function/operator names to handlers and arity checks.
- Most function families live in separate modules (e.g. `src/aggregate.js`, `src/filtering.js`, `src/math.js`) and export an `engine` object.
- FHIR version-specific typing/model metadata is in `fhir-context/{dstu2,stu3,r4,r5}` and is required for choice-type/type resolution.
- CLI entry is `bin/fhirpath`; behavior is covered by `test/bin_fhirpath.test.js`.

## Architecture patterns that matter
- Internal values are wrapped as `ResourceNode` / `FP_Type`; final conversion happens in `prepareEvalResult()` (`src/fhirpath.js`).
- `evaluate()` mutates input resources by attaching hidden `__path__` metadata (documented in `README.md`); do not assume input objects stay pristine.
- Base-path evaluation for partial resources uses `{base, expression}` and model normalization via `model.pathsDefinedElsewhere`/`model.path2Type` in `_compile()`.
- Async operations (`resolve`, `memberOf`, `%terminologies.*`) require `options.async`; guards are enforced via `util.checkAllowAsync` (see `src/additional.js`, `src/terminologies.js`).
- `%factory.*` is implemented as a class with its own invocation table in `src/factory.js` and injected as `%factory` in eval context.

## Testing workflow (project-specific)
- Spec-style unit tests are YAML-driven: `test/fhirpath.test.js` loads `test/cases/*.yaml` and generates Jest tests dynamically.
- Additional Jest suites in `test/*.test.js` cover APIs and behaviors outside YAML cases (e.g. `test/async-functions.test.js`, `test/user-invocation-table.test.js`, `test/bin_fhirpath.test.js`).
- Many tests run in both math modes automatically (`preciseMath` true/false) unless a case sets `preciseMath` explicitly.
- `npm run test:unit` runs Jest three times across time zones (`default`, `America/New_York`, `Europe/Paris`) to catch datetime regressions.
- Test helpers in `test/test_utils.js` auto-load models (`r5`, `r4`, `stu3`, `dstu2`) and deep-clone input resources to avoid cross-test pollution.
- Add new spec-style cases in `test/cases/*.yaml`; use keys like `model`, `inputfile`, `variables`, `context`, `error`, `result`.
- Type declaration checks use `npm run test:tsd` with tests in `test/typescript/fhirpath.test-d.ts`.
- End-to-end browser checks run via Cypress under `test/cypress/` (script: `npm run test:e2e`, which builds the demo first).

## Build/dev commands you will actually use
- Install: `npm install` (if `node` is missing in this environment, run `source bashrc.fhirpath` and retry).
- Lint: `npm run lint` (targets `src/parser/index.js`, `src/*.js`, `converter/`).
- Unit tests: `npm run test:unit`; debugger mode: `npm run test:unit:debug`.
- Type tests: `npm run test:tsd`.
- E2E tests: `npm run test:e2e` (builds demo + runs Cypress).
- Full CI-like local run: `npm test` (lint + tsd + unit + e2e).
- Parser regeneration: `npm run generateParser` (uses `src/parser/FHIRPath.g4`, `antlr-4.9.3-complete.jar`, then `scripts/fix-parser-imports.js`).
- Browser artifacts: `npm run build` (webpack outputs in `browser-build/`, plus zipped distributable).
- Performance comparison: `npm run compare-performance` (`test/benchmark.js`).

## Sandbox and escalation
- If a command that is important to the task fails due to sandbox restrictions (for example EPERM/spawn permission errors), rerun it with escalated permissions and include a brief justification request.

## Conventions to preserve when editing
- Performance is a top priority: prefer lower-allocation, lower-overhead designs, and treat measurable performance regressions as blockers unless explicitly approved.
- Use CommonJS (`require`/`module.exports`) and 2-space indentation (see `eslint.config.js`).
- Use modern JavaScript syntax (`const`/`let`, arrow functions, destructuring) where it matches existing files.
- In AI chat responses, prefer project-relative file references in `path:line` format (e.g. `src/fhirpath.js:19`).
- Keep two blank lines between declarations and above JSDoc blocks.
- Treat JSDoc as part of a declaration: keep two blank lines above the JSDoc block, and no blank line between JSDoc and the declaration.
- Keep project layout conventions: core logic in `src/`, FHIR-version-specific metadata in `fhir-context/`, tests in `test/`, and docs in `docs/` or `README.md`.
- New FHIRPath functions are typically added as module functions plus registration in `engine.invocationTable` (`src/fhirpath.js`).
- For feature work, update tests together with implementation (`test/cases/*.yaml` for spec-style behavior, plus `test/*.test.js` when behavior is API-specific).
- For custom function hooks, follow `userInvocationTable` conventions in `_compile()`; use `internalStructures: true` only if handler needs raw `ResourceNode` access.
- For async server calls, thread options via `terminologyUrl`, `fhirServerUrl`, `httpHeaders`, and optional `signal` (see `docs/auth.md`, `docs/abort.md`).
- If public API signatures or exports change, update `src/fhirpath.d.ts` and validate with `npm run test:tsd` (`test/typescript/fhirpath.test-d.ts`).
- Keep behavior standards-compliant with FHIRPath and aligned with the selected FHIR model version when model-aware behavior is involved.
