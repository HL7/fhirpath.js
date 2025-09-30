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
  // Model version, e.g. 'r5', 'r4', 'stu3', or 'dstu2'.
  version: 'r5' | 'r4' | 'stu3' | 'dstu2',

  // This section contains setting for the `weight()` function.
  score?: {
    // Formal identifier for the weight property (the item weight property URI).
    // It is used for getting scores from CodeSystem/ValueSet in R5.
    // Use this URI to get property code from "CodeSystem.property.code"
    // or "ValueSet.expansion.property.code" and then use this code to get a
    // concept property by "CodeSystem.concept.property.code" or
    // "ValueSet.expansion.contains.property.code".
    // P.S.:
    // We can use the property for already expanded contained ValueSets.
    // Expanding ValueSet to get the property for the CodeSystem concept is not
    // practical. It is better to look up for the concept in CodeSystem and get
    // the property there.
    propertyURI?: string,

    // The item weight extension URI used in R5/R4
    extensionURI: string[],
  },

  /**
   *  A hash of resource element paths (e.g. Observation.value) that are known
   *  to point to fiels that are choice types.
   */
  choiceTypePaths: {
    [path: string]: string[];
  };

  /**
   *  A hash from paths to the path for which their content is defined, e.g.
   *  Questionnaire.item.item -> Questionnaire.item.
   */
  pathsDefinedElsewhere: {
    [path: string]: string;
  };

  /**
   * Mapping data types to parent data types.
   */
  type2Parent: {
    [path: string]: string;
  };

  /**
   * Mapping paths to data types.
   */
  path2Type: {
    [path: string]: string;
  };

  /**
   * A hash map of FHIR resource types that support the 'url' search parameter
   * to true values.
   */
  resourcesWithUrlParam: {
    [path: string]: boolean
  };

  /**
   * Mapping paths to data types without elements,
   * e.g. Element and BackboneElement.
   */
  path2TypeWithoutElements: {
    [path: string]: string;
  },

  /**
   * Mapping paths to reference types.
   * This is used to define a list of possible resource types that can be
   * referenced by a reference at the specified path. If there is only one item
   * in this list for a specified path, it can be used to resolve canonical URLs
   * located at that path.
   */
  path2RefType: {
    [path: string]: string[];
  }
}

interface ResourceNode {
  /**
   * The parent resource node
   */
  parentResNode: ResourceNode | null;
  
  /**
   * The path of the node in the resource (e.g. Patient.name)
   */
  path: string | null;

  /** 
   * The index of the node in the array (e.g. The `0` in Patient.name[0])
   */
  index: number | undefined;
  
  /**
   * The raw name of the property
   * e.g. `family` in `Patient.name[0].family`
   *      or `valueString` in `Patient.name[1].family.extension[0].value` 
   *      (has the type suffix on it for choice type properties)
   */
  propName: string | undefined;

  /**
   * The node's data or value (might be an object with sub-nodes, an array, or FHIR data type)
   */
  data: any;
  
  /**
   * Additional data stored in a property named with "_" prepended
   * See https://www.hl7.org/fhir/element.html#json for details
   */
  _data: Record<string, any>;
  
  /**
   * FHIR node data type, if the resource node is described in the FHIR model
   */
  fhirNodeDataType: string | null;
  
  /**
   * Cached converted data
   */
  convertData(): any;
 
  /**
   * The FHIR model used for this node
   */
  model : fhirpath.Model;
 
  /**
   * Retrieve any type information if available
   */
  getTypeInfo(): any;

  /**
   * Converts the node to its JSON representation
   */
  toJSON(): string;

  /**
   * Returns the full property name of the node where available
   */
  fullPropertyName(): string | undefined;
}


interface Options {
    resolveInternalTypes?: boolean
    traceFn?: (value: any, label: string) => void,
    userInvocationTable?: UserInvocationTable,
    terminologyUrl?: string,
    signal?: AbortSignal,
    debugger?: (ctx: any, focus: ResourceNode[], result: ResourceNode[], node: any) => void,
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

type Compile<T> = (resource: any, envVars?: Context, additionalOptions?: Options) => ReturnType<T>;

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
