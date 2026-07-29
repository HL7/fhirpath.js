// Type-checks the shipped, hand-written declaration files (.d.ts/.d.mts) with
// skipLibCheck:false, by importing the package and every model entry point by
// name. Any error inside those declarations (e.g. a broken cross-file
// reference, or a type a strict consumer would reject) fails this check --
// unlike test:types-resolution, which uses skipLibCheck:true to isolate the
// exports-map resolution from declaration-internal errors.

import fhirpath from "fhirpath";
import type {
  Model, ResourceNode, Options, Path, UserInvocationTable
} from "fhirpath";
import dstu2 from "fhirpath/fhir-context/dstu2";
import stu3 from "fhirpath/fhir-context/stu3";
import r4 from "fhirpath/fhir-context/r4";
import r5 from "fhirpath/fhir-context/r5";

void fhirpath;
export const versions = [dstu2.version, stu3.version, r4.version, r5.version];
export type Public =
  Model | ResourceNode | Options | Path | UserInvocationTable;

