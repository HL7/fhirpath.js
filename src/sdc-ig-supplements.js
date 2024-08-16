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

  coll.forEach((item) => {
    if (item?.data) {
      const valueCoding = item.fhirNodeDataType === 'Coding' ? item.data : item.data.valueCoding;
      let value = valueCoding;
      if (!value) {
        const prop = Object.keys(item.data).find(p => p.length > 5 && p.startsWith('value'));
        // if we found a child value[x] property
        value = prop
          // we use it to get a score extension
          ? item.data[prop]
          // otherwise, if the source item has a simple data type
          : item._data?.extension
            // we get the extension from the adjacent property starting with
            // an underscore
            ? item._data
            // otherwise we get the extension from the source item
            // (e.g. 'item' is a Coding)
            : item.data;
      }
      const score = value?.extension?.find(checkExtUrl)?.valueDecimal;
      if (score !== undefined) {
        // if we have a score extension in the source item, use it.
        res.push(score);
      } else if (valueCoding) {
        const linkIds = getLinkIds(item.parentResNode);
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
                const score = getWeightFromCorrespondingResources(this, questionnaire,
                  qItem.answerValueSet, valueCoding.code, valueCoding.system);
                if (score !== undefined) {
                  res.push(score);
                }
                hasPromise = hasPromise || score instanceof Promise;
              }
            } else if (qItem?.answerValueSet) {
              // Otherwise, check corresponding value set and code system
              const score = getWeightFromCorrespondingResources(this, questionnaire,
                qItem.answerValueSet, valueCoding.code, valueCoding.system);
              if (score !== undefined) {
                res.push(score);
              }
              hasPromise = hasPromise || score instanceof Promise;
            } else {
              throw new Error(
                'Questionnaire answerOption/answerValueSet with this linkId was not found: ' +
                item.parentResNode.data.linkId + '.');
            }
          } else {
            throw new Error('%questionnaire is needed but not specified.');
          }
        } else if (valueCoding.system) {
          // If there are no questionnaire (no linkId) check corresponding code system
          const score = getWeightFromCorrespondingResources(this, null,
            null, valueCoding.code, valueCoding.system);
          if (score !== undefined) {
            res.push(score);
          }
          hasPromise = hasPromise || score instanceof Promise;
        }
      }
    }
  });

  return hasPromise ? Promise.all(res) : res;
};


/**
 * Returns the value of score or its promise received from a corresponding value
 * set or code system.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {Object} questionnaire - object containing questionnaire resource data
 * @param {string} vsURL - value set URL specified in the Questionnaire item.
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @return {number|undefined|Promise<number|undefined>}
 */
function getWeightFromCorrespondingResources(ctx, questionnaire, vsURL, code, system) {
  let result;

  if (code) {
    const contextResource = ctx.processedVars.context?.[0].data || ctx.vars.context?.[0];

    if (vsURL) {
      const vsId = /#(.*)/.test(vsURL) ? RegExp.$1 : null;
      const isAnswerValueSet = vsId
        ? (r) => r.id === vsId && r.resourceType === 'ValueSet'
        : (r) => r.url === vsURL && r.resourceType === 'ValueSet';

      const containedVS = contextResource?.contained?.find(isAnswerValueSet)
        || questionnaire?.contained?.find(isAnswerValueSet);

      if (containedVS) {
        if (!containedVS.expansion) {
          result = fetch(`${getTerminologyUrl(ctx)}/ValueSet/$expand`, {
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
          result = getItemWeightFromProperty(
            getValueSetItem(containedVS.expansion.contains, code, system)
          );
        }
      } else {
        result = fetch(`${getTerminologyUrl(ctx)}/ValueSet?` + new URLSearchParams({
          url: vsURL
        }, {
          headers: {
            'Accept': 'application/fhir+json'
          }
        }).toString())
          .then(r => r.ok ? r.json() : Promise.reject(r.json()))
          .then((bundle) => {
            const terminologyVS = bundle?.entry?.[0]?.resource;
            if (!terminologyVS) {
              return Promise.reject(
                `Cannot resolve the corresponding value set: ${vsURL}`
              );
            }
            return getItemWeightFromProperty(
              getValueSetItem(terminologyVS?.expansion?.contains, code, system)
            );
          });
      }
    }

    if (system) {
      if (result === undefined) {
        const isCodeSystem = (r) => r.url === system && r.resourceType === 'CodeSystem';
        const containedCS = contextResource?.contained?.find(isCodeSystem)
          || questionnaire?.contained?.find(isCodeSystem);

        if (containedCS) {
          result = getItemWeightFromProperty(
            getCodeSystemItem(containedCS?.concept, code)
          );
        } else {
          result = getWeightFromTerminologyCodeSet(ctx, code, system);
        }
      } else if (result instanceof Promise) {
        result = result.then(weightFromVS => {
          if (weightFromVS !== undefined) {
            return weightFromVS;
          }
          return getWeightFromTerminologyCodeSet(ctx, code, system);
        });
      }
    }
  }

  return result;
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
  return fetch(`${getTerminologyUrl(ctx)}/CodeSystem/$lookup?` + new URLSearchParams({
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
      } else {
        result = getCodeSystemItem(item.concept, code);
      }
    }
  }
  return result;
}

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
