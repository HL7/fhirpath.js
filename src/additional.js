// Contains the additional FHIRPath functions.
// See https://build.fhir.org/fhirpath.html#functions for details.
const Terminologies = require('./terminologies');
const util = require("./utilities");
const {TypeInfo} = require('./types');

let engine = {};

/**
 * Returns true if the code is a member of the given valueset.
 * @param {(string|Object)[]} coll - input collection with a single Coding,
 *  CodeableConcept, or code element.
 * @param {(ResourceNode|string)[]} valueSetColl - an array that should have one
 *  element, which is value set URL.
 * @return {Promise<boolean>|[]} - promise of a boolean value indicating that
 *  there is one element in the input collection whose code is a member of the
 *  specified value set.
 */
engine.memberOf = function (coll, valueSetColl ) {
  const ctx = this;

  util.checkContext(ctx, 'memberOf');
  // If the input is empty or has more than one value, the return value is empty
  if (coll.length === 1 && coll[0] != null && valueSetColl.length === 1 && valueSetColl[0] != null) {
    const typeInfo = TypeInfo.fromValue(valueSetColl[0]);
    // If the valueSet cannot be resolved as an uri to a value set,
    // the return value is empty.
    if(typeInfo.is(TypeInfo.FhirUri, ctx.model) || typeInfo.is(TypeInfo.SystemString)) {
      const terminologies = this.processedVars.terminologies;
      if (!terminologies) {
        throw new Error('Option "terminologyUrl" is not specified.');
      }
      return Terminologies.validateVS.call(this,
        [terminologies], valueSetColl, coll, ''
      ).then(params => {
        return util.valData(params)?.parameter.find((p) => p.name === "result").valueBoolean;
      }, () => []);
    }
  }

  return [];
};

module.exports = engine;
