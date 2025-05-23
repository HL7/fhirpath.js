// This file holds code to handle the FHIRPath Math functions.

const util = require("./utilities");
const { deepEqual } = require('./deep-equal');
const types = require('./types');
const FP_Type = types.FP_Type;
const FP_DateTime = types.FP_DateTime;

var engine = {};

function equality(x,y){
  if(util.isEmpty(x) || util.isEmpty(y)) { return []; }
  return deepEqual(x, y);
}

function equivalence(x,y){
  if(util.isEmpty(x) && util.isEmpty(y)) { return [true]; }
  if(util.isEmpty(x) || util.isEmpty(y)) { return []; }
  return deepEqual(x, y, {fuzzy: true});
}

engine.equal = function(a, b){
  return equality(a, b);
};

engine.unequal = function(a, b){
  var eq = equality(a, b);
  return eq === undefined ? undefined : !eq;
};

engine.equival = function(a, b){
  return equivalence(a, b);
};

engine.unequival = function(a, b){
  return !equivalence(a, b);
};

/**
 *  Checks that the types of a and b are suitable for comparison in an
 *  inequality expression.
 * @param a the left side of the inequality expression (which should be an array of
 *  one value).
 * @param b the right side of the inequality expression (which should be an array of
 *  one value).
 * @return the singleton values of the arrays a, and b.  If one was an FP_Type
 *  and the other was convertible, the converted value will be returned.
 */
function typecheck(a, b){
  util.assertOnlyOne(a, "Singleton was expected");
  util.assertOnlyOne(b, "Singleton was expected");
  a = util.valDataConverted(a[0]);
  b = util.valDataConverted(b[0]);
  if (a != null && b != null) {
    // FP_Date, FP_Instant are extended from FP_DateTime and can be compared
    // in some cases. BigInt can be compared to Number.
    let lClass = getClassForComparison(a);
    let rClass = getClassForComparison(b);
    if (lClass !== rClass) {
      util.raiseError('Type of "' + a + '" (' + lClass.name + ') did not match type of "' +
        b + '" (' + rClass.name + ')', 'InequalityExpression');
    }
  }
  return [a, b];
}


/**
 * Determines the class of an object for comparison purposes. Should return
 * the same value for objects that can be compared.
 *
 * @param {*} obj - The object to evaluate.
 * @returns {Function} - The constructor or class of the object:
 *   - Returns `FP_DateTime` if the object is an instance of `FP_DateTime`.
 *   - Returns `Number` if the object is of type `bigint`.
 *   - Otherwise, returns the object's constructor.
 */
function getClassForComparison(obj) {
  return obj instanceof FP_DateTime ? FP_DateTime
    : typeof obj === 'bigint' ? Number : obj.constructor;
}


engine.lt = function(a, b){
  const [a0, b0] = typecheck(a,b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : compare < 0;
  }
  return a0 < b0;
};

engine.gt = function(a, b){
  const [a0, b0] = typecheck(a,b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : compare > 0;
  }
  return a0 > b0;
};

engine.lte = function(a, b){
  const [a0, b0] = typecheck(a,b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : compare <= 0;
  }
  return  a0 <= b0;
};

engine.gte = function(a, b){
  const [a0, b0] = typecheck(a,b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : compare >= 0;
  }
  return a0 >= b0;
};


module.exports = engine;
