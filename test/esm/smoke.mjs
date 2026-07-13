// Runtime smoke test for the ES module entry points.
//
// It imports the library and every FHIR model *by package name* so that the
// package "exports" map (and its ESM "import" condition) is exercised
// end-to-end via Node's self-referencing resolution. Run with:
//   node test/esm/smoke.mjs
// It is wired into `npm test` through the "test:esm" script.

import assert from "node:assert/strict";
import fhirpath, {
  parse,
  compile,
  evaluate,
  resolveInternalTypes,
  types,
  version,
  FP_Decimal,
  util,
  ucumUtils
} from "fhirpath";
import dstu2Model, { version as dstu2Version }
  from "fhirpath/fhir-context/dstu2";
import stu3Model, { version as stu3Version }
  from "fhirpath/fhir-context/stu3";
import r4Model, { version as r4Version }
  from "fhirpath/fhir-context/r4";
import r5Model, { version as r5Version }
  from "fhirpath/fhir-context/r5";


assert.equal(
  typeof fhirpath.evaluate, "function",
  "default export should expose evaluate()"
);

// Every documented named export is present, correctly typed, and identical to
// the matching member of the default export. This guards the full destructured
// re-export list in src/fhirpath.mjs and confirms the default export exposes
// the whole public API surface (including that named/default version match).
const expectedExportTypes = {
  parse: "function",
  compile: "function",
  evaluate: "function",
  resolveInternalTypes: "function",
  types: "function",
  version: "string",
  FP_Decimal: "function",
  util: "object",
  ucumUtils: "object"
};
const namedExports = {
  parse, compile, evaluate, resolveInternalTypes, types, version,
  FP_Decimal, util, ucumUtils
};
for (const [name, expectedType] of Object.entries(expectedExportTypes)) {
  assert.equal(
    typeof namedExports[name], expectedType,
    `named "${name}" export should be a ${expectedType}`
  );
  assert.equal(
    namedExports[name], fhirpath[name],
    `named "${name}" export should be identical to fhirpath.${name}`
  );
}

const names = evaluate(
  { resourceType: "Patient", name: [{ given: ["Alice", "Bob"] }] },
  "Patient.name.given"
);
assert.deepEqual(
  names, ["Alice", "Bob"],
  "evaluate() should return the given names"
);

// Every FHIR model entry point resolves through the "exports" map, exposes the
// correct version via both its default and named exports, and drives
// model-aware (choice-type) evaluation.
const models = [
  { name: "dstu2", model: dstu2Model, namedVersion: dstu2Version },
  { name: "stu3", model: stu3Model, namedVersion: stu3Version },
  { name: "r4", model: r4Model, namedVersion: r4Version },
  { name: "r5", model: r5Model, namedVersion: r5Version }
];

for (const { name, model, namedVersion } of models) {
  assert.equal(
    model.version, name,
    `default ${name} model export should report version "${name}"`
  );
  assert.equal(
    namedVersion, name,
    `named ${name} model "version" export should be "${name}"`
  );

  const values = evaluate(
    { resourceType: "Observation", valueString: "text" },
    "Observation.value",
    null,
    model
  );
  assert.deepEqual(
    values, ["text"],
    `${name} model-aware evaluation should resolve the choice-type value`
  );
}

// The pre-bundled ES module inlines @lhncbc/ucum-lhc; exercise a real unit
// conversion so a bundling regression that breaks that dependency is caught.
const cmConversion = fhirpath.ucumUtils.convertUnitTo("m", 1, "cm");
assert.equal(
  cmConversion.status, "succeeded",
  "ucumUtils.convertUnitTo('m', 1, 'cm') should succeed"
);
assert.equal(
  cmConversion.toVal, 100,
  "ucumUtils.convertUnitTo('m', 1, 'cm') should convert to 100 cm"
);

// eslint-disable-next-line no-console
console.log("ESM smoke test passed.");
