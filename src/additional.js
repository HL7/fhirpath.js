// Contains the additional FHIRPath functions.
// See https://build.fhir.org/fhirpath.html#functions for details.
const util = require("./utilities");
const Terminologies = require('./terminologies');

let engine = {};

/**
 * Returns true if the code is a member of the given valueset.
 * @param {(string|Object)[]} coll - input collection with a single Coding,
 *  CodeableConcept, or code element.
 * @param {string} valueset - value set URL
 * @return {Promise<boolean>|[]} - promise of a boolean value indicating that
 *  there is one element in the input collection whose code is a member of the
 *  specified value set.
 */
engine.memberOf = function (coll, valueset ) {
  if (!this.async) {
    throw new Error('The asynchronous function "memberOf" is not allowed. ' +
      'To enable asynchronous functions, use the async=true or async="always"' +
      ' option.');
  }
  // If the input is empty or has more than one value, the return value is empty
  if (coll.length !== 1 || coll[0] == null) {
    return [];
  }

  if (typeof valueset === 'string' && /^https?:\/\/.*/.test(valueset)) {
    const terminologies = this.processedVars.terminologies;
    if (!terminologies) {
      throw new Error('Option "terminologyUrl" is not specified.');
    }
    return Terminologies.validateVS(
      [terminologies], valueset, util.valData(coll[0]), ''
    ).then(params => {
      return params.parameter.find((p) => p.name === "result").valueBoolean;
    }, () => []);
  }

  // If the valueset cannot be resolved as an uri to a value set,
  // the return value is empty.
  return [];
};

module.exports = engine;
