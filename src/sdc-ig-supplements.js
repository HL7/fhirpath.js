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

  const scoreExtUrl = this.vars.scoreExt || this.processedVars.scoreExt;
  const res = [];

  const questionnaire = this.vars.questionnaire || this.processedVars.questionnaire?.data;
  coll.forEach((answer) => {
    if (answer.data.valueCoding) {
      const score = answer.data.extension?.find(e => e.url === scoreExtUrl)?.valueDecimal;
      if (score !== undefined) {
        // if we have a score extension in the source item, use it.
        res.push(score);
      } else if (questionnaire) {
        const qItem = getQItemByLinkIds(questionnaire, getLinkIds(answer.parentResNode));
        const valueCoding = answer.data.valueCoding;
        const answerOption = qItem?.answerOption?.find(o =>
          o.valueCoding.code === valueCoding.code
          && o.valueCoding.system === valueCoding.system
        );
        if (answerOption) {
          const score = answerOption.extension?.find(e => e.url === scoreExtUrl)?.valueDecimal;
          if (score !== undefined) {
            // if we have a score extension for the answerOption, use it.
            res.push(score);
          }
        } else {
          throw new Error('Questionnaire answerOption with this linkId were not found: ' + answer.parentResNode.data.linkId + '.');
        }
      } else {
        throw new Error('%questionnaire is needed but not specified.');
      }
    }
  });

  return res;
};

/**
 * Returns array of linkIds of parent ResourceNodes and source ResourceNode.
 * @param {ResourceNode} node - source ResourceNode.
 * @return {String[]}
 */
function getLinkIds(node) {
  const res = [];

  while (node.data?.linkId) {
    res.unshift(node.data.linkId);
    node = node.parentResNode;
  }

  return res;
}

/**
 * Returns a questionnaire item based on the linkIds array of the parent
 * ResourceNodes and the target ResourceNode.
 * @param {Object} questionnaire - object with a Questionnaire resource.
 * @param {string[]} linkIds - array of linkIds.
 * @return {Object}
 */
function getQItemByLinkIds(questionnaire, linkIds) {
  let currentNode = questionnaire;
  for(let i = 0; i < linkIds.length; ++i) {
    currentNode = currentNode.item?.find(o => o.linkId === linkIds[i]);
    if (!currentNode) {
      return null;
    }
  }
  return currentNode;
}

module.exports = engine;
