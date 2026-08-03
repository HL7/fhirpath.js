// Originally copied from node-deep-equal
// (https://github.com/substack/node-deep-equal), with modifications.
// For the license for node-deep-equal, see the bottom of this file.

const {FP_Type, ResourceNode} = require('./types');
const numbers = require('./numbers');
const pSlice = Array.prototype.slice;
const objectKeys = Object.keys;


/**
 * Checks whether the given object is an Arguments object.
 * @param {*} object - the value to check.
 * @returns {boolean} true if the object is an Arguments object, false otherwise.
 */
const isArguments = function (object) {
  return Object.prototype.toString.call(object) === '[object Arguments]';
};


/**
 * Normalizes a string for equivalence comparison by converting to uppercase
 * and replacing every whitespace character with a regular ASCII space.
 * @param {string} x - the string to normalize.
 * @returns {string} the normalized string.
 */
function normalizeStr(x) {
  return x.toUpperCase().replace(/\p{White_Space}/ug, ' ');
}


/**
 * Performs a deep comparison between two values to determine if they are equal.
 * When you need to compare many objects, you can use hashObject instead for
 * optimization (if changes are needed here, they are likely also needed there).
 * @param {Object} ctx - evaluation context.
 * @param {any} v1 - one of the comparing objects
 * @param {any} v2 - one of the comparing objects
 * @param {Object} [opts] - comparison options
 * @param {boolean} [opts.fuzzy] - false (by default), if comparing objects for
 *   equality (see https://hl7.org/fhirpath/#equals).
 *   true, if comparing objects for equivalence
 *   (see https://hl7.org/fhirpath/#equivalent).
 * @return {boolean|undefined} - may return undefined, if opts.fuzzy === false
 *  and the objects are not comparable.
 */
function deepEqual(ctx, v1, v2, opts) {
  const v1IsResourceNode = v1 instanceof ResourceNode;
  const v2IsResourceNode = v2 instanceof ResourceNode;
  let actual = v1IsResourceNode ? v1.convertData() : v1;
  let expected =  v2IsResourceNode ? v2.convertData() : v2;
  if (!opts) opts = {};

  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return opts.fuzzy || !v1IsResourceNode || !v2IsResourceNode ||
      deepEqual(ctx, v1._data, v2._data);
  }

  const typeOfActual = typeof actual;
  const typeOfExpected = typeof expected;

  if (opts.fuzzy) {
    if (typeOfActual === 'string' && typeOfExpected === 'string') {
      return normalizeStr(actual) === normalizeStr(expected);
    }
    if (typeOfActual === 'number' && typeOfExpected === 'number') {
      return numbers.isEquivalent(actual, expected);
    }
  }
  else { // !opts.fuzzy
    // If these are numbers, they need to be rounded to the maximum supported
    // precision to remove floating point arithmetic errors (e.g. 0.1+0.1+0.1 should
    // equal 0.3) before comparing.
    if (typeOfActual === 'number') {
      if (typeOfExpected === 'bigint') {
        // Note: currently, a resource node with a direct number value is not
        // possible (we use FP_Decimal instead), so there is no need to compare
        // the _data of the resource nodes like this:
        //   return (actual == expected) && (v1IsResourceNode && v2IsResourceNode ?
        //           deepEqual(ctx, v1._data, v2._data, opts) : true);
        // If this ever becomes possible, the above code should be used instead
        // of the code below.
        // noinspection EqualityComparisonWithCoercionJS
        return actual == expected;
      } else if (typeOfExpected === 'number') {
        // Note: currently, a resource node with a direct number value is not
        // possible (we use FP_Decimal instead), so there is no need to compare
        // the _data of the resource nodes like this:
        //   if(numbers.isEqual(actual, expected)) {
        //     return v1IsResourceNode && v2IsResourceNode ?
        //       deepEqual(ctx, v1._data, v2._data, opts) : true;
        //   } else {
        //     return false;
        //   }
        // If this ever becomes possible, the above code should be used instead
        // of the code below.
        return numbers.isEqual(actual, expected);
      }
    } else if (typeOfActual === 'bigint' && typeOfExpected === 'number') {
      // Note: currently, a resource node with a direct number value is not
      // possible (we use FP_Decimal instead), so there is no need to compare
      // the _data of the resource nodes like this:
      //   return (actual == expected) && (v1IsResourceNode && v2IsResourceNode ?
      //           deepEqual(ctx, v1._data, v2._data, opts) : true);
      // If this ever becomes possible, the above code should be used instead
      // of the code below.
      // noinspection EqualityComparisonWithCoercionJS
      return actual == expected;
    }
  }

  if (actual instanceof Date && expected instanceof Date) {
    return (actual.getTime() === expected.getTime()) && (
      opts.fuzzy || !v1IsResourceNode || !v2IsResourceNode ||
      deepEqual(ctx, v1._data, v2._data)
    );
  } else if (actual == null || expected == null || typeof actual != 'object' && typeof expected != 'object') {
    return (actual === expected) && (
      opts.fuzzy || !v1IsResourceNode || !v2IsResourceNode ||
      deepEqual(ctx, v1._data, v2._data)
    );
  }
  else {
    var actualIsFPT = actual instanceof FP_Type;
    var expectedIsFPT = expected instanceof FP_Type;
    if (actualIsFPT && expectedIsFPT) { // if both are FP_Type
      if (opts.fuzzy) {
        return actual.equivalentTo(expected);
      } else {
        let result = actual.equals(expected); // May return undefined
        if (result) {
          return !v1IsResourceNode || !v2IsResourceNode ||
            deepEqual(ctx, v1._data, v2._data) &&
            deepEqual(ctx, v1.data?.id, v2.data?.id) &&
            deepEqual(ctx, v1.data?.extension, v2.data?.extension);
        } else {
          return result;
        }
      }
    }
    else if (actualIsFPT || expectedIsFPT) { // if only one is an FP_Type
      const typeOfActual = typeof actual;
      if (typeOfActual === 'number' || typeOfActual === 'bigint') {
        return opts.fuzzy ? expected.equivalentTo(actual) :
          expected.equals(actual);
      }
      const typeOfExpected = typeof expected;
      if (typeOfExpected === 'number' || typeOfExpected === 'bigint') {
        return opts.fuzzy ? actual.equivalentTo(expected) :
          actual.equals(expected);
      }
      return false;
    }
    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    return objEquiv(ctx, actual, expected, opts);
  }
}


/**
 * Checks whether the given value is null or undefined.
 * @param {*} value - the value to check.
 * @returns {boolean} true if the value is null or undefined, false otherwise.
 */
function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}


/**
 * Performs a deep equality comparison between two plain objects or arrays.
 * Checks that both objects have the same prototype, the same set of own
 * property keys, and deeply equal values for each key.
 * @param {Object} ctx - the FHIRPath evaluation context.
 * @param {Object} a - the first object to compare.
 * @param {Object} b - the second object to compare.
 * @param {Object} [opts] - comparison options (see {@link deepEqual}).
 * @returns {boolean} true if the two objects are structurally equal,
 *   false otherwise.
 */
function objEquiv(ctx, a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a) || isArguments(b)) {
    a = isArguments(a) ? pSlice.call(a) : a;
    b = isArguments(b) ? pSlice.call(b) : b;
    return deepEqual(ctx, a, b, opts);
  }
  try {
    var ka = objectKeys(a), kb = objectKeys(b);
  } catch {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  // If the length of the array is one, return the value of deepEqual (which can
  // be "undefined".
  if (ka.length === 1) {
    key = ka[0];
    return deepEqual(ctx, a[key], b[key], opts);
  }
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(ctx, a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

module.exports = {
  deepEqual,
  // Maximum collection length to use deepEqual(). When comparing a large number
  // of collection items, it is more efficient to convert the items to strings
  // using the hashObject() function and compare them.
  maxCollSizeForDeepEqual: 6
};

// The license for node-deep-equal, on which the above code is based, is as
// follows:
//
// This software is released under the MIT license:
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
