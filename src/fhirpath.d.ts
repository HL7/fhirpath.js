export function compile<T extends OptionVariants>(
  path: string | Path,
  model?: Model,
  options?: T
): Compile<T>;

export function evaluate<T extends OptionVariants>(
  fhirData: any,
  path: string | Path,
  context?: Context,
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
  score: {
    // The item weight property description.
    // It is used for getting scores from CodeSystem/ValueSet in R5.
    // We can use the property for already expanded contained ValueSets.
    // Expanding ValueSet to get the property for the CodeSystem concept is not
    // practical. It is better to look up for the concept in CodeSystem and get
    // the property there.
    property: {
      // Formal identifier for the weight property.
      //
      // Context of use:
      // - R5: CodeSystem.property.uri,
      //       ValueSet.expansion.property.uri
      // - R4/R3/R2: [Unused]
      //
      // In R5 use this URI to get property code from "CodeSystem.property.code"
      // or "ValueSet.expansion.property.code" and then use this code to get a
      // concept property by "CodeSystem.concept.property.code" or
      // "ValueSet.expansion.contains.property.code".
      uri: string,
    },

    // Used in R5/R4/R3/R2.
    extension: {
      // Context of use:
      // - R5/R4/R3/R2: Coding
      coding: string,

      // Context of use:
      // - R5/R4: Questionnaire.item.answerOption TODO: do we need to support non-Coding???
      // - R3:    Questionnaire.item.option.valueCoding
      // - DSTU2: [Unused]
      questionnaire: string,

      // Context of use:
      // - R5 (UNPUBLISHED): QuestionnaireResponse.item.answer,
      //                     QuestionnaireResponse.item.answer.value (valueCoding covered by Coding) TODO: do we need to support non-Coding???
      // - R5/R4/R3/R2:      [Unused]
      //                     Instead, use "score.extension.coding" for
      //                     QuestionnaireResponse.item.answer.value
      questionnaireResponse: string,

      // Context of use:
      // - R5: [Unused]
      //       Use "score.property.uri" instead
      // - R4: [Unused]
      // - R3/R2: ValueSet.expansion.contains
      valueSetExpansion: string,

      // Context of use:
      // - R5/R4: [Unused]
      // - R4/R3/R2: ValueSet.compose.include.concept
      valueSetInclude: string,

      // Context of use:
      // - R5/R4/R3: [Unused]
      // - R2: ValueSet.codeSystem.concept
      valueSetCodeSystem: string,

      // Context of use:
      // - R5: [unused]
      //       Use "score.property.uri" instead
      // - R4: CodeSystem.concept
      // - R3/R2: [Unused]
      codeSystem: string
    }
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

type Compile<T> = (resource: any, context?: Context) => ReturnType<T>;

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
