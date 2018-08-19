// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");

// copied from node-deep-equal
var pSlice = Array.prototype.slice;
var objectKeys = Object.keys;
var isArguments = function (object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

function isString(myVar) {
  return (typeof myVar === 'string' || myVar instanceof String); 
}

var deepEqual = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
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
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
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

function init(engine) {
  "use strict";

  function equality(x,y){
    if(engine.isEmpty(x) || engine.isEmpty(y)) { return []; }
    return [deepEqual(x, y)];
  }

  function normalizeStr(x) {
    return x.toUpperCase().replace(/\s+/, ' ');
  }

  function equivalence(x,y){
    if(engine.isEmpty(x) && engine.isEmpty(y)) { return [true]; }
    if(engine.isEmpty(x) || engine.isEmpty(y)) { return []; }
    if(deepEqual(x, y)){ return [true]; }
    if(x.length == 1 && y.length == 1){
      if(isString(x[0]) && isString(y[0])){
        return [normalizeStr(x[0]) == normalizeStr(y[0])];
      }
    }

    return [false];
  }

  engine.evalTable.EqualityExpression = function(ctx, parentData, node) {
    var op = node.terminalNodeText[0];
    var left = engine.doEval(ctx, parentData, node.children[0]);
    var right = engine.doEval(ctx, parentData, node.children[1]);
    if(op == '=') {
      return equality(left, right);
    } else if (op == '~') {
      return equivalence(left, right);
    } else {
      throw new Error(op + ' is not impl.');
    }
  };

  engine.evalTable.InequalityExpression = function(ctx, parentData, node) {
    var left = engine.doEval(ctx, parentData, node.children[0]);
    var right = engine.doEval(ctx, parentData, node.children[1]);
    let rtn;
    if (!left.length || ! right.length)
      rtn = [];
    else  {
      util.assertAtMostOne(left, "InequalityExpression");
      util.assertAtMostOne(right, "InequalityExpression");
      left = left[0];
      right = right[0];
      let lType = typeof left;
      let rType = typeof right;
      if (lType != rType) {
        util.raiseError('Type of "'+left+'" did not match type of "'+right+'"',
                        'InequalityExpression');
      }
      // TBD - Check types are "string", "number", or "Date".
      let operator = node.terminalNodeText[0];
      switch (operator) {
      case '<':
        rtn = [left < right];
        break;
      case '>':
        rtn = [left > right];
        break;
      case '<=':
        rtn = [left <= right];
        break;
      case '>=':
        rtn = [left >= right];
        break;
      default:
        util.raiseError('Invalid operator "'+operator+'"', 'InequalityExpression');
      }
    }
    return rtn;
  };

}

module.exports = init;
