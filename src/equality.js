// This file holds code to handle the FHIRPath Math functions.

const util = require("./utilities");
const { deepEqual } = require('./deep-equal');
const { FP_Type, FP_DateTime, FP_Quantity } = require('./types');

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
      // Implicit conversion of numbers to quantities.
      // See:
      //  https://hl7.org/fhirpath/#conversion
      if (lClass === Number && rClass === FP_Quantity) {
        a = new FP_Quantity(a, "'1'");
      } else if (lClass === FP_Quantity && rClass === Number) {
        b = new FP_Quantity(b, "'1'");
      } else {
        util.raiseError('Type of "' + a + '" (' + lClass.name + ') did not match type of "' +
          b + '" (' + rClass.name + ')', 'InequalityExpression');
      }
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


/**
 * Determines whether two operands are singleton quantities (or implicitly
 * convertible to quantities https://www.hl7.org/fhirpath/#conversion)
 * and whether they are comparable.
 *
 * @param {any[]} a - The first operand, expected to be an array with a single value.
 * @param {any[]} b - The second operand, expected to be an array with a single value.
 * @returns {[boolean]} - Returns an array containing `true` if both operands are
 *   instances of FP_Quantity (or implicitly convertible to FP_Quantity) and are
 *   comparable, otherwise returns `[false]`.
 */
engine.comparable = function(a, b){
  util.assertOnlyOne(a, "Singleton was expected");
  util.assertOnlyOne(b, "Singleton was expected");
  let a0 = util.valDataConverted(a[0]);
  let b0 = util.valDataConverted(b[0]);
  // Comparable is only defined for quantities, but numbers are implicitly
  // converted to quantities with unit '1'.
  // See:
  //  https://hl7.org/fhir/fhirpath.html#fn-comparable
  //  https://hl7.org/fhirpath/#conversion
  if (typeof a0 === 'number') {
    a0 = new FP_Quantity(a0, "'1'");
  }
  if (typeof b0 === 'number') {
    b0 = new FP_Quantity(b0, "'1'");
  }

  if (a0 instanceof FP_Quantity && b0 instanceof FP_Quantity) {
    return [a0.comparable(b0)];
  }
  return [false];
};


module.exports = engine;
