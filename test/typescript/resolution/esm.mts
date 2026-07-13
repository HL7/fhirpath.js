// ESM resolution fixture (compiled with module/moduleResolution: nodenext).
//
// Verifies that the package "exports" map resolves the ESM ("import")
// condition and its .d.mts type declarations when the package is imported by
// name. This file's .mts extension forces ES module resolution regardless of
// the package's default module system.
//
// This fixture is type-checked by `npm run test:types-resolution` using the
// dedicated tsconfig.json in this folder (a full project compile performs
// package self-name resolution via "exports"). Editors doing single-file
// analysis may flag the bare "fhirpath" imports; that is expected and does
// not indicate a real problem.

import fhirpath, { compile, evaluate, parse, version, FP_Decimal } from "fhirpath";
import r4Model, { version as r4Version } from "fhirpath/fhir-context/r4";
import stu3Model from "fhirpath/fhir-context/stu3";

// The default export exposes the whole API object.
void fhirpath.evaluate({}, "Patient.name");
void fhirpath.compile("Patient.name");

// Named exports are usable and typed.
void evaluate({}, "Observation.value", {}, r4Model);
void compile("Patient.name", r4Model, { async: false });
parse("Patient.name");

const libVersion: string = version;
FP_Decimal.getDecimal("1.5");

const modelVersion: string = r4Version;
void evaluate({}, "Observation.value", {}, stu3Model);

// Reference the values so they are not flagged as unused.
export const used = [libVersion, modelVersion];


