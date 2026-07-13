// CommonJS resolution fixture (compiled with module/moduleResolution:
// nodenext).
//
// Verifies that the package "exports" map resolves the CommonJS ("require")
// condition and its .d.ts type declarations when the package is imported by
// name. This file's .cts extension forces CommonJS resolution regardless of
// the package's default module system.
//
// This fixture is type-checked by `npm run test:types-resolution` using the
// dedicated tsconfig.json in this folder (a full project compile performs
// package self-name resolution via "exports"). Editors doing single-file
// analysis may flag the bare "fhirpath" imports; that is expected and does
// not indicate a real problem.

import fhirpath = require("fhirpath");
import r4Model = require("fhirpath/fhir-context/r4");

void fhirpath.evaluate({}, "Patient.name");
void fhirpath.compile("Patient.name", r4Model);
fhirpath.parse("Patient.name");

const libVersion: string = fhirpath.version;
fhirpath.FP_Decimal.getDecimal("1.5");

const modelVersion: string = r4Model.version;
void fhirpath.evaluate({}, "Observation.value", {}, r4Model);

// Reference the values so they are not flagged as unused.
export const used = [libVersion, modelVersion];


