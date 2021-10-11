declare module "fhirpath" {
  export function evaluate(
    fhirData: any,
    path: string | Path,
    context: void | Record<string, any>,
    model?: Model
  );
}

declare module "fhirpath/fhir-context/dstu2";
declare module "fhirpath/fhir-context/r4";
declare module "fhirpath/fhir-context/stu3";

interface Path {
  base: string;
  expression: string;
}

interface Model {
  choiceTypePaths: JSON;
  pathsDefinedElsewhere: JSON;
}
