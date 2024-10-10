// Contains the supplementary FHIRPath functions defined in the Structured Data
// Capture IG, https://hl7.org/fhir/uv/sdc/expressions.html#fhirpath-supplements.

let engine = {};

/**
 * Returns numeric values from the score extension associated with the input
 * collection of Questionnaire items. See the description of the ordinal()
 * function here:
 * https://hl7.org/fhir/uv/sdc/expressions.html#fhirpath-supplements
 * @param {Array} coll - questionnaire items
 * @return {(number|Promise<number>)[]}
 */
engine.weight = function (coll) {
  if(coll !== false && ! coll) { return []; }

  const userScoreExtUrl = this.vars.scoreExt || this.processedVars.scoreExt;
  const checkExtUrl = userScoreExtUrl
    ? (e) => e.url === userScoreExtUrl
    : (e) => this.defaultScoreExts.includes(e.url);
  const res = [];

  const questionnaire = this.vars.questionnaire || this.processedVars.questionnaire?.data;
  let hasPromise = false;

  coll.forEach((elem) => {
    if (elem?.data) {
      const valueCoding = elem.fhirNodeDataType === 'Coding' ? elem.data : elem.data.valueCoding;
      let value = valueCoding;
      if (!value) {
        const prop = Object.keys(elem.data).find(p => p.length > 5 && p.startsWith('value'));
        // if we found a child value[x] property
        value = prop ?
          // we use it to get a score extension
          elem.data[prop]
          // otherwise, if the source item has a simple data type
          : elem._data?.extension ?
            // we get the extension from the adjacent property starting with
            // an underscore
            elem._data
            // otherwise we get the extension from the source item
            // (e.g. 'item' is a Coding)
            : elem.data;
      }
      const score = value?.extension?.find(checkExtUrl)?.valueDecimal;
      if (score !== undefined) {
        // if we have a score extension in the source item, use it.
        res.push(score);
      } else if (valueCoding) {
        const linkIds = getLinkIds(elem.parentResNode);
        if (linkIds.length) {
          if (questionnaire) {
            const qItem = getQItemByLinkIds(questionnaire, linkIds);
            const answerOption = qItem?.answerOption?.find(o =>
              o.valueCoding.code === valueCoding.code
              && o.valueCoding.system === valueCoding.system
            );
            if (answerOption) {
              const score = answerOption.extension?.find(checkExtUrl)?.valueDecimal;
              if (score !== undefined) {
                // if we have a score extension for the answerOption, use it.
                res.push(score);
              } else if (qItem.answerValueSet || valueCoding.system) {
                // Otherwise, check corresponding value set and code system
                hasPromise = addWeightFromCorrespondingResourcesToResult(res, this, questionnaire,
                  qItem.answerValueSet, valueCoding.code, valueCoding.system) || hasPromise;
              }
            } else if (qItem?.answerValueSet) {
              // Otherwise, check corresponding value set and code system
              hasPromise = addWeightFromCorrespondingResourcesToResult(res, this, questionnaire,
                qItem.answerValueSet, valueCoding.code, valueCoding.system) || hasPromise;
            } else {
              throw new Error(
                'Questionnaire answerOption/answerValueSet with this linkId was not found: ' +
                elem.parentResNode.data.linkId + '.');
            }
          } else {
            throw new Error('%questionnaire is needed but not specified.');
          }
        } else if (valueCoding.system) {
          // If there are no questionnaire (no linkId) check corresponding code system
          hasPromise = addWeightFromCorrespondingResourcesToResult(res, this, null,
            null, valueCoding.code, valueCoding.system) || hasPromise;
        }
      }
    }
  });

  return hasPromise ? Promise.all(res) : res;
};

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
 * Returns a score or promise of score from the cache.
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
    url + (options ? JSON.stringify(options) : '')
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
      promise: options ? fetch(url, options) : fetch(url)
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
 * @return {boolean} a flag indicating that a promise has been added to the
 *  resulting array.
 */
function addWeightFromCorrespondingResourcesToResult(res, ctx, questionnaire, vsURL, code, system) {
  let score;
  const cacheKey = [
    questionnaire?.url || questionnaire?.id, vsURL, code, system
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
          if (!containedVS.expansion) {
            score = fetchWithCache(`${getTerminologyUrl(ctx)}/ValueSet/$expand`, {
              method: 'POST',
              headers: {
                'Accept': 'application/fhir+json',
                'Content-Type': 'application/fhir+json'
              },
              body: JSON.stringify({
                "resourceType": "Parameters",
                "parameter": [{
                  "name": "valueSet",
                  "resource": containedVS
                }, {
                  "name": "property",
                  "valueString": "itemWeight"
                }]
              })
            })
              .then(r => r.ok ? r.json() : Promise.reject(r.json()))
              .then((terminologyVS) => {
                return getItemWeightFromProperty(
                  getValueSetItem(terminologyVS.expansion?.contains, code, system)
                );
              });
          } else {
            score = getItemWeightFromProperty(
              getValueSetItem(containedVS.expansion.contains, code, system)
            );
          }
        } else {
          score = fetchWithCache(`${getTerminologyUrl(ctx)}/ValueSet/$expand?` + new URLSearchParams({
            url: vsURL,
            property: 'itemWeight'
          }, {
            headers: {
              'Accept': 'application/fhir+json'
            }
          }).toString())
            .then(r => r.ok ? r.json() : Promise.reject(r.json()))
            .then((terminologyVS) => {
              return getItemWeightFromProperty(
                getValueSetItem(terminologyVS?.expansion?.contains, code, system)
              );
            });
        }
      } // end if (vsURL)

      if (system) {
        if (score === undefined) {
          const contextResource = ctx.processedVars.context?.[0].data || ctx.vars.context?.[0];
          const isCodeSystem = (r) => r.url === system && r.resourceType === 'CodeSystem';
          const containedCS = contextResource?.contained?.find(isCodeSystem)
            || questionnaire?.contained?.find(isCodeSystem);

          if (containedCS) {
            score = getItemWeightFromProperty(
              getCodeSystemItem(containedCS?.concept, code)
            );
          } else {
            score = getWeightFromTerminologyCodeSet(ctx, code, system);
          }
        } else if (score instanceof Promise) {
          score = score.then(weightFromVS => {
            if (weightFromVS !== undefined) {
              return weightFromVS;
            }
            return getWeightFromTerminologyCodeSet(ctx, code, system);
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
 * Returns the promised score value from the code system obtained from the
 * terminology server.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @return {Promise<number|undefined>}
 */
function getWeightFromTerminologyCodeSet(ctx, code, system) {
  return fetchWithCache(`${getTerminologyUrl(ctx)}/CodeSystem/$lookup?` + new URLSearchParams({
    code, system, property: 'itemWeight'
  }, {
    headers: {
      'Accept': 'application/fhir+json'
    }
  }).toString())
    .then(r => r.ok ? r.json() : Promise.reject(r.json()))
    .then((parameters) => {
      return parameters.parameter
        .find(p => p.name === 'property'&& p.part
          .find(part => part.name === 'code' && part.valueCode === 'itemWeight'))
        ?.part?.find(p => p.name === 'value')?.valueDecimal;
    });
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
 * Returns the value of the itemWeight property from a value set item.
 * @param {Object} item - a value set item.
 * @return {number | undefined}
 */
function getItemWeightFromProperty(item) {
  return item?.property?.find(p => p.code === 'itemWeight')?.valueDecimal;
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
 * Returns a questionnaire item based on the linkIds array of the ancestor
 * ResourceNodes and the target ResourceNode. If the questionnaire item is not
 * found, it returns null.
 * @param {Object} questionnaire - object with a Questionnaire resource.
 * @param {string[]} linkIds - array of linkIds starting with the linkId of the
 * target node and ending with the topmost item's linkId.
 * @return {Object | null}
 */
function getQItemByLinkIds(questionnaire, linkIds) {
  let currentNode = questionnaire;
  for(let i = linkIds.length-1; i >= 0; --i) {
    currentNode = currentNode.item?.find(o => o.linkId === linkIds[i]);
    if (!currentNode) {
      return null;
    }
  }
  return currentNode;
}

module.exports = engine;
