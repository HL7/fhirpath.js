declare module "fhirpath" {
  export function compile(path: string | Path, model?: Model): Compile;
  export function evaluate(
    fhirData: any,
    path: string | Path,
    context: Context,
    model?: Model
  ): any[];
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
  choiceTypePaths: {
    [path: string]: string[];
  };
  pathsDefinedElsewhere: {
    [path: string]: string;
  };
}

type Compile = (resource: any, context: Context) => any[];

type Context = void | Record<string, any>;
