export function compile<T extends OptionVariants>(
  path: string | Path,
  model?: Model,
  options?: T
): Compile<T>;

export function evaluate<T extends OptionVariants>(
  fhirData: any,
  path: string | Path,
  envVars?: Context,
  model?: Model,
  options?: T
): ReturnType<T>;

export function resolveInternalTypes(value: any): any;

export function types(value: any): string[];

export function parse(expression: string): any;

export const version :string;

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
    terminologyUrl?: string
}

interface NoAsyncOptions extends Options {
  async?: false;
}

interface AsyncOptions extends Options {
  async: true;
}

interface AlwaysAsyncOptions extends Options {
  async: 'always';
}

type OptionVariants = NoAsyncOptions | AsyncOptions | AlwaysAsyncOptions;

type ReturnType<T> =
    T extends AlwaysAsyncOptions ? Promise<any[]> :
    T extends NoAsyncOptions ? any[] :
    any[] | Promise<any[]>;

type Compile<T> = (resource: any, envVars?: Context) => ReturnType<T>;

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
