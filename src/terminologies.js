// This file contains a class that implements the Terminology Service API.
// See https://hl7.org/fhir/fhirpath.html#txapi for details.


const util = require("./utilities");
const {ResourceNode, TypeInfo} = require('./types');


class Terminologies {
  constructor(terminologyUrl) {
    this.terminologyUrl = terminologyUrl;
    this.invocationTable = Terminologies.invocationTable;
  }

  // Same as fhirpath.invocationTable, but for %terminologies methods
  static invocationTable = {
    expand: { fn: Terminologies.expand, arity: {
      1: ['AnyAtRoot'],
      2: ['AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    lookup: { fn: Terminologies.lookup, arity: {
      1: ['AnyAtRoot'],
      2: ['AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    validateVS: { fn: Terminologies.validateVS, arity: {
      2: ['AnyAtRoot', 'AnyAtRoot'],
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    validateCS: { fn: Terminologies.validateCS, arity: {
      2: ['AnyAtRoot', 'AnyAtRoot'],
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    subsumes: { fn: Terminologies.subsumes, arity: {
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnyAtRoot'],
      4: ['AnyAtRoot', 'AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    translate: { fn: Terminologies.translate, arity: {
      2: ['AnyAtRoot', 'AnyAtRoot'],
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    }
  };


  /**
   * This calls the Terminology Service $expand operation.
   * https://hl7.org/fhir/terminology-service.html#expand
   * https://hl7.org/fhir/valueset-operation-expand.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} valueSetColl - an array that should have
   *  one element, which is either a ResourceNode with an actual ValueSet, or
   *  a ResourceNode with a canonical URL reference to a value set, or
   *  a string with a canonical URL reference to a value set.
   * @param {string} params - a URL encoded string with other parameters for
   *  the expand operation (e.g. 'displayLanguage=en&activeOnly=true').
   * @return {Promise<ResourceNode|null>|null} - a ValueSet resource
   *  (https://hl7.org/fhir/valueset.html) with an expansion, or an empty
   *  value if an error occurs.
   */
  static expand(self, valueSetColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkContext(ctx, 'expand');

    if (valueSetColl.length === 1 && checkParams(params)) {
      const typeInfo = TypeInfo.fromValue(valueSetColl[0]);
      const valueSet = util.valData(valueSetColl[0]);

      if (typeInfo.is(TypeInfo.FhirUri, ctx.model) || typeInfo.is(TypeInfo.SystemString, ctx.model)) {
        response = util.fetchWithCache(
          `${self[0].terminologyUrl}/ValueSet/$expand?url=${encodeURIComponent(valueSet)}${params ? '&' + params : ''}`,
          {
            ...(ctx.signal ? {signal: ctx.signal} : {})
          }
        );
      } else if (typeInfo.is(TypeInfo.FhirValueSet, ctx.model)) {
        const parameters = [{
          "name": "valueSet",
          "resource": valueSet
        }, ...parseParams(params)];

        response = util.fetchWithCache(`${self[0].terminologyUrl}/ValueSet/$expand`, {
          method: 'POST',
          ...(ctx.signal ? {signal: ctx.signal} : {}),
          body: JSON.stringify({
            "resourceType": "Parameters",
            "parameter": parameters
          })
        });
      }
    }

    return response && response.then(obj => {
      if (obj?.resourceType === 'ValueSet') {
        return ResourceNode.makeResNode(obj, null, null, null, null, ctx.model);
      }
      throw new Error(params);
    }).catch(() => null);
  }


  /**
   * This calls the Terminology Service $lookup operation.
   * https://hl7.org/fhir/terminology-service.html#lookup
   * https://hl7.org/fhir/codesystem-operation-lookup.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} codedColl - an array that should have
   *  one element, which is either a Coding, or a resource
   *  element that is a code. CodeableConcept is not supported.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the lookup operation (e.g. 'date=2011-03-04&displayLanguage=en').
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the validation operation.
   */
  static lookup(self, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkContext(ctx, 'lookup');

    if (codedColl.length === 1 && checkParams(params)) {
      const codedTypeInfo = TypeInfo.fromValue(codedColl[0]);
      const isCoding = codedTypeInfo.is(TypeInfo.FhirCoding, ctx.model);
      const isCode = codedTypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
        codedTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isCoding || isCode) {
        const coded = util.valData(codedColl[0]);
        const codedParamName = isCoding ? 'coding' : 'code';
        const parameters = {
          resourceType: 'Parameters',
          parameter: [
            {
              name: codedParamName,
              [paramName2fieldName[codedParamName]]: coded
            },
            ...parseParams(params)
          ]
        };
        response = util.fetchWithCache(
          `${self[0].terminologyUrl}/CodeSystem/$lookup`, {
            method: "POST",
            body: JSON.stringify(parameters),
            ...(ctx.signal ? {signal: ctx.signal} : {})
          }
        );
      }
    }

    return response && response.then(obj => {
      if (obj?.resourceType === 'Parameters') {
        return ResourceNode.makeResNode(obj, null, null, null, null, ctx.model);
      }
      throw new Error(params);
    }).catch(() => null);
  }


  /**
   * This calls the Terminology Service $validate-code operation on a value set.
   * https://hl7.org/fhir/terminology-service.html#validation
   * https://hl7.org/fhir/valueset-operation-validate-code.html
   * The source code of this function is based on this script:
   * https://gist.github.com/brianpos/97e1237470d76835ea9a35bf8e021ca6#file-fhirpath-async-ts
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} valueSetColl - an array that should have
   *  one element, which is either a ResourceNode with an actual ValueSet, or
   *  a ResourceNode with a canonical URL reference to a value set, or
   *  a string with a canonical URL reference to a value set.
   *  @param {(ResourceNode|string)[]} codedColl - an array that should have
   *  one element, which is either a Coding, a CodeableConcept, or a resource
   *  element that is a code.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the validate-code operation (e.g. 'date=2011-03-04&displayLanguage=en').
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the validation operation.
   */
  static validateVS(self, valueSetColl, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkContext(ctx, 'validateVS');

    if(valueSetColl.length === 1 && codedColl.length === 1 &&
      checkParams(params)) {
      const vsTypeInfo = TypeInfo.fromValue(valueSetColl[0]);
      const isActualValueSet = vsTypeInfo.is(TypeInfo.FhirValueSet, ctx.model);
      const isValueSetUrl = vsTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        vsTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isActualValueSet || isValueSetUrl) {
        const codedTypeInfo = TypeInfo.fromValue(codedColl[0]);
        const isCodeableConcept =
          codedTypeInfo.is(TypeInfo.FhirCodeableConcept, ctx.model);
        const isCoding = codedTypeInfo.is(TypeInfo.FhirCoding, ctx.model);
        const isCode = codedTypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
          codedTypeInfo.is(TypeInfo.SystemString, ctx.model);
        if (isCodeableConcept || isCoding || isCode) {
          const valueSet = util.valData(valueSetColl[0]);
          const coded = util.valData(codedColl[0]);
          const requestUrl =
            `${self[0].terminologyUrl}/ValueSet/$validate-code`;

          if (isActualValueSet || isCodeableConcept) {
            // Workaround for the case where we don't have a system.
            // See discussion here:
            //  https://chat.fhir.org/#narrow/stream/179266-fhirpath/topic/Problem.20with.20the.20.22memberOf.22.20function.20and.20R4.20servers
            response = (isCode ?
              getSystemFromVS(ctx, self[0].terminologyUrl, valueSet)
              : Promise.resolve()).then(system => {
              const codedParamName = isCodeableConcept ?
                'codeableConcept' : isCoding ? 'coding' : 'code';
              const parameters = {
                resourceType: 'Parameters',
                parameter: [
                  {
                    name: isActualValueSet ? 'valueSet' : 'url',
                    [isActualValueSet ? 'resource' : 'valueUri']: valueSet
                  },
                  {
                    name: codedParamName,
                    [paramName2fieldName[codedParamName]]: coded
                  },
                  ...(system ? [{name: 'system', valueUri: system}] : []),
                  ...parseParams(params)
                ]
              };
              return util.fetchWithCache(
                requestUrl, {
                  method: "POST",
                  body: JSON.stringify(parameters),
                  ...(ctx.signal ? {signal: ctx.signal} : {})
                }
              );
            });
          } else  {
            if (isCode) {
              // Workaround for the case where we don't have a system.
              // See discussion here:
              //  https://chat.fhir.org/#narrow/stream/179266-fhirpath/topic/Problem.20with.20the.20.22memberOf.22.20function.20and.20R4.20servers
              response = getSystemFromVS(ctx, self[0].terminologyUrl, valueSet)
                .then((system) => {
                  const queryParams2 = new URLSearchParams({
                    url: valueSet,
                    code: coded,
                    system
                  });
                  return util.fetchWithCache(
                    `${requestUrl}?${queryParams2.toString() + (params ? '&' + params : '')}`,
                    {
                      ...(ctx.signal ? {signal: ctx.signal} : {})
                    }
                  );
                });
            } else if (isCoding) {
              const queryParams = new URLSearchParams({
                url: valueSet ?? '',
                system: coded.system ?? '',
                code: coded.code
              });
              response = util.fetchWithCache(
                `${requestUrl}?${queryParams.toString() + (params ? '&' + params : '')}`,
                {
                  ...(ctx.signal ? {signal: ctx.signal} : {})
                }
              );
            }
          }
        }
      }
    }

    return response && response.then(obj => {
      if (obj?.resourceType === 'Parameters') {
        return ResourceNode.makeResNode(obj, null, null, null, null, ctx.model);
      }
      throw new Error(obj);
    }).catch(() => null);
  }


  /**
   * This calls the Terminology Service $validate-code operation on a value set.
   * https://hl7.org/fhir/terminology-service.html#validation
   * https://hl7.org/fhir/codesystem-operation-validate-code.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} codeSystemColl - an array that should have
   *  one element, which is either a ResourceNode with an actual CodeSystem, or
   *  a ResourceNode with a canonical URL reference to a code system, or
   *  a string with a canonical URL reference to a code system.
   * @param {(ResourceNode|string)[]} codedColl - an array that should have
   *  one element, which is either a ResourceNode with a Coding,
   *  a CodeableConcept, or a code, or a string with a code.
   * @param {string} params - a URL encoded string with other parameters for
   *  the validate-code operation (e.g. 'date=2011-03-04&displayLanguage=en')
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the validation operation.
   */
  static validateCS(self, codeSystemColl, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkContext(ctx, 'validateCS');

    if(codeSystemColl.length === 1 && codedColl.length === 1 &&
      checkParams(params)) {
      const csTypeInfo = TypeInfo.fromValue(codeSystemColl[0]);
      const isActualCodeSystem =
        csTypeInfo.is(TypeInfo.FhirCodeSystem, ctx.model);
      const isCodeSystemUrl = csTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        csTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isActualCodeSystem || isCodeSystemUrl) {
        const codedTypeInfo = TypeInfo.fromValue(codedColl[0]);
        const isCodeableConcept =
          codedTypeInfo.is(TypeInfo.FhirCodeableConcept, ctx.model);
        const isCoding = codedTypeInfo.is(TypeInfo.FhirCoding, ctx.model);
        const isCode = codedTypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
          codedTypeInfo.is(TypeInfo.SystemString, ctx.model);
        if (isCodeableConcept || isCoding || isCode) {
          const codeSystem = util.valData(codeSystemColl[0]);
          const coded = util.valData(codedColl[0]);
          const requestUrl =
            `${self[0].terminologyUrl}/CodeSystem/$validate-code`;
          const codedParamName = isCodeableConcept ?
            'codeableConcept' : isCoding ? 'coding' : 'code';
          const parameters = {
            resourceType: 'Parameters',
            parameter: [
              {
                name: isActualCodeSystem ? 'codeSystem' : 'url',
                [isActualCodeSystem ? 'resource' : 'valueUri']: codeSystem
              },
              {
                name: codedParamName,
                [paramName2fieldName[codedParamName]]: coded
              },
              ...parseParams(params)
            ]
          };
          response = util.fetchWithCache(
            requestUrl, {
              method: "POST",
              body: JSON.stringify(parameters),
              ...(ctx.signal ? {signal: ctx.signal} : {})
            }
          );
        }
      }
    }

    return response && response.then(obj => {
      if (obj?.resourceType === 'Parameters') {
        return ResourceNode.makeResNode(obj, null, null, null, null, ctx.model);
      }
      throw new Error(obj);
    }).catch(() => null);
  }


  /**
   * This calls the Terminology Service $subsumes operation.
   * https://build.fhir.org/terminology-service.html#subsumes
   * https://build.fhir.org/codesystem-operation-subsumes.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} systemColl - an array that should have
   *  one element, which is either a ResourceNode with a canonical URL reference
   *  to a code system, or a string with a canonical URL reference to a code
   *  system.
   * @param {(ResourceNode|string)[]} coded1Coll - an array that should have one
   *  element, which is either a ResourceNode with a Coding, or a code, or
   *  a string with a code.
   * @param {(ResourceNode|string)[]} coded2Coll - an array that should have one
   *  element, which is either a ResourceNode with a Coding, or a code, or
   *  a string with a code.
   * @param {string} params - a URL encoded string with other parameters for
   *  the validate-code operation (e.g. 'version=2014-05-06').
   * @return {Promise<ResourceNode|null>|null} - a ResourceNode with a code as
   *  specified for the subsumes operation.
   */
  static subsumes(self, systemColl, coded1Coll, coded2Coll, params = '') {
    let response = null;
    const ctx = this;
    util.checkContext(ctx, 'subsumes');

    if(systemColl.length === 1 && coded1Coll.length === 1 &&
      coded2Coll.length === 1 && checkParams(params)) {
      const csTypeInfo = TypeInfo.fromValue(systemColl[0]);
      const isCodeSystemUrl = csTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        csTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isCodeSystemUrl) {
        const coded1TypeInfo = TypeInfo.fromValue(coded1Coll[0]);
        const coded2TypeInfo = TypeInfo.fromValue(coded2Coll[0]);
        const isCoding1 = coded1TypeInfo.is(TypeInfo.FhirCoding, ctx.model);
        const isCode1 = coded1TypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
          coded1TypeInfo.is(TypeInfo.SystemString, ctx.model);
        const isCoding2 = coded2TypeInfo.is(TypeInfo.FhirCoding, ctx.model);
        const isCode2 = coded2TypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
          coded2TypeInfo.is(TypeInfo.SystemString, ctx.model);
        if ((isCoding1 || isCode1) && (isCoding2 || isCode2)) {
          const system = util.valData(systemColl[0]);
          const coded1 = util.valData(coded1Coll[0]);
          const coded2 = util.valData(coded2Coll[0]);
          const requestUrl = `${self[0].terminologyUrl}/CodeSystem/$subsumes`;
          const coded1ParamName = isCoding1 ? 'codingA' : 'codeA';
          const coded2ParamName = isCoding1 ? 'codingB' : 'codeB';
          const coded1ValueName = isCoding2 ? 'valueCoding' : 'valueCode';
          const coded2ValueName = isCoding2 ? 'valueCoding' : 'valueCode';
          const parameters = {
            resourceType: 'Parameters',
            parameter: [
              {
                name: 'url',
                valueUri: system
              },
              {
                name: coded1ParamName,
                [coded1ValueName]: coded1
              },
              {
                name: coded2ParamName,
                [coded2ValueName]: coded2
              },
              ...parseParams(params)
            ]
          };
          response = util.fetchWithCache(
            requestUrl, {
              method: "POST",
              body: JSON.stringify(parameters),
              ...(ctx.signal ? {signal: ctx.signal} : {})
            }
          );
        }
      }
    }

    return response && response.then(obj => {
      if (obj?.resourceType === 'Parameters') {
        const code = obj.parameter?.find(p => p.name === 'outcome')?.valueCode;
        return ResourceNode.makeResNode(
          code, null, 'code', null, 'code', ctx.model);
      }
      throw new Error(obj);
    }).catch(() => null);

  }


  /**
   * This calls the Terminology Service $translate operation.
   * https://build.fhir.org/terminology-service.html#translate
   * https://build.fhir.org/conceptmap-operation-translate.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} conceptMapColl - an array that should have
   *  one element, which is either a ResourceNode with an actual ConceptMap, or
   *  a canonical URL reference to a ConceptMap, or a string with a canonical
   *  URL reference to a code system.
   * @param {ResourceNode|string} codedColl - the source to translate: an array that
   *  should have one element, which is either a ResourceNode with
   *  a CodeableConcept, a Coding, or a code, or a string with a code.
   * @param {string} params - a URL encoded string with other parameters for
   * the validate-code operation
   * (e.g. 'source=http://acme.org/valueset/23&target=http://acme.org/valueset/23')
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the translation operation.
   */
  static translate(self, conceptMapColl, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkContext(ctx, 'translate');

    if(conceptMapColl.length === 1 && codedColl.length === 1 &&
      checkParams(params)) {
      const cmTypeInfo = TypeInfo.fromValue(conceptMapColl[0]);
      const isActualConceptMap = cmTypeInfo.is(TypeInfo.FhirConceptMap,
        ctx.model);
      const isConceptMapUrl = cmTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        cmTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isActualConceptMap || isConceptMapUrl) {
        const codedTypeInfo = TypeInfo.fromValue(codedColl[0]);
        const isCodeableConcept = codedTypeInfo.is(
          TypeInfo.FhirCodeableConcept, ctx.model);
        const isCoding = codedTypeInfo.is(TypeInfo.FhirCoding, ctx.model);
        const isCode = codedTypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
          codedTypeInfo.is(TypeInfo.SystemString, ctx.model);
        if (isCoding || isCode) {
          const conceptMap = util.valData(conceptMapColl[0]);
          const coded = util.valData(codedColl[0]);
          const requestUrl = `${self[0].terminologyUrl}/CodeSystem/$translate`;
          const m = modelToTranslateSourceParamName[ctx.model.version];
          const codedParamName = isCodeableConcept ?
            m.sourceCodeableConcept : isCoding ? m.sourceCoding : m.sourceCode;
          const parameters = {
            resourceType: 'Parameters',
            parameter: [
              {
                name: isActualConceptMap ? 'conceptMap' : 'url',
                [isActualConceptMap ? 'resource' : 'valueUri']: conceptMap
              },
              {
                name: codedParamName,
                [paramName2fieldName[codedParamName]]: coded
              },
              ...parseParams(params)
            ]
          };
          response = util.fetchWithCache(
            requestUrl, {
              method: "POST",
              body: JSON.stringify(parameters),
              ...(ctx.signal ? {signal: ctx.signal} : {})
            }
          );
        }
      }
    }

    return response && response.then(obj => {
      if (obj?.resourceType === 'Parameters') {
        return ResourceNode.makeResNode(obj, null, null, null, null, ctx.model);
      }
      throw new Error(obj);
    }).catch(() => null);

  }

}


/**
 * Returns false if the params parameter is not empty and is not a valid
 * URL-encoded string, true otherwise.
 * @param {string|undefined} params - a URL encoded string with parameters
 *  (e.g. 'date=2011-03-04&displayLanguage=en').
 *  @returns {boolean} - true if the params parameter is empty or a valid.
 */
function checkParams(params) {
  return !params?.split('&').find(
    p => {
      const v = p.split('=');
      return v.length <= 2 && v.find(x =>
        encodeURIComponent(decodeURIComponent(x)) !== x);
    }
  );
}


/**
 * Returns the code system from the value set if it is the same for all items.
 * Workaround for the case where we don't have a system. See discussion here:
 *  https://chat.fhir.org/#narrow/stream/179266-fhirpath/topic/Problem.20with.20the.20.22memberOf.22.20function.20and.20R4.20servers
 *
 * @param {Object} ctx -
 * @param {Object} terminologyUrl -
 * @param {Object|string} valueSet -  either an actual ValueSet, or a canonical URL
 *  reference to a value set.
 * @return {Promise<string>} - a promise that resolves to the code system.
 */
function getSystemFromVS(ctx, terminologyUrl, valueSet) {
  const queryParams = new URLSearchParams({
    url: valueSet
  });

  return (
    typeof valueSet === 'string' ?
      util.fetchWithCache(
        `${terminologyUrl}/ValueSet?${queryParams.toString()}`,
        {
          ...(ctx.signal ? {signal: ctx.signal} : {})
        }
      ).then(
        (bundle) =>
          bundle?.entry?.length === 1 ? bundle.entry[0].resource : null
      )
      : Promise.resolve(valueSet)
  )
    .then((vs) => {
      const system = vs && (
        getSystemFromArrayItems(vs.expansion?.contains)
        || getSystemFromArrayItems(vs.compose?.include)
      );
      if (system) {
        return system;
      } else {
        throw new Error('The valueset does not have a single code system.');
      }
    });
}


/**
 * Returns the "system" property from an array of items if it is the same for all
 * items and equal to the initial value if the initial value is defined.
 * @param {Object[]|undefined} arr - array of items
 * @param {string|undefined} [system] - optional initial value
 * @return {string|undefined}
 */
function getSystemFromArrayItems(arr, system = undefined) {
  if (arr) {
    for (let i = 0; i < arr.length; ++i) {
      if (!system) {
        system = arr[i].system;
      } else if (system !== arr[i].system) {
        system = undefined;
        break;
      }
    }
  }

  return system;
}


/**
 * Parses a URL-encoded string with parameters and returns an array of objects
 * that represent the parameters for the "Parameters" FHIR resource.
 * @param {string} params
 * @returns {Object[]}
 */
function parseParams(params) {
  const parsed = [];
  params.split('&').forEach(p => {
    const [key, value] = p.split('=');
    if (key && value) {
      const name = decodeURIComponent(key);
      parsed[parsed.length] = {
        name,
        ...getParamValue(paramName2fieldName[name], decodeURIComponent(value))
      };
    }
  });
  return parsed;
}


/**
 * The mapping of the general internal search parameter names to the real search
 * parameter names for the current model.
 *
 * @type {{
 * R4: { sourceCoding: string, sourceCode: string },
 * R5: { sourceCoding: string, sourceCode: string }
 * }}
 * TODO: Should this constant be moved to the model?
 */
const modelToTranslateSourceParamName = {
  r4: {
    sourceCodeableConcept: 'codeableConcept',
    sourceCoding: 'coding',
    sourceCode: 'code'
  },
  r5: {
    sourceCodeableConcept: 'sourceCodeableConcept',
    sourceCoding: 'sourceCoding',
    sourceCode: 'sourceCode'
  }
};


/**
 * The mapping of the search parameter names to the field names in
 * the Parameters FHIR resource (https://hl7.org/fhir/parameters.html).
 * @type {Object}
 * TODO: Should this constant be moved to the model?
 */
const paramName2fieldName = {
  // Search parameters for the $expand operation:
  // https://hl7.org/fhir/valueset-operation-expand.html
  // https://hl7.org/fhir/R4/valueset-operation-expand.html
  url: 'valueUri',
  valueSet: 'ValueSet',
  valueSetVersion: 'valueString',
  context: 'valueUri',
  contextDirection: 'valueCode',
  filter: 'valueString',
  date: 'valueDateTime',
  offset: 'valueInteger',
  count: 'valueInteger',
  includeDesignations: 'valueBoolean',
  designation: 'valueString',
  includeDefinition: 'valueBoolean',
  activeOnly: 'valueBoolean',
  useSupplement: 'valueCanonical', // exist in R5 only
  excludeNested: 'valueBoolean',
  excludeNotForUI: 'valueBoolean',
  excludePostCoordinated: 'valueBoolean',
  displayLanguage: 'valueCode',
  property: 'valueString', // exist in R5 only
  'exclude-system': 'valueCanonical',
  'system-version': 'valueCanonical',
  'check-system-version': 'valueCanonical',
  'force-system-version': 'valueCanonical',

  // Search parameters for the $lookup operation:
  // https://hl7.org/fhir/codesystem-operation-lookup.html
  // https://hl7.org/fhir/R4/codesystem-operation-lookup.html
  // (some parameters are commented out because they are already described above)
  code: 'valueCode',
  system: 'valueUri',
  version: 'valueString',
  coding: 'valueCoding',
  // date: 'valueDateTime',
  // displayLanguage: 'valueCode',
  // property: 'valueCode',
  // useSupplement: 'valueCanonical', // exist in R5 only

  // Search parameters for the /ValueSet/$validate-code operation:
  // https://hl7.org/fhir/valueset-operation-validate-code.html
  // https://hl7.org/fhir/R4/valueset-operation-validate-code.html
  // (some parameters are commented out because they are already described above)
  // url: 'valueUri',
  // context: 'valueUri',
  // valueSet: 'ValueSet',
  // valueSetVersion: 'valueString',
  // code: 'valueCode',
  // system: 'valueUri',
  systemVersion: 'valueString',
  display: 'valueString',
  // coding: 'valueCoding',
  codeableConcept: 'valueCodeableConcept',
  // date: 'valueDateTime',
  abstract: 'valueBoolean',
  // displayLanguage: 'valueCode',
  // useSupplement: 'valueCanonical', // exist in R5 only

  // Search parameters for the /CodeSystem/$validate-code operation:
  // https://hl7.org/fhir/codesystem-operation-validate-code.html
  // https://hl7.org/fhir/R4/codesystem-operation-validate-code.html
  // (some parameters are commented out because they are already described above)
  // url: 'valueUri',
  codeSystem: 'CodeSystem',
  // code: 'valueCode',
  // version: 'valueString',
  // display: 'valueString',
  // coding: 'valueCoding',
  // codeableConcept: 'valueCodeableConcept',
  // date: 'valueDateTime',
  // abstract: 'valueBoolean',
  // displayLanguage: 'valueCode',

  // Search parameters for the /CodeSystem/$subsumes operation:
  // https://hl7.org/fhir/codesystem-operation-subsumes.html
  // https://hl7.org/fhir/R4/codesystem-operation-subsumes.html
  // (some parameters are commented out because they are already described above)
  codeA: 'valueCode',
  codeB: 'valueCode',
  // system: 'valueUri',
  // version: 'valueString',
  codingA: 'valueCoding',
  codingB: 'valueCoding',

  // Search parameters for the /CodeSystem/$translate operation:
  // https://hl7.org/fhir/conceptmap-operation-translate.html
  // https://hl7.org/fhir/R4/conceptmap-operation-translate.html
  // (some parameters are commented out because they are already described above)
  // url: 'valueUri',
  conceptMap: 'ConceptMap',
  conceptMapVersion: 'valueString',
  sourceCode: 'valueCode', // exist in R5 only
  // code: 'valueCode', // exist in R4 only
  // system: 'valueUri',
  // version: 'valueString',
  sourceScope: 'valueUri', // exist in R5 only
  source: 'valueUri', // exist in R4 only
  sourceCoding: 'valueCoding', // exist in R5 only
  // coding: 'valueCoding', // exist in R4 only
  sourceCodeableConcept: 'valueCodeableConcept', // exist in R5 only
  // codeableConcept: 'valueCodeableConcept', // exist in R4 only
  targetCode: 'valueCode', // exist in R5 only
  targetCoding: 'valueCoding', // exist in R5 only
  targetCodeableConcept: 'valueCodeableConcept', // exist in R5 only
  targetScope: 'valueUri', // exist in R5 only
  target: 'valueUri', // exist in R4 only
  targetSystem: 'valueUri',
  /// dependency: ???
  reverse: 'valueBoolean' // exist in R4 only
};


/**
 * Returns an object with the value[x] representing the parameter value for
 * the "Parameters" FHIR resource.
 *
 * @param {string} fieldName - The name of the value[x] field that determines
 *  the type of the value.
 * @param {string} value - a string value that may need to be converted to
 *  the appropriate data type before being placed in the value[x] field.
 * @returns {Object} - An object containing the value[x] field.
 * @throws {Error} - Throws an error if the value is not valid for the specified field name.
 */
function getParamValue(fieldName, value) {
  let paramValue = {};
  let v;
  let isTrue;
  switch (fieldName) {
    case 'valueInteger':
      v = Number(value);
      if (Number.isInteger(v)) {
        paramValue[fieldName] = parseInt(value);
      } else {
        throw new Error(`The value for "${fieldName}" should be an integer.`);
      }
      break;
    case 'valueBoolean':
      isTrue = value === 'true';
      if (isTrue || value === 'false') {
        paramValue[fieldName] = isTrue;
      } else {
        throw new Error(`The value for "${fieldName}" should be a boolean.`);
      }
      break;
    case 'valueCoding':
    case 'valueCodeableConcept':
    case 'CodeSystem':
    case 'ValueSet':
      throw new Error(`The value for "${fieldName}" is not expected to be passed via a URL encoded string with parameters.`);
    default:
      paramValue[fieldName] = value;
  }
  return paramValue;
}


module.exports = Terminologies;
