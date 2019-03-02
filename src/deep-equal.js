// Originally copied from node-deep-equal
// (https://github.com/substack/node-deep-equal), with modifications.
// For the license for node-deep-equal, see the bottom of this file.

var types = require('./types');
var FP_Type = types.FP_Type;
var FP_DateTime = types.FP_DateTime;
var FP_Time = types.FP_Time;
var pSlice = Array.prototype.slice;
var objectKeys = Object.keys;
var isArguments = function (object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

function isString(myVar) {
  return (typeof myVar === 'string' || myVar instanceof String);
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function normalizeStr(x) {
  return x.toUpperCase().replace(/\s+/, ' ');
}


// Returns the number of digits in the number after the decimal point, ignoring
// trailing zeros.
function decimalPlaces(x) {
  // Based on https://stackoverflow.com/a/9539746/360782
  // Make sure it is a number and use the builtin number -> string.
  var s = "" + (+x);
  var match = /(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);
  // NaN or Infinity or integer.
  // We arbitrarily decide that Infinity is integral.
  if (!match) { return 0; }
  // Count the number of digits in the fraction and subtract the
  // exponent to simulate moving the decimal point left by exponent places.
  // 1.234e+2 has 1 fraction digit and '234'.length -  2 == 1
  // 1.234e-2 has 5 fraction digit and '234'.length - -2 == 5
  //var wholeNum = match[1];
  var fraction = match[2];
  var exponent = match[3];
  return Math.max(
    0,  // lower limit.
    (fraction == '0' ? 0 : (fraction || '').length)  // fraction length
    - (exponent || 0));  // exponent
}


/**
 *  The smallest representable number in FHIRPath.
 */
const PRECISION_STEP = 1e-8;

/**
 *  Rounds a number to the nearest multiple of PRECISION_STEP.
 */
function roundToMaxPrecision(x) {
  return Math.round(x/PRECISION_STEP)*PRECISION_STEP;
}


/**
 *  Rounds a number to the specified number of decimal places.
 * @param x the decimal number to be rounded
 * @param n the (maximum) number of decimal places to preserve.  (The result
 *  could contain fewer if the decimal digits in x contain zeros).
 */
function roundToDecimalPlaces(x, n) {
  var scale = Math.pow(10, n);
  return Math.round(x*scale)/scale;
}

var deepEqual = function (actual, expected, opts) {
  if (!opts) opts = {};

  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  }

  if (opts.fuzzy) {
    if(isString(actual) && isString(expected)) {
      return normalizeStr(actual) == normalizeStr(expected);
    }

    if(Number.isInteger(actual) && Number.isInteger(expected)) {
      return actual === expected;
    }

    if(isNumber(actual) && isNumber(expected)) {
      var prec = Math.min(decimalPlaces(actual), decimalPlaces(expected));
      if(prec === 0){
        return Math.round(actual) === Math.round(expected);
      } else {
        // Note: Number.parseFloat(0.00000011).toPrecision(7) ===  "1.100000e-7"
        // It does # of significant digits, not decimal places.
        return roundToDecimalPlaces(actual, prec) ===
          roundToDecimalPlaces(expected, prec);
      }
    }
  }
  else { // !opts.fuzzy
    // If these are numbers, they need to be rounded to the maximum supported
    // precision to remove floating point arithmetic errors (e.g. 0.1+0.1+0.1 should
    // equal 0.3) before comparing.
    if (typeof actual === 'number' && typeof expected === 'number') {
      return roundToMaxPrecision(actual) === roundToMaxPrecision(expected);
    }
  }

  if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

    // 7.3. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  }
  else {
    var actualIsFPT = actual instanceof FP_Type;
    var expectedIsFPT = expected instanceof FP_Type;
    if (actualIsFPT && expectedIsFPT) { // if both are FP_Type
      let rtn = actual.equals(expected); // May return undefined
      if (opts.fuzzy && rtn === undefined && (actual instanceof FP_DateTime ||
          actual instanceof FP_Time)) {
        // The case where a DateTime or Time returns undefined for "equals"
        // means there were differing precisions.  opts.fuzzy means we are doing
        // equivalence (~) not equality (=), and in that case differing
        // precisions should result in false.
        rtn = false;
      }
      return rtn;
    }
    else if (actualIsFPT || expectedIsFPT) { // if only one is an FP_Type
      // See if the other is convertible.
      let fpt, nonFPT;
      if (actualIsFPT) {
        fpt = actual;
        nonFPT = expected;
      }
      else {
        fpt = expected;
        nonFPT = actual;
      }
      let rtn = typeof nonFPT === 'string';
      if (rtn) {
        let d = fpt.constructor.checkString(nonFPT);
        if (d) {
          rtn = fpt.equals(d);
          if (opts.fuzzy && rtn === undefined &&
              (actual instanceof FP_DateTime ||
              actual instanceof FP_Time)) {
            rtn = false;  // see note for similar case above
          }
        }
      }
      return rtn;
    }
    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if(isArguments(a) || isArguments(b)) {
    a = isArguments(a) ? pSlice.call(a) : a;
    b = isArguments(b) ? pSlice.call(b) : b;
    return deepEqual(a, b, opts);
  }
  try {
    var ka = objectKeys(a), kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  // If the length of the array is one, return the value of deepEqual (which can
  // be "undefined".
  if (ka.length === 1) {
    key = ka[0];
    return deepEqual(a[key], b[key], opts);
  }
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

module.exports = deepEqual;

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
