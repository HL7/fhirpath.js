declare module "fhirpath" {
  export function compile(
      path: string | Path,
      model?: Model,
      options?: {
        resolveInternalTypes?: boolean
      }
    ): Compile;
  export function evaluate(
    fhirData: any,
    path: string | Path,
    context: Context,
    model?: Model,
    options?: {
      resolveInternalTypes?: boolean,
      traceFn?: (value: any, label: string) => void
    }
  ): any[];
  export function resolveInternalTypes(value: any): any;
  export function types(value: any): string[];
}

declare module "fhirpath/fhir-context/dstu2" {
  export const { choiceTypePaths, pathsDefinedElsewhere }: Model;
}

declare module "fhirpath/fhir-context/r5" {
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
