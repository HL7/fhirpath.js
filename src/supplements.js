// Contains the supplementary FHIRPath functions.

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
  const linkId2Code = {};

  coll.forEach((answer) => {
    if (answer.data.valueCoding) {
      const score = answer.data.extension?.find(e => e.url === scoreExtUrl)?.valueDecimal;
      if (score !== undefined) {
        // if we have a score extension in the source item, use it.
        res.push(score);
      } else {
        // otherwise we will try to find the score in the %questionnaire.
        linkId2Code[answer.parentResNode.data.linkId] = answer.data.valueCoding.code;
      }
    }
  });

  const questionnaire = this.vars.questionnaire || this.processedVars.questionnaire?.data;
  if (questionnaire) {
    forEachQItem(questionnaire, (qItem) => {
      const code = linkId2Code[qItem.linkId];
      if (code) {
        const answerOption = qItem.answerOption?.find(o => o.valueCoding.code === code);
        if (answerOption) {
          delete linkId2Code[qItem.linkId];
          const score = answerOption.extension?.find(e => e.url === scoreExtUrl)?.valueDecimal;
          if (score !== undefined) {
            // if we have a score extension for the answerOption, use it.
            res.push(score);
          }
        }
      }
    });
  }

  // Check for errors.
  const unfoundLinkIds = Object.keys(linkId2Code);
  if (unfoundLinkIds.length) {
    if (questionnaire) {
      throw new Error('Questionnaire answerOptions with these linkIds were not found: ' + unfoundLinkIds.join(',') + '.');
    } else {
      throw new Error('%questionnaire is needed but not specified.');
    }
  }

  return res;
};

/**
 * Runs a function for each questionnaire item.
 * @param {Object} questionnaire - Questionnaire resource.
 * @param {(item) => void} fn - function.
 */
function forEachQItem(questionnaire, fn) {
  if(questionnaire.item) {
    questionnaire.item.forEach((item) => {
      fn(item);
      forEachQItem(item, fn);
    });
  }
}

module.exports = engine;
