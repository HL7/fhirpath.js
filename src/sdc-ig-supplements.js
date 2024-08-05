// Contains the supplementary FHIRPath functions defined in the Structured Data
// Capture IG, https://hl7.org/fhir/uv/sdc/expressions.html#fhirpath-supplements.

let engine = {};

/**
 * Returns numeric values from the score extension associated with the input
 * collection of Questionnaire items. See the description of the ordinal()
 * function here:
 * https://hl7.org/fhir/uv/sdc/expressions.html#fhirpath-supplements
 * @param {Array} coll - questionnaire items
 * @return {number[]}
 */
engine.weight = function (coll) {
  if(coll !== false && ! coll) { return []; }

  const userScoreExtUrl = this.vars.scoreExt || this.processedVars.scoreExt;
  const checkExtUrl = userScoreExtUrl
    ? (e) => e.url === userScoreExtUrl
    : (e) => this.defaultScoreExts.includes(e.url);
  const res = [];

  const questionnaire = this.vars.questionnaire || this.processedVars.questionnaire?.data;
  coll.forEach((item) => {
    if (item?.data) {
      const valueCoding = item.data.valueCoding;
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
              }
            } else {
              throw new Error(
                'Questionnaire answerOption with this linkId was not found: ' +
                item.parentResNode.data.linkId + '.');
            }
          } else {
            throw new Error('%questionnaire is needed but not specified.');
          }
        }
      }
    }
  });

  return res;
};

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
