// Contains the supplementary FHIRPath functions defined in the Structured Data
// Capture IG, https://hl7.org/fhir/uv/sdc/expressions.html#fhirpath-supplements.

let engine = {};


/**
 * Maximum number of codes to load when loading a paginated value set.
 * @type {number}
 */
const MAX_VS_CODES = 500;


/**
 * Returns numeric values from the score extension associated with the input
 * collection of resource nodes (e.g. QuestionnaireResponse items).
 *
 * Currently, when searching for a score extension, we respect the "Context of
 * Use" for each possible extension used to store a score:
 *   * https://www.hl7.org/fhir/extensions/StructureDefinition-itemWeight.html
 *   * https://build.fhir.org/ig/HL7/fhir-extensions/StructureDefinition-itemWeight.html
 *   * https://www.hl7.org/fhir/codesystem-concept-properties.html
 *   * https://www.hl7.org/fhir/R4/extension-ordinalvalue.html
 *   * https://www.hl7.org/fhir/stu3/extension-questionnaire-ordinalvalue.html
 *   * https://www.hl7.org/fhir/stu3/extension-valueset-ordinalvalue.html
 *   * https://hl7.org/fhir/STU3/extension-iso21090-co-value.html
 *   * https://hl7.org/fhir/DSTU2/questionnaire.html#4.26.5.9
 *   * https://hl7.org/fhir/DSTU2/extension-iso21090-co-value.html
 *   * https://hl7.org/fhir/DSTU2/extension-valueset-ordinalvalue.html
 *
 * Also, according to this spec
 * https://hl7.org/fhir/uv/sdc/expressions.html#fhirpath-supplements, we expect
 * a score extension for "code or Coding" (we don't support scores for all
 * possible [x] in value[x]).
 *
 * We search for the first score extension for each source node to add its value
 * to the result in the following order:
 * 1. Check the source node for a score extension.
 * 2. If the source node is an answer from a `QuestionnaireResponse`, check the
 *    `valueCoding` child element for a score extension.
 * 3. If the source node is an answer from a `QuestionnaireResponse` or its
 *    `valueCoding`:
 *     - Check the corresponding `Questionnaire` answer option for a score
 *       extension.
 *     - If the `Questionnaire` answer option references a contained `ValueSet`,
 *       check the corresponding element there for a score extension.
 *     - For STU3 and DSTU2, look for the score extension in the `ValueSet`
 *       loaded from the terminology server.
 * 4. If the source resource (to which the source node belongs, e.g.
 *    `QuestionnaireResponse`) or `Questionnaire` contains a corresponding
 *    `CodeSystem`, check for a score extension there.
 * 5. Look for a score extension in the corresponding 'CodeSystem` loaded from
 *    the terminology server.
 * @param {Array} coll - resource nodes
 * @return {(number|Promise<number>)[]}
 */
engine.weight = function (coll) {
  if(coll !== false && ! coll) { return []; }

  const res = [];
  const ctx = this;

  const questionnaire = this.vars.questionnaire || this.processedVars.questionnaire?.data;
  let hasPromise = false;

  coll.forEach((elem) => {
    if (elem?.data) {
      const {score: embeddedScore, isQuestionnaireResponse, valueCoding} =
        getResourceNodeInfo(ctx, elem);
      if (embeddedScore !== undefined) {
        // if we have a score extension in the source item, use it.
        res.push(embeddedScore);
      } else if (valueCoding) {
        if (isQuestionnaireResponse) {
          const linkIds = getLinkIds(elem.parentResNode);
          if (questionnaire) {
            const qItem = getQItemByLinkIds(ctx.model?.version,questionnaire, linkIds);
            if (qItem) {
              const qItemInfo = getQuestionnaireItemInfo(ctx, qItem, valueCoding);
              if (qItemInfo.score !== undefined) {
                // if we have a score extension for the answerOption, use it.
                res.push(qItemInfo.score);
              } else if (qItemInfo.answerOption && valueCoding.system || qItemInfo.answerValueSet) {
                // Otherwise, check corresponding value set and code system
                hasPromise = addWeightFromCorrespondingResourcesToResult(res, ctx,
                  questionnaire, qItemInfo.answerValueSet, valueCoding.code,
                  valueCoding.system, elem) || hasPromise;
              } else {
                throw new Error(
                  'Questionnaire answer options (or value set) with this linkId were not found: ' +
                  elem.parentResNode.data.linkId + '.');
              }
            } else {
              throw new Error(
                'Questionnaire item with this linkId were not found: ' +
                elem.parentResNode.data.linkId + '.');
            }
          } else {
            throw new Error('%questionnaire is needed but not specified.');
          }
        } else if (valueCoding.system) {
          // If there are no questionnaire (no linkId) check corresponding code system
          hasPromise = addWeightFromCorrespondingResourcesToResult(res, ctx, null,
            null, valueCoding.code, valueCoding.system, elem) || hasPromise;
        }
      }
    }
  });

  return hasPromise ? Promise.all(res) : res;
};


/**
 * Returns the score extension value for the specified ResourceNode, a flag
 * indicating that the ResourceNode belongs to an answer in the
 * QuestionnaireResponse, and the Coding element value that can be used to
 * further search for the score if the score extension is not embedded in the
 * node.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {ResourceNode} rNode - resource node.
 * @returns {{
 *   score: (number|undefined),
 *   isQuestionnaireResponse: (true|false|undefined),
 *   valueCoding: (Object|undefined)
 *   }}
 */
function getResourceNodeInfo(ctx, rNode) {
  let result;
  switch(rNode.path) {
    case 'Coding':
      if (ctx.model.version === 'stu3' &&
        rNode.parentResNode?.path === 'Questionnaire.item.option') {
        // STU3 has a different extension for "Questionnaire.item.option.valueCoding"
        result = {
          score:
            getScoreExtensionValue(rNode.data, ctx.model.score.extension.questionnaire),
          valueCoding: rNode.data
        };
      } else {
        result = {
          score:
            getScoreExtensionValue(rNode.data, ctx.model.score.extension.coding),
          isQuestionnaireResponse:
            rNode.parentResNode?.path === 'QuestionnaireResponse.item.answer' ||
            rNode.parentResNode?.path === 'QuestionnaireResponse.group.question.answer',
          valueCoding: rNode.data
        };
      }
      break;
    case 'Questionnaire.item.answerOption':
      result = {
        score:
          getScoreExtensionValue(
            ctx.model.version === 'stu3' ?
              rNode.data?.valueCoding : rNode.data,
            ctx.model.score.extension.questionnaire
          ) ||
          getScoreExtensionValue(rNode.data?.valueCoding, ctx.model.score.extension.coding),
        valueCoding: rNode.data?.valueCoding
      };
      break;
    case 'QuestionnaireResponse.group.question.answer':
      result = {
        score:
          getScoreExtensionValue(rNode.data?.valueCoding, ctx.model.score.extension.coding),
        isQuestionnaireResponse: true,
        valueCoding: rNode.data?.valueCoding,
      };
      break;
    case 'QuestionnaireResponse.item.answer':
      result = {
        score:
          getScoreExtensionValue(rNode.data, ctx.model.score.extension.questionnaireResponse) ||
          getScoreExtensionValue(rNode.data?.valueCoding, ctx.model.score.extension.coding),
        isQuestionnaireResponse: true,
        valueCoding: rNode.data?.valueCoding,
      };
      break;
    case 'ValueSet.compose.include.concept':
      result = {
        score: getScoreExtensionValue(rNode.data, ctx.model.score.extension.valueSetInclude),
        valueCoding: rNode.data
      };
      break;
    case 'ValueSet.expansion.contains':
      result = {
        score: getScoreExtensionValue(rNode.data, ctx.model.score.extension.valueSetExpansion),
        valueCoding: rNode.data
      };
      break;
    case 'ValueSet.codeSystem.concept':
      result = {
        score: getScoreExtensionValue(rNode.data, ctx.model.score.extension.valueSetCodeSystem),
        valueCoding: rNode.data
      };
      break;
    case 'CodeSystem.concept':
      result = {
        score: getScoreExtensionValue(rNode.data, ctx.model.score.extension.codeSystem),
        valueCoding: rNode.data
      };
      break;
    default:
      // Do nothing for unsupported elements
      result = {};
  }
  return result;
}


/**
 * Returns the value of the score extension from the specified node data.
 * @param {Object|undefined} nodeData - node data.
 * @param {string|undefined} extension - score extension URL.
 * @returns {number|undefined}
 */
function getScoreExtensionValue(nodeData, extension) {
  return extension && nodeData?.extension?.find(
    (i) => i.url === extension
  )?.valueDecimal;
}


/**
 * Returns the score extension value for the specified questionnaire item,
 * the answer option that matches specified Coding element value,
 * and a value set URL specified in the Questionnaire item.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {Object} qItem - questionnaire item.
 * @param {Object|undefined} valueCoding - Coding element value.
 * @returns {{
 *   score: number | undefined,
 *   answerOption: Object | undefined,
 *   answerValueSet: string
 *   }}
 */
function getQuestionnaireItemInfo(ctx, qItem, valueCoding) {
  // There are different formats of answer options in the R5/R4/STU3/DSTU2
  // questionnaires.
  let score;
  let answerOption;
  let answerValueSet;
  if (ctx.model.version === 'r5' || ctx.model.version === 'r4') {
    answerOption = qItem?.answerOption?.find(o =>
      o.valueCoding?.code === valueCoding.code
      && o.valueCoding?.system === valueCoding.system
    );
    score =
      getScoreExtensionValue(answerOption, ctx.model.score.extension.questionnaire) ||
      getScoreExtensionValue(answerOption?.valueCoding, ctx.model.score.extension.coding);
    answerValueSet = qItem?.answerValueSet;
  } else if (ctx.model.version === 'stu3') {
    answerOption = qItem?.option?.find(o =>
      o.valueCoding?.code === valueCoding.code
      && o.valueCoding?.system === valueCoding.system
    );
    score =
      getScoreExtensionValue(answerOption?.valueCoding, ctx.model.score.extension.questionnaire);
    answerValueSet = qItem?.options?.reference;
  } else {
    // DSTU2
    answerOption = qItem?.option?.find(o =>
      o.code === valueCoding.code
      && o.system === valueCoding.system
    );
    answerValueSet = qItem?.options?.reference;
  }
  return {score, answerOption, answerValueSet};
}


// Object for storing received scores
const weightCache = {};
// Object for storing fetch promises.
const requestCache = {};
// Duration of data storage in cache.
const cacheStorageTime = 3600000; // 1 hour = 60 * 60 * 1000


/**
 * Caches score.
 * @param {string} key - key to store score in cache.
 * @param {number|Promise} value - value of score or promise of value.
 */
function putScoreToCache(key, value) {
  weightCache[key] = {
    timestamp: Date.now(),
    value
  };
}


/**
 * Checks if there is an unexpired score in the cache.
 * @param {string} key - key to store score in cache.
 * @return {boolean|undefined}
 */
function hasScoreInCache(key) {
  return weightCache[key] && Date.now() - weightCache[key].timestamp < cacheStorageTime;
}


/**
 * Returns a score or promise of score from the cache. Does not check the
 * expiration time. {@link hasScoreInCache} should be called before this
 * function.
 * @param {string} key - key to store score in cache.
 * @return {number | Promise}
 */
function getScoreFromCache(key) {
  return weightCache[key].value;
}


/**
 * fetch() wrapper for caching server responses.
 * @param {string} url - a URL of the resource you want to fetch.
 * @param {object} [options] - optional object containing any custom settings
 *  that you want to apply to the request.
 * @return {Promise}
 */
function fetchWithCache(url, options) {
  const requestKey = [
    url, options ? JSON.stringify(options) : ''
  ].join('|');

  const timestamp = Date.now();
  for (const key in requestCache) {
    if (timestamp - requestCache[key].timestamp > cacheStorageTime) {
      // Remove responses older than an hour
      delete requestCache[key];
    }
  }

  if (!requestCache[requestKey]) {
    requestCache[requestKey] = {
      timestamp,
      // In Jest unit tests, a promise returned by 'fetch' is not an instance of
      // Promise that we have in our application context, so we use Promise.resolve
      // to do the conversion.
      promise: Promise.resolve(options ? fetch(url, options) : fetch(url))
    };
  }

  return requestCache[requestKey].promise;
}


/**
 * Adds the value of score or its promise received from a corresponding value
 * set or code system to the result array.
 * @param {Array} res - result array.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {Object} questionnaire - object containing questionnaire resource data
 * @param {string} vsURL - value set URL specified in the Questionnaire item.
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @param {ResourceNode|any} elem - source collection item for which we obtain
 *  the score value.
 * @return {boolean} a flag indicating that a promise has been added to the
 *  resulting array.
 */
function addWeightFromCorrespondingResourcesToResult(res, ctx, questionnaire,
  vsURL, code, system, elem) {
  let score;
  const modelVersion = ctx.model?.version;
  const cacheKey = [
    modelVersion,
    questionnaire?.url || questionnaire?.id,
    vsURL, code, system
  ].join('|');

  if (hasScoreInCache(cacheKey)) {
    score =  getScoreFromCache(cacheKey);
  } else {
    if (code) {
      if (vsURL) {
        const vsId = /^#(.*)/.test(vsURL) ? RegExp.$1 : null;
        const isAnswerValueSet = vsId
          ? (r) => r.id === vsId && r.resourceType === 'ValueSet'
          : (r) => r.url === vsURL && r.resourceType === 'ValueSet';

        const containedVS = questionnaire?.contained?.find(isAnswerValueSet);

        if (containedVS) {
          score = getWeightFromVS(ctx, containedVS, code, system);
          if (score === null && !containedVS.expansion &&
            ctx.model?.score.extension.valueSetExpansion) {
            score = getWeightFromExpandedContainedVS(ctx, containedVS, code,
              system);
          }
        } else if (vsId) {
          throw new Error(
            `Cannot find a contained value set with id: ` + vsId + '.');
        } else if (ctx.model?.score.extension.valueSetExpansion) {
          score = getWeightFromTerminologyVS(ctx, vsURL, code, system);
        }
      } // end if (vsURL)

      if (system && (ctx.model?.score.property || ctx.model?.score.extension.codeSystem)) {
        if (score === undefined || score === null) {
          score = getWeightFromCS(ctx, questionnaire, elem, code, system);
        } else if (score instanceof Promise) {
          score = score.then(weightFromVS => {
            if (weightFromVS !== undefined && weightFromVS !== null) {
              return weightFromVS;
            }
            return getWeightFromCS(ctx, questionnaire, elem, code, system);
          });
        }
      }
    }

    putScoreToCache(cacheKey, score);
  }

  if (score !== undefined) {
    res.push(score);
  }

  return score instanceof Promise;
}


/**
 * Returns a promise to return a score value from the expanded contained value
 * set obtained from the terminology server.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {string} containedVS - contained value set.
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @param {number} offset - Paging support - where to start if a subset is
 *  desired (default = 0). Offset is number of records (not number of pages).
 *  Paging only applies to flat expansions - servers ignore paging if the
 *  expansion is not flat (I think if the server doesn't return the
 *  "ValueSet.expansion.offset" field, it means there is no paging for the
 *  ValueSet).
 * @returns {Promise<number|undefined>}
 */
function getWeightFromExpandedContainedVS(ctx, containedVS, code, system, offset = 0) {
  const parameters = [{
    "name": "valueSet",
    "resource": containedVS
  }];
  if (offset) {
    parameters.push({
      "name": "offset",
      "valueInteger": offset
    });
  }
  parameters.push({
    "name": "count",
    "valueInteger": MAX_VS_CODES
  });
  return  fetchWithCache(`${getTerminologyUrl(ctx)}/ValueSet/$expand`, {
    method: 'POST',
    headers: {
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify({
      "resourceType": "Parameters",
      "parameter": parameters
    })
  })
    .then(r => r.ok ? r.json() : Promise.reject(r.json()))
    .then((terminologyVS) => {
      let score = getWeightFromVS(ctx, terminologyVS, code,
        system);
      if (score === null) {
        if (terminologyVS?.expansion?.offset === offset) {
          const newOffset = terminologyVS?.expansion?.offset +
            terminologyVS?.expansion?.contains?.length;
          if (newOffset < MAX_VS_CODES && newOffset < terminologyVS?.expansion?.total) {
            return getWeightFromExpandedContainedVS(ctx, containedVS, code, system, newOffset);
          }
        }
        score = undefined;
      }
      return score;
    });
}


/**
 * Returns a promise to return a score value from the value set obtained from
 * the terminology server.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {string} vsURL - value set URL specified in the Questionnaire item.
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @param {number} offset - Paging support - where to start if a subset is
 *  desired (default = 0). Offset is number of records (not number of pages).
 *  Paging only applies to flat expansions - servers ignore paging if the
 *  expansion is not flat (I think if the server doesn't return the
 *  "ValueSet.expansion.offset" field, it means there is no paging for the
 *  ValueSet).
 * @returns {Promise<number|undefined>}
 */
function getWeightFromTerminologyVS(ctx, vsURL, code, system, offset = 0) {
  const parameters = ctx.model?.version === 'dstu2' ?
    {identifier: vsURL} : { url: vsURL };
  if (offset) {
    parameters.offset = offset;
  }
  parameters.count = MAX_VS_CODES;
  return fetchWithCache(`${getTerminologyUrl(ctx)}/ValueSet/$expand?` +
    new URLSearchParams(parameters).toString(), {
    headers: {
      'Accept': 'application/fhir+json'
    }
  })
    .then(r => r.ok ? r.json() : Promise.reject(r.json()))
    .then((terminologyVS) => {
      const score = getWeightFromVS(ctx, terminologyVS,
        code, system);
      if (score === null) {
        if (terminologyVS?.expansion?.offset === offset) {
          const newOffset = terminologyVS?.expansion?.offset +
            terminologyVS?.expansion?.contains?.length;
          if (newOffset < MAX_VS_CODES &&  newOffset < terminologyVS?.expansion?.total) {
            return getWeightFromTerminologyVS(ctx, vsURL, code, system, newOffset);
          }
        }
        return undefined;
      }
      return score;
    });
}


/**
 * Returns the value (or its promise) of the itemWeight property or score
 * extension for the specified system and code from a CodeSystem.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function). * @param ctx
 * @param {Object} questionnaire - object containing questionnaire resource data
 * @param {ResourceNode|any} elem - source collection item for which we obtain
 *  the score value.
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @return {number|undefined|Promise<number|undefined>}
 */
function getWeightFromCS(ctx, questionnaire, elem, code, system) {
  const isCodeSystem = (r) => r.url === system && r.resourceType === 'CodeSystem';
  const containedCS = getContainedResources(elem)?.find(isCodeSystem)
    || questionnaire?.contained?.find(isCodeSystem);
  let score;

  if (containedCS) {
    const scorePropertyUri = ctx.model?.score.property?.uri;
    if (scorePropertyUri) {
      const scorePropertyCode = getPropertyCode(containedCS?.property, scorePropertyUri);
      if (scorePropertyCode) {
        const item = getCodeSystemItem(containedCS?.concept, code);
        score = getDecimalPropertyValue(item, scorePropertyCode);
      }
    } else {
      const codeSystemExt = ctx.model?.score.extension.codeSystem;
      if (codeSystemExt) {
        const item = getCodeSystemItem(containedCS?.concept, code);
        score = getScoreExtensionValue(item, codeSystemExt);
      }
    }
  } else {
    score = getWeightFromTerminologyCodeSet(ctx, code, system);
  }

  return score;
}


/**
 * Returns a promise to return a score value from the code system obtained from
 * the terminology server.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @return {Promise<number|undefined>}
 */
function getWeightFromTerminologyCodeSet(ctx, code, system) {
  const scorePropertyUri = ctx.model?.score.property?.uri;
  const codeSystemExt = ctx.model?.score.extension.codeSystem;

  if (scorePropertyUri || codeSystemExt) {
    const terminologyUrl = getTerminologyUrl(ctx);
    return fetchWithCache(`${terminologyUrl}/CodeSystem?` + new URLSearchParams({
      url: system,
      ...(scorePropertyUri ? {_elements: 'property'}: {})
    }).toString(), {
      headers: {
        'Accept': 'application/fhir+json'
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.json()))
      .then(bundle => {
        if (scorePropertyUri) {
          const scorePropertyCode = getPropertyCode(bundle?.entry?.[0]?.resource?.property, scorePropertyUri);
          if (scorePropertyCode) {
            return fetchWithCache(`${terminologyUrl}/CodeSystem/$lookup?` + new URLSearchParams({
              code, system, property: scorePropertyCode
            }).toString(), {
              headers: {
                'Accept': 'application/fhir+json'
              }
            })
              .then(r => r.ok ? r.json() : Promise.reject(r.json()))
              .then((parameters) => {
                return parameters.parameter
                  .find(p => p.name === 'property' && p.part
                    .find(part => part.name === 'code' && part.valueCode === scorePropertyCode))
                  ?.part?.find(p => p.name === 'value')?.valueDecimal;
              });
          }
        } else {
          const item = getCodeSystemItem(bundle?.entry?.[0]?.resource.concept, code);
          return getScoreExtensionValue(item, codeSystemExt);
        }
      });
  }
}


/**
 * Returns the URL of the terminology server.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @return {string}
 */
function getTerminologyUrl(ctx) {
  if (!ctx.async) {
    throw new Error('The asynchronous function "weight"/"ordinal" is not allowed. ' +
      'To enable asynchronous functions, use the async=true or async="always"' +
      ' option.');
  }

  const terminologyUrl = ctx.processedVars.terminologies?.terminologyUrl;
  if (!terminologyUrl) {
    throw new Error('Option "terminologyUrl" is not specified.');
  }

  return terminologyUrl;
}


/**
 * Returns an item from "ValueSet.expansion.contains" that has the specified
 * code and system.
 * @param {Array<Object>} contains - value of "ValueSet.expansion.contains".
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @return {Object| undefined}
 */
function getValueSetItem(contains, code, system) {
  let result;
  if (contains) {
    for(let i = 0; i < contains.length && !result; i++) {
      const item = contains[i];
      if (item.code === code && item.system === system) {
        result = item;
      } else {
        result = getValueSetItem(item.contains, code, system);
      }
    }
  }
  return result;
}


/**
 * Returns an item from "CodeSystem.concept" that has the specified code.
 * @param {Array<Object>} concept - value of "CodeSystem.concept".
 * @param {string} code - symbol in syntax defined by the system.
 * @return {Object| undefined}
 */
function getCodeSystemItem(concept, code) {
  let result;
  if (concept) {
    for(let i = 0; i < concept.length && !result; i++) {
      const item = concept[i];
      if (item.code === code) {
        result = item;
      } else if (item.concept) {
        result = getCodeSystemItem(item.concept, code);
      }
    }
  }
  return result;
}


/**
 * Returns  a property code from the array with additional information
 * supplied about each concept by its URI.
 * @param {Object} properties - ValueSet.expansion.property or
 *  CodeSystem.property.
 *  @param {string} uri - property URI.
 * @return {boolean}
 */
function getPropertyCode(properties, uri) {
  return properties?.find(p => p.uri === uri)?.code;
}


/**
 * Returns the decimal value of a property from a value set item or code
 * system concept item by its code.
 * @param {Object} item - an item from a ValueSet.expansion.contains or
 *  CodeSystem.concept.
 * @param {Object} code - property code.
 * @return {number | undefined}
 */
function getDecimalPropertyValue(item, code) {
  return item?.property?.find(p => p.code === code)?.valueDecimal;
}


/**
 * Returns the value of the itemWeight property or score extension for the
 * specified system and code from a value set. If the item in the value set has
 * no score, undefined is returned. If the item does not exist, null is returned.
 * The difference between null and undefined values may be used in paging.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {Object} vs - ValueSet.
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @return {number|undefined}
 */
function getWeightFromVS(ctx, vs, code, system) {
  let score;
  let item;
  const scorePropertyUri = ctx.model?.score.property?.uri;
  if (scorePropertyUri) {
    // "ValueSet.expansion.contains" for R5
    const scorePropertyCode = getPropertyCode(
      vs.expansion?.property, scorePropertyUri
    );
    if (scorePropertyCode) {
      item = getValueSetItem(vs.expansion?.contains, code, system);
      score = getDecimalPropertyValue(item, scorePropertyCode);
    }
  } else {
    // "ValueSet.expansion.contains" for STU3 and DSTU2
    const expansionExt = ctx.model?.score.extension.valueSetExpansion;
    if (expansionExt && vs.expansion) {
      item = getValueSetItem(vs.expansion?.contains, code, system);
      score = getScoreExtensionValue(item, expansionExt);
    } else {
      // "ValueSet.compose.include.concept" for R4, STU3, and DSTU2
      const includeExt = ctx.model?.score.extension.valueSetInclude;
      if (includeExt) {
        const include = vs.compose?.include;
        const len = include?.length;
        for (let i = 0; i < len && !item; ++i) {
          if (include[i].system === system) {
            item = getCodeSystemItem(include[i].concept, code);
          }
        }
        score = getScoreExtensionValue(item, includeExt);
      }

      // "ValueSet.codeSystem.concept" for DSTU2
      const codeSystemExt = ctx.model?.score.extension.valueSetCodeSystem;
      if (!item && codeSystemExt && vs.codeSystem?.system === system) {
        item = getCodeSystemItem(vs.codeSystem?.concept, code);
        score = getScoreExtensionValue(item, codeSystemExt);
      }
    }
  }

  return item ? score : null;
}


/**
 * Returns array of linkIds of ancestor ResourceNodes and source ResourceNode
 * starting with the linkId of the given node and ending with the topmost item's
 * linkId.
 * @param {ResourceNode} node - source ResourceNode.
 * @return {String[]}
 */
function getLinkIds(node) {
  const res = [];

  while (node.data?.linkId) {
    res.push(node.data.linkId);
    node = node.parentResNode;
  }

  return res;
}


/**
 * Returns the "contained" property of the resource to which the ResourceNode
 * belongs, or an undefined value if not a ResourceNode was passed or if there
 * is no contained property.
 * @param {ResourceNode|any} node - source ResourceNode or something else.
 * @return {Object[]|undefined}
 */
function getContainedResources(node) {
  while (node) {
    if (node.data?.resourceType && node.data?.contained) {
      return node.data?.contained;
    }
    node = node.parentResNode;
  }
}


/**
 * Mapping questionnaires to "linkIds" keys mapped to questionnaire items.
 * It is used to cache the result in the getQItemByLinkIds function.
 * @type {WeakMap<WeakKey, Object>}
 */
const questionnaire2linkIds = new WeakMap();


/**
 * Returns a questionnaire item based on the linkIds array of the ancestor
 * ResourceNodes and the target ResourceNode. If the questionnaire item is not
 * found, it returns null.
 * @param {string} modelVersion - model version: 'r5', 'r4', 'stu3', or 'dstu2'.
 * @param {Object} questionnaire - object with a Questionnaire resource.
 * @param {string[]} linkIds - array of linkIds starting with the linkId of the
 * target node and ending with the topmost known item's linkId.
 * @return {Object | null}
 */
function getQItemByLinkIds(modelVersion, questionnaire, linkIds) {
  let currentNode;
  // Mapping "linkIds" keys to questionnaire items.
  let linkIds2items;
  // "linkIds" key.
  const linkIdsKey = linkIds.join('|');

  // Get the mapping of "linkIds" keys to questionnaire items for the current
  // questionnaire, or create it if it doesn't exist.
  if (questionnaire2linkIds.has(questionnaire)) {
    linkIds2items = questionnaire2linkIds.get(questionnaire);
    currentNode =  linkIds2items[linkIdsKey];
  } else {
    linkIds2items = {};
    questionnaire2linkIds.set(questionnaire, linkIds2items);
  }

  // We use "hasOwnProperty" because we also cache undefined results for scores.
  if (!Object.prototype.hasOwnProperty.call(linkIds2items, linkIdsKey)) {
    // If the result is not cached yet, we search for the questionnaire item.
    const topLinkId = linkIds[linkIds.length - 1];

    if (modelVersion === 'dstu2') {
      // Search for an item in a questionnaire specified in DSTU2 format.
      let collection = questionnaire.group;

      // Find the questionnaire item that matches the linkId of the topmost
      // known item.
      while (collection?.length > 0) {
        currentNode = collection.find(o => o.linkId === topLinkId);
        if (currentNode) {
          break;
        } else {
          collection = [].concat(...collection.map(i => [].concat(i.question || [], i.group || [])));
        }
      }

      // Getting a questionnaire item relative to the topmost known item using
      // subsequent linkIds.
      for (let i = linkIds.length - 2; i >= 0 && currentNode; --i) {
        currentNode = currentNode.question?.find(o => o.linkId === linkIds[i]) ||
          currentNode.group?.find(o => o.linkId === linkIds[i]);
      }

    } else {
      // Search for an item in a questionnaire specified in STU3, R4 or R5
      // format.
      let collection = questionnaire.item;

      // Find the questionnaire item that matches the linkId of the topmost
      // known item.
      while (collection?.length > 0) {
        currentNode = collection.find(o => o.linkId === topLinkId);
        if (currentNode) {
          break;
        } else {
          collection = [].concat(...collection.map(i => i.item || []));
        }
      }

      // Getting a questionnaire item relative to the topmost known item using
      // subsequent linkIds.
      for (let i = linkIds.length - 2; i >= 0 && currentNode; --i) {
        currentNode = currentNode.item?.find(o => o.linkId === linkIds[i]);
      }
    }

    linkIds2items[linkIdsKey] = currentNode;
  }

  return currentNode;
}


module.exports = engine;
