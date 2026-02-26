// This file holds code to handle the FHIRPath Equality functions.

const util = require("./utilities");
const { deepEqual } = require('./deep-equal');
const { FP_Type, FP_Quantity, FP_Decimal} = require('./types');

const engine = {};


/**
 * Tests equality between two collections using deep comparison.
 * If either collection is empty, returns an empty array (propagating empty).
 * See https://hl7.org/fhirpath/#equals
 * @param {Object} ctx - the FHIRPath evaluation context.
 * @param {Array} x - the left operand collection.
 * @param {Array} y - the right operand collection.
 * @returns {boolean|Array} true or false if both operands are non-empty,
 *   or an empty array if either operand is empty.
 */
function equality(ctx, x, y){
  if(util.isEmpty(x) || util.isEmpty(y)) { return []; }
  return deepEqual(ctx, x, y);
}


/**
 * Tests equivalence between two collections using fuzzy deep comparison.
 * If both collections are empty, returns [true]. If only one is empty,
 * returns an empty array.
 * See https://hl7.org/fhirpath/#equivalent
 * @param {Object} ctx - the FHIRPath evaluation context.
 * @param {Array} x - the left operand collection.
 * @param {Array} y - the right operand collection.
 * @returns {boolean|Array} true or false if both operands are non-empty,
 *   [true] if both are empty, or an empty array if only one is empty.
 */
function equivalence(ctx, x, y){
  if(util.isEmpty(x) && util.isEmpty(y)) { return [true]; }
  if(util.isEmpty(x) || util.isEmpty(y)) { return []; }
  return deepEqual(ctx, x, y, {fuzzy: true});
}


/**
 * Implements the FHIRPath `=` (equals) operator.
 * See https://hl7.org/fhirpath/#equals
 * @param {Array} a - the left operand collection.
 * @param {Array} b - the right operand collection.
 * @returns {boolean|Array} the result of equality comparison.
 */
engine.equal = function(a, b){
  return equality(this, a, b);
};


/**
 * Implements the FHIRPath `!=` (not equals) operator.
 * Returns the logical negation of equality, or undefined if equality
 * returned empty (null or undefined).
 * See https://hl7.org/fhirpath/#not-equals
 * @param {Array} a - the left operand collection.
 * @param {Array} b - the right operand collection.
 * @returns {boolean|undefined} the negated result of equality, or undefined
 *   if equality is indeterminate.
 */
engine.unequal = function(a, b){
  var eq = equality(this, a, b);
  return eq === undefined || eq === null ? undefined : !eq;
};


/**
 * Implements the FHIRPath `~` (equivalent) operator.
 * See https://hl7.org/fhirpath/#equivalent
 * @param {Array} a - the left operand collection.
 * @param {Array} b - the right operand collection.
 * @returns {boolean} the result of equivalence comparison.
 */
engine.equival = function(a, b){
  return equivalence(this, a, b);
};


/**
 * Implements the FHIRPath `!~` (not equivalent) operator.
 * See https://hl7.org/fhirpath/#not-equivalent
 * @param {Array} a - the left operand collection.
 * @param {Array} b - the right operand collection.
 * @returns {boolean} the negated result of equivalence comparison.
 */
engine.unequival = function(a, b){
  return !equivalence(this, a, b);
};


/**
 *  Checks that the types of a and b are suitable for comparison in an
 *  inequality expression.
 * @param {Object} ctx - the FHIRPath evaluation context.
 * @param a the left side of the inequality expression (which should be an array of
 *  one value).
 * @param b the right side of the inequality expression (which should be an array of
 *  one value).
 * @return the singleton values of the arrays a, and b.  If one was an FP_Type
 *  and the other was convertible, they will be exchanged so that the FP_Type is
 *  returned first, and a boolean indicating whether they were exchanged will be
 *  returned as the third element of the array.
 */
function typecheck(ctx, a, b){
  util.assertOnlyOne(a, "Singleton was expected");
  util.assertOnlyOne(b, "Singleton was expected");
  a = util.valDataConverted(a[0]);
  b = util.valDataConverted(b[0]);
  let exchange;
  if (a != null && b != null) {
    // FP_Date, FP_Instant are extended from FP_DateTime and can be compared
    // in some cases. BigInt can be compared to Number.
    let lClass = getClassForComparison(a);
    let rClass = getClassForComparison(b);
    if (lClass !== rClass) {
      // Implicit conversion of numbers to quantities.
      // See:
      //  https://hl7.org/fhirpath/#conversion
      if (lClass === Number && rClass === FP_Type) {
        exchange = true;
      } else if (lClass === FP_Type && rClass === Number) {
        // leave a and b as they are, with the FP_Type on the left, so that
        // the FP_Type's compare() method will be used.
      } else {
        util.raiseError('Type of "' + a + '" (' + lClass.name + ') did not match type of "' +
          b + '" (' + rClass.name + ')', 'InequalityExpression');
      }
    }
  }
  return exchange ? [b, a, true] : [a, b, false];
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
  return obj instanceof FP_Type ? FP_Type
    : typeof obj === 'bigint' ? Number : obj.constructor;
}


/**
 * Implements the FHIRPath `<` (less than) operator.
 * See https://hl7.org/fhirpath/#less-than
 * @param {Array} a - the left operand collection (singleton).
 * @param {Array} b - the right operand collection (singleton).
 * @returns {boolean|Array} true if a < b, false if a >= b, or an empty
 *   array if either operand is null or comparison is not possible.
 */
engine.lt = function(a, b){
  const ctx = this;
  const [a0, b0, exchanged] = typecheck(ctx, a, b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : (exchanged ? compare > 0 : compare < 0);
  }
  return a0 < b0;
};


/**
 * Implements the FHIRPath `>` (greater than) operator.
 * See https://hl7.org/fhirpath/#greater-than
 * @param {Array} a - the left operand collection (singleton).
 * @param {Array} b - the right operand collection (singleton).
 * @returns {boolean|Array} true if a > b, false if a <= b, or an empty
 *   array if either operand is null or comparison is not possible.
 */
engine.gt = function(a, b){
  const ctx = this;
  const [a0, b0, exchanged] = typecheck(ctx, a, b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : (exchanged ? compare < 0 : compare > 0);
  }
  return a0 > b0;
};


/**
 * Implements the FHIRPath `<=` (less than or equal) operator.
 * See https://hl7.org/fhirpath/#less-or-equal
 * @param {Array} a - the left operand collection (singleton).
 * @param {Array} b - the right operand collection (singleton).
 * @returns {boolean|Array} true if a <= b, false if a > b, or an empty
 *   array if either operand is null or comparison is not possible.
 */
engine.lte = function(a, b){
  const ctx = this;
  const [a0, b0, exchanged] = typecheck(ctx, a, b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : (exchanged ? compare >= 0 : compare <= 0);
  }
  return  a0 <= b0;
};


/**
 * Implements the FHIRPath `>=` (greater than or equal) operator.
 * See https://hl7.org/fhirpath/#greater-or-equal
 * @param {Array} a - the left operand collection (singleton).
 * @param {Array} b - the right operand collection (singleton).
 * @returns {boolean|Array} true if a >= b, false if a < b, or an empty
 *   array if either operand is null or comparison is not possible.
 */
engine.gte = function(a, b){
  const ctx = this;
  const [a0, b0, exchanged] = typecheck(ctx, a, b);
  if (a0 == null || b0 == null) {
    return [];
  }
  if (a0 instanceof FP_Type) {
    const compare = a0.compare(b0);
    return compare === null ? [] : (exchanged ? compare <= 0 : compare >= 0);
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
  if ((typeof a0 === 'number' || a0 instanceof FP_Decimal)) {
    if (b0 instanceof FP_Quantity) {
      return [b0.comparable(a0)];
    }
    return [typeof b0 === 'number' || b0 instanceof FP_Decimal];
  }

  if (a0 instanceof FP_Quantity) {
    return [a0.comparable(b0)];
  }
  return [false];
};


module.exports = engine;
