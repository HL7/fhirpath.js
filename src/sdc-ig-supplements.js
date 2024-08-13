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
                hasPromise = true;
                res.push(getWeightFromTerminologyServer(
                  this, qItem.answerValueSet, valueCoding.code,
                  valueCoding.system, checkExtUrl));
              }
            } else if (qItem?.answerValueSet) {
              // Otherwise, check corresponding value set and code system
              hasPromise = true;
              res.push(getWeightFromTerminologyServer(
                this, qItem.answerValueSet, valueCoding.code,
                valueCoding.system, checkExtUrl));
            } else {
              throw new Error(
                'Questionnaire answerOption/answerValueSet with this linkId was not found: ' +
                item.parentResNode.data.linkId + '.');
            }
          } else {
            throw new Error('%questionnaire is needed but not specified.');
          }
        } else if (valueCoding.system) {
          // If there are no questionnaire (no linkId) check corresponding value
          // set and code system
          hasPromise = true;
          res.push(getWeightFromTerminologyServer(
            this, null, valueCoding.code, valueCoding.system,
            checkExtUrl));
        }
      }
    }
  });

  return hasPromise ? Promise.all(res) : res;
};

/**
 * Returns a promise of score value received from the terminology server.
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {string} vsURL - value set URL specified in the Questionnaire item.
 * @param {string} code - symbol in syntax defined by the system.
 * @param {string} system - code system.
 * @param {Function} checkExtUrl - function to check if an extension has a URL
 *  to store a score.
 * @return {Promise<number|null|undefined>}
 */
function getWeightFromTerminologyServer(ctx, vsURL, code, system, checkExtUrl) {
  if (!ctx.async) {
    throw new Error('The asynchronous function "weight"/"ordinal" is not allowed. ' +
      'To enable asynchronous functions, use the async=true or async="always"' +
      ' option.');
  }

  const terminologyUrl = ctx.processedVars.terminologies?.terminologyUrl;
  if (!terminologyUrl) {
    throw new Error('Option "terminologyUrl" is not specified.');
  }

  // Searching for value sets by item code is extremely onerous for a server
  // (see https://www.hl7.org/fhir/valueset.html#search for details); therefore,
  // we only check the value set whose URL is specified in the Questionnaire item.
  return (vsURL
    ? fetch(`${terminologyUrl}/ValueSet?` + new URLSearchParams({
      url: vsURL
    }).toString()).then(r => r.json()).then((bundle) => {
      const vs = bundle?.entry?.[0]?.resource;
      if (!vs) {
        return Promise.reject(`Cannot resolve the corresponding value set: ${vsURL}`);
      }
      return (
        vs.compose?.include?.find(c => c.system === system)?.concept
          .find(c => c.code === code)
        ||
        vs.expansion?.contains
          ?.find(c => c.system === system && c.code === code)
      )?.extension?.find(checkExtUrl)?.valueDecimal;
    })
    : Promise.resolve(null)
  ).then(weightFromVS => {
    if (weightFromVS !== null && weightFromVS !== undefined) {
      return weightFromVS;
    }
    return system
      ? fetch(`${terminologyUrl}/CodeSystem?` + new URLSearchParams({
        code, system
      }).toString()).then(r => r.json()).then((bundle) => {
        const cs = bundle?.entry?.[0]?.resource;
        if (!cs) {
          return Promise.reject(`Cannot resolve the corresponding code system: ${system}`);
        }
        return cs.concept?.find(c => c.code === code)
          ?.extension?.find(checkExtUrl)?.valueDecimal;
      })
      : Promise.resolve(null);
  });
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
