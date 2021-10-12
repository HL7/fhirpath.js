declare module "fhirpath" {
  export function parse(path: string);
  export function compile(path: string, model: Model);
  export function evaluate(
    fhirData: any,
    path: string | Path,
    context: void | Record<string, any>,
    model?: Model
  );
}

declare module "fhirpath/fhir-context/dstu2" {
  export const { choiceTypePaths, pathsDefinedElsewhere }: Model;
}

declare module "fhirpath/fhir-context/r4" {
  export const { choiceTypePaths, pathsDefinedElsewhere }: Model;
}

declare module "fhirpath/fhir-context/stu3" {
  export const { choiceTypePaths, pathsDefinedElsewhere }: Model;
}

interface Path {
  base: string;
  expression: string;
}

interface Model {
  choiceTypePaths: JSON;
  pathsDefinedElsewhere: JSON;
}
