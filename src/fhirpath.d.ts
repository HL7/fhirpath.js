/**
 * Compiles a FHIRPath expression into a reusable evaluator function.
 * The advantage over `evaluate` is that the expression is parsed only once
 * and can be applied to multiple resources.
 * @param path - FHIRPath expression string, or an object with `base` and
 *  `expression` when evaluating against a part of a resource.
 * @param model - optional FHIR model (e.g. R4, STU3) for type-aware evaluation.
 * @param options - additional evaluation options.
 * @returns a function that accepts a resource and optional environment variables
 *  and returns the evaluation result.
 */
export function compile<T extends OptionVariants>(
  path: string | Path,
  model?: Model,
  options?: T
): Compile<T>;


/**
 * Evaluates a FHIRPath expression against the given FHIR data.
 * @param fhirData - FHIR resource, bundle, part of a resource, or array of
 *  resources. This object may be modified to add type information.
 * @param path - FHIRPath expression string, or an object with `base` and
 *  `expression` when evaluating against a part of a resource.
 * @param envVars - optional hash of environment variable name/value pairs.
 * @param model - optional FHIR model (e.g. R4, STU3) for type-aware evaluation.
 * @param options - additional evaluation options.
 * @returns an array of evaluation results, or a Promise resolving to such an
 *  array when async mode is enabled.
 */
export function evaluate<T extends OptionVariants>(
  fhirData: any,
  path: string | Path,
  envVars?: Context,
  model?: Model,
  options?: T
): ReturnType<T>;


/**
 * Converts any internal FHIRPath types in the given value to standard
 * JavaScript types.
 * @param value - a value or array of values returned from `evaluate`.
 * @returns the value with all internal types resolved.
 */
export function resolveInternalTypes(value: any): any;


/**
 * Returns the FHIRPath type of each element in the given evaluation result.
 * The result must have been obtained from `evaluate` with
 * `resolveInternalTypes: false`.
 * @param value - an array of values returned from `evaluate`.
 * @returns an array of type strings (e.g. `['FHIR.dateTime', 'System.String']`).
 */
export function types(value: any): string[];


/**
 * Parses a FHIRPath expression string into an internal AST representation.
 * @param expression - the FHIRPath expression to parse.
 * @returns the parsed AST object.
 */
export function parse(expression: string): any;


/** The version string of the fhirpath.js library. */
export const version :string;

/**
 * A class for precise decimal numbers that avoids binary floating-point
 * rounding errors. Use `FP_Decimal.getDecimal(value)` to create instances
 * from a number or numeric string, preserving exact decimal precision.
 */
export class FP_Decimal {
  /**
   * Creates a precise decimal object from a number or string value.
   * Use this to preserve exact decimal precision when constructing FHIR
   * resources from JSON, bypassing JavaScript's Number precision limits.
   * @param value - A number or numeric string to convert to a precise decimal.
   * @returns A precise decimal instance.
   */
  static getDecimal(value: number | string): FP_Decimal;

  /**
   * Returns the value as a JavaScript number.
   * If the decimal value exceeds JavaScript's safe integer limits, it may be
   * rounded when converted to JSON.
   * Use `toString()` to get the exact decimal value as a string if precision is
   * critical.
   */
  toNumber(): number;

  /**
   * Returns a string representation of the decimal value.
   */
  toString(): string;

  /**
   * Returns the JSON representation (as a JavaScript number).
   * if the decimal value exceeds JavaScript's safe integer limits, it may be
   * rounded when converted to JSON.
   * Use `toString()` to get the exact decimal value as a string if precision is
   * critical.
   */
  toJSON(): number;
}

/**
 * Describes a FHIRPath expression that is relative to a base path in a
 * resource. Used when evaluating against a part of a resource rather than
 * the whole resource.
 */
interface Path {
  /** The base path in the resource from which the data was extracted. */
  base: string;
  /** The FHIRPath expression relative to `base`. */
  expression: string;
}


/**
 * Describes the FHIR model data object specific to a particular FHIR version.
 * Provides type metadata, path definitions, and other model-specific information
 * needed for type-aware FHIRPath evaluation.
 */
interface Model {
  /** Model version, e.g. 'r5', 'r4', 'stu3', or 'dstu2'. */
  version: 'r5' | 'r4' | 'stu3' | 'dstu2',

  /**
   * Settings for the `weight()` function.
   */
  score?: {
    /**
     * Formal identifier for the weight property (the item weight property URI).
     * Used for getting scores from CodeSystem/ValueSet in R5.
     * This URI is used to get the property code from
     * "CodeSystem.property.code" or "ValueSet.expansion.property.code", and
     * then to get a concept property by "CodeSystem.concept.property.code" or
     * "ValueSet.expansion.contains.property.code".
     * P.S.:
     * We can use the property for already expanded contained ValueSets.
     * Expanding ValueSet to get the property for the CodeSystem concept is not
     * practical. It is better to look up for the concept in CodeSystem and get
     * the property there.
     */
    propertyURI?: string,

    /** The item weight extension URI(s) used in R5/R4. */
    extensionURI: string[],
  },

  /**
   * A hash of resource element paths (e.g. Observation.value) that are known
   * to point to fields that are choice types. The values list the possible
   * type suffixes (e.g. ['String', 'Quantity']).
   */
  choiceTypePaths: {
    [path: string]: string[];
  };

  /**
   * A hash from paths to the path for which their content is defined, e.g.
   * `Questionnaire.item.item` → `Questionnaire.item`.
   */
  pathsDefinedElsewhere: {
    [path: string]: string;
  };

  /** Mapping from data type names to their parent data type names. */
  type2Parent: {
    [path: string]: string;
  };

  /** Mapping from element paths to their FHIR data type names. */
  path2Type: {
    [path: string]: string;
  };

  /**
   * A hash map of FHIR resource types that support the 'url' search parameter,
   * mapped to `true`.
   */
  resourcesWithUrlParam: {
    [path: string]: boolean
  };

  /**
   * Mapping from element paths to data types, excluding abstract element types
   * such as Element and BackboneElement.
   */
  path2TypeWithoutElements: {
    [path: string]: string;
  },

  /**
   * Mapping from element paths to reference target types.
   * Defines the list of possible resource types that can be referenced at the
   * specified path. If there is only one item, it can be used to resolve
   * canonical URLs at that path.
   */
  path2RefType: {
    [path: string]: string[];
  }
}


/**
 * Represents a node in a FHIR resource tree, wrapping a data value together
 * with its path, type, and position metadata.
 */
interface ResourceNode {
  /** The parent resource node, or null if this is a root node. */
  parentResNode: ResourceNode | null;

  /** The path of the node in the resource (e.g. `Patient.name`). */
  path: string | null;

  /**
   * The index of the node within its parent array, if applicable
   * (e.g. `0` in `Patient.name[0]`).
   */
  index: number | undefined;

  /**
   * The raw property name of the node, including the type suffix for choice
   * type properties (e.g. `family` in `Patient.name[0].family`, or
   * `valueString` in `Observation.value` when the choice type is string).
   */
  propName: string | undefined;

  /**
   * The node's data or value. May be a primitive value, an object with
   * sub-nodes, an array, or a FHIRPath internal type (e.g. FP_DateTime).
   */
  data: any;

  /**
   * Additional data stored under the underscore-prefixed property in FHIR JSON
   * (e.g. extensions and ids on primitive elements).
   * See https://www.hl7.org/fhir/element.html#json for details.
   */
  _data: Record<string, any>;

  /** FHIR data type of this node, if described in the FHIR model. */
  fhirNodeDataType: string | null;

  /** Returns the converted (unwrapped) data value. */
  convertData(): any;

  /** The FHIR model associated with this node. */
  model: Model;

  /** Returns type information for this node, if available. */
  getTypeInfo(): any;

  /** Returns the JSON representation of this node's data. */
  toJSON(): string;

  /** Returns the full property name of the node, if available. */
  fullPropertyName(): string | undefined;
}


/**
 * Options for controlling FHIRPath expression evaluation.
 */
interface Options {
  /**
   * Whether values of internal types should be converted to standard JavaScript
   * types. Defaults to true.
   */
  resolveInternalTypes?: boolean;
  /**
   * When true and `resolveInternalTypes` is also true, `FP_Decimal` values are
   * preserved as-is instead of being converted to JavaScript numbers.
   * Defaults to false.
   */
  keepDecimalTypes?: boolean;
  /** An optional trace function called when the `trace()` function is used. */
  traceFn?: (value: any, label: string) => void;
  /** A user invocation table for replacing or defining custom functions. */
  userInvocationTable?: UserInvocationTable;
  /** URL of a FHIR Terminology Service for `memberOf` and similar functions. */
  terminologyUrl?: string;
  /** An AbortSignal for cancelling asynchronous expression evaluation. */
  signal?: AbortSignal;
  /**
   * An optional debugger callback invoked after each evaluation step.
   * Receives the evaluation context, the focus nodes, the result, and the
   * current AST node.
   */
  debugger?: (ctx: any, focus: ResourceNode[], result: ResourceNode[], node: any) => void;
  /**
   * HTTP headers to use when making requests to FHIR servers. Keys are server
   * base URLs, values are objects mapping header names to header values.
   */
  httpHeaders?: Record<string, string>;
  /**
   * Whether to use precision-safe decimal arithmetic instead of native
   * JavaScript number arithmetic. Defaults to false.
   */
  preciseMath?: boolean;
}


/** Options with asynchronous evaluation disabled (default). */
interface NoAsyncOptions extends Options {
  async?: false;
}


/** Options that enable asynchronous evaluation for async-capable functions. */
interface AsyncOptions extends Options {
  async: true;
}


/** Options that force all evaluations to return a Promise. */
interface AlwaysAsyncOptions extends Options {
  async: 'always';
}


/** Union of all supported option variants. */
type OptionVariants = NoAsyncOptions | AsyncOptions | AlwaysAsyncOptions;


/**
 * Maps an option variant to the corresponding return type of `evaluate`.
 * - `AlwaysAsyncOptions` → `Promise<any[]>`
 * - `NoAsyncOptions` → `any[]`
 * - Otherwise → `any[] | Promise<any[]>`
 */
type ReturnType<T> =
    T extends AlwaysAsyncOptions ? Promise<any[]> :
    T extends NoAsyncOptions ? any[] :
    any[] | Promise<any[]>;


/**
 * The type of the function returned by `compile`. Accepts a resource,
 * optional environment variables, and optional additional options.
 */
type Compile<T> = (resource: any, envVars?: Context, additionalOptions?: Options) => ReturnType<T>;


/** Environment variables context: either void or a hash of name/value pairs. */
type Context = void | Record<string, any>;


/**
 * Describes a user-defined function entry in the user invocation table.
 * Allows replacing existing FHIRPath functions or defining new ones.
 */
type UserInvocationTable = {
  [name: string]: {
    /** The function implementation. */
    fn: Function,
    /**
     * Describes the allowed parameter signatures. Keys are the number of
     * parameters; values list the expected parameter types.
     */
    arity: {
      [numberOfParams: number]: Array<'Expr' | 'AnyAtRoot' | 'Identifier' | 'TypeSpecifier' | 'Any' | 'Integer' | 'Boolean' | 'Number' | 'String'>
    },
    /** Whether null inputs are allowed. Defaults to false. */
    nullable?: boolean,
    /**
     * Whether the function receives internal ResourceNode structures rather
     * than unwrapped values. Defaults to false.
     */
    internalStructures?: boolean
  }
};
