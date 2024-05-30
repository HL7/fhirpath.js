// Contains the additional FHIRPath functions.
// See https://build.fhir.org/fhirpath.html#functions for details.
const util = require("./utilities");

let engine = {};

/**
 * Returns true if the code is a member of the given valueset.
 * @param {(string | Coding | CodeableConcept)[]} coll - input collection
 * @param {string} valueset - value set URL
 * @return {Promise<{[p: string]: PromiseSettledResult<Awaited<*>>, [p: number]: PromiseSettledResult<Awaited<*>>, [p: symbol]: PromiseSettledResult<Awaited<*>>}>}
 */
engine.memberOf = function (coll, valueset ) {
  if (!this.async) {
    throw new Error('The asynchronous function "memberOf" is not allowed. To enable asynchronous functions, use the async=true or async="always" option.');
  }
  // If the input is empty or has more than one value, the return value is empty
  if (coll.length !== 1 || coll[0] == null) {
    return [];
  }

  if (typeof valueset === 'string' && /^https?:\/\/.*/.test(valueset)) {
    const terminologies = this.vars.terminologies || this.processedVars.terminologies;
    return terminologies.validateVS(valueset, util.valData(coll[0]), '');
  }

  // If the valueset cannot be resolved as an uri to a value set, the return value is empty.
  return [];
};

module.exports = engine;
