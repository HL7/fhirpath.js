declare module "fhirpath" {
  export function compile(
      path: string | Path,
      model?: Model,
      options?: Options
    ): Compile;
  export function evaluate(
    fhirData: any,
    path: string | Path,
    context?: Context,
    model?: Model,
    options?: Options
  ): any[];
  export function resolveInternalTypes(value: any): any;
  export function types(value: any): string[];
  export function parse(expression: string): any;
  export const version :string;
}

declare module "fhirpath/fhir-context/dstu2" {
  export const {
    choiceTypePaths,
    pathsDefinedElsewhere,
    type2Parent,
    path2Type
  }: Model;
}

declare module "fhirpath/fhir-context/r5" {
  export const {
    choiceTypePaths,
    pathsDefinedElsewhere,
    type2Parent,
    path2Type
  }: Model;
}

declare module "fhirpath/fhir-context/r4" {
  export const {
    choiceTypePaths,
    pathsDefinedElsewhere,
    type2Parent,
    path2Type
  }: Model;
}

declare module "fhirpath/fhir-context/stu3" {
  export const {
    choiceTypePaths,
    pathsDefinedElsewhere,
    type2Parent,
    path2Type
  }: Model;
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
  type2Parent: {
    [path: string]: string;
  };
  path2Type: {
    [path: string]: string;
  };
}

interface Options {
  resolveInternalTypes?: boolean
  traceFn?: (value: any, label: string) => void,
  userInvocationTable?: UserInvocationTable,
  async: false|true|'always',
  terminologyUrl: string
}

type Compile = (resource: any, context?: Context) => any[];

type Context = void | Record<string, any>;

type UserInvocationTable = {
  [name: string]: {
    fn: Function,
    arity: {
      [numberOfParams: number]: Array<'Expr' | 'AnyAtRoot' | 'Identifier' | 'TypeSpecifier' | 'Any' | 'Integer' | 'Boolean' | 'Number' | 'String'>
    },
    nullable?: boolean,
    internalStructures?: boolean
  }
};
