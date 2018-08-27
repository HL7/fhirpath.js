// Originally copied from node-deep-equal
// (https://github.com/substack/node-deep-equal), with modifications.
// For the license for node-deep-equal, see the bottom of this file.

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

function getPrecision(x) {
  return (x.toString().split(".")[1] || "").length;
}

var deepEqual = function (actual, expected, opts) {
  if (!opts) opts = {};

  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  }

  if(opts.fuzzy && isString(actual) && isString(expected)) {
    return normalizeStr(actual) == normalizeStr(expected);
  }

  if(opts.fuzzy && Number.isInteger(actual) && Number.isInteger(expected)) {
    return actual === expected;
  }

  if(opts.fuzzy && isNumber(actual) && isNumber(expected)) {
    var prec = Math.min(getPrecision(actual), getPrecision(expected));
    if(prec === 0){
      return Math.round(actual) === Math.round(expected);
    } else {
      return Number.parseFloat(actual).toPrecision(prec) === Number.parseFloat(expected).toPrecision(prec);
    }
  }

  if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

    // 7.3. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
  } else {
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
