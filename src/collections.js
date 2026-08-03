// This file holds the code for the FHIRPath operators used to process collections.

const { deepEqual } = require('./deep-equal');
const util = require("./utilities");

const engine = {};


/**
 * Tests whether the first element of "b" is contained in collection "a"
 * using deep equality comparison.
 * @param {Object} ctx - the FHIRPath evaluation context.
 * @param {Array} a - the collection to search in.
 * @param {Array} b - a singleton collection whose first element is tested
 *   for membership in "a".
 * @returns {boolean} true if b[0] is found in a, false otherwise.
 */
function containsImpl(ctx, a, b){
  for(let i = 0; i < a.length; i++){
    if(deepEqual(ctx, a[i], b[0])) { return true; }
  }
  return false;
}

/**
 * Implements the FHIRPath `contains` function.
 * Returns true if the first element of "b" is in collection "a".
 * See https://hl7.org/fhirpath/#contains-containership
 * @param {Array} a - the collection to search in.
 * @param {Array} b - a singleton collection to test for membership.
 * @returns {boolean|Array} true if b[0] is in a, false if a is empty,
 *   or an empty array if b is empty.
 * @throws {Error} if b contains more than one element.
 */
engine.contains = function(a, b){
  if(util.isEmpty(b)) { return []; }
  if(util.isEmpty(a)) { return false; }
  if(b.length > 1) {
    throw new Error("Expected singleton on right side of contains, got " + util.toJSON(b));
  }
  const ctx = this;
  return containsImpl(ctx, a, b);
};

/**
 * Implements the FHIRPath `in` operator.
 * Returns true if the first element of "a" is in collection "b".
 * See https://hl7.org/fhirpath/#in-membership
 * @param {Array} a - a singleton collection to test for membership.
 * @param {Array} b - the collection to search in.
 * @returns {boolean|Array} true if a[0] is in b, false if b is empty,
 *   or an empty array if a is empty.
 * @throws {Error} if a contains more than one element.
 */
engine.in = function(a, b){
  if(util.isEmpty(a)) { return []; }
  if(util.isEmpty(b)) { return false; }
  if(a.length > 1) {
    throw new Error("Expected singleton on right side of in, got " + util.toJSON(b));
  }
  const ctx = this;
  return containsImpl(ctx, b, a);
};

module.exports = engine;
