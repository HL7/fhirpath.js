// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

const util = require("./utilities");
const {whereMacro, distinctFn} = require("./filtering");
const misc = require("./misc");
const hashObject = require('./hash-object');
const { deepEqual, maxCollSizeForDeepEqual } = require('./deep-equal');
const {TypeInfo} = require('./types');

const engine = {};

/**
 * Implements the FHIRPath `empty()` function.
 * Returns true if the input collection is empty.
 * See https://hl7.org/fhirpath/#empty-boolean
 * @param {Array} coll - the input collection.
 * @returns {boolean} true if the collection is empty, false otherwise.
 */
engine.emptyFn = util.isEmpty;


/**
 * Implements the FHIRPath `not()` function.
 * Returns the boolean negation of a singleton boolean collection.
 * See https://hl7.org/fhirpath/#not-boolean
 * @param {Array} coll - a singleton collection expected to contain a boolean.
 * @returns {boolean|Array} the negated boolean value, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the collection contains more than one item, or if
 *   the item is not a boolean.
 */
engine.notFn = function(coll) {
  let d = misc.singleton(coll, 'Boolean');
  return (typeof (d) === 'boolean') ? !d : [];
};


/**
 * Implements the FHIRPath `exists([criteria])` function.
 * Returns true if the collection has any elements, optionally filtered by
 * the given criteria expression.
 * See https://hl7.org/fhirpath/#existscriteria-expression-boolean
 * @param {Array} coll - the input collection.
 * @param {Function} [expr] - an optional filter expression (where-macro).
 * @returns {boolean|Promise<boolean>} true if the (filtered) collection is
 *   non-empty, false otherwise. Returns a Promise if the filter expression
 *   is asynchronous.
 */
engine.existsMacro  = function(coll, expr) {
  if (expr) {
    const exprRes = whereMacro.call(this, coll, expr);
    if (exprRes instanceof Promise) {
      return exprRes.then(r => engine.existsMacro(r));
    }
    return engine.existsMacro(exprRes);
  }
  return !util.isEmpty(coll);
};


/**
 * Implements the FHIRPath `all(criteria)` function.
 * Returns true if the given criteria expression evaluates to true for every
 * element in the collection.
 * See https://hl7.org/fhirpath/#allcriteria-expression-boolean
 * @param {Array} coll - the input collection.
 * @param {Function} expr - the criteria expression to evaluate for each element.
 * @returns {Array|Promise<Array>} [true] if the criteria holds for all elements,
 *   [false] otherwise. Returns a Promise if any expression evaluation is
 *   asynchronous.
 */
engine.allMacro = function(coll, expr) {
  const promises = [];
  for (let i=0, len=coll.length; i<len; ++i) {
    this.$index = i;
    const exprRes = expr(coll[i]);
    if (exprRes instanceof Promise) {
      promises.push(exprRes);
    } else if(!util.isTrue(exprRes)){
      return [false];
    }
  }
  if (promises.length) {
    return Promise.all(promises).then(r => r.some(i => !util.isTrue(i)) ? [false] : [true]);
  }
  return [true];
};


/**
 * Implements the FHIRPath `allTrue()` function.
 * Returns true if all items in the collection are boolean true.
 * See https://hl7.org/fhirpath/#alltrue-boolean
 * @param {Array} x - the input collection (each element must be a boolean).
 * @returns {Array} [true] if all elements are true, [false] otherwise.
 * @throws {Error} if any element is not a boolean.
 */
engine.allTrueFn  = function(x) {
  let rtn = true;
  for (let i=0, len=x.length; i<len && rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "allTrue");
    rtn = xi === true;
  }
  return [rtn];
};


/**
 * Implements the FHIRPath `anyTrue()` function.
 * Returns true if at least one item in the collection is boolean true.
 * See https://hl7.org/fhirpath/#anytrue-boolean
 * @param {Array} x - the input collection (each element must be a boolean).
 * @returns {Array} [true] if any element is true, [false] otherwise.
 * @throws {Error} if any element is not a boolean.
 */
engine.anyTrueFn  = function(x) {
  let rtn = false;
  for (let i=0, len=x.length; i<len && !rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "anyTrue");
    rtn = xi === true;
  }
  return [rtn];
};


/**
 * Implements the FHIRPath `allFalse()` function.
 * Returns true if all items in the collection are boolean false.
 * See https://hl7.org/fhirpath/#allfalse-boolean
 * @param {Array} x - the input collection (each element must be a boolean).
 * @returns {Array} [true] if all elements are false, [false] otherwise.
 * @throws {Error} if any element is not a boolean.
 */
engine.allFalseFn  = function(x) {
  let rtn = true;
  for (let i=0, len=x.length; i<len && rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "allFalse");
    rtn = xi === false;
  }
  return [rtn];
};


/**
 * Implements the FHIRPath `anyFalse()` function.
 * Returns true if at least one item in the collection is boolean false.
 * See https://hl7.org/fhirpath/#anyfalse-boolean
 * @param {Array} x - the input collection (each element must be a boolean).
 * @returns {Array} [true] if any element is false, [false] otherwise.
 * @throws {Error} if any element is not a boolean.
 */
engine.anyFalseFn  = function(x) {
  let rtn = false;
  for (let i=0, len=x.length; i<len && !rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "anyFalse");
    rtn = xi === false;
  }
  return [rtn];
};


/**
 * Tests whether coll1 is a subset of coll2 using deep equality comparison.
 * For large collections without primitive values, a hash-based approach is
 * used for efficiency; otherwise, deep equality comparison is used.
 * @param {Object} ctx - the FHIRPath evaluation context.
 * @param {Array} coll1 - the collection to test as a potential subset.
 * @param {Array} coll2 - the collection to test against.
 * @returns {boolean} true if every element in coll1 has a deep-equal match
 *   in coll2, false otherwise.
 */
function subsetOf(ctx, coll1, coll2) {
  const coll1Length = coll1.length;
  const coll2Length = coll2.length;
  let rtn = coll1Length <= coll2Length;
  if (rtn) {
    const hasPrimitive = coll1.some(i => TypeInfo.isPrimitiveValue(i)) ||
      coll2.some(i => TypeInfo.isPrimitiveValue(i));
    if (!hasPrimitive && coll1Length + coll2Length > maxCollSizeForDeepEqual) {
      // When we have more than maxCollSizeForDeepEqual items in input collections,
      // we use a hash table (on JSON strings) for efficiency.
      const c2Hash = coll2.reduce((hash, item) => {
        hash[hashObject(item)] = true;
        return hash;
      }, {});
      rtn = !coll1.some(item => !c2Hash[hashObject(item)]);
    } else {
      // Otherwise, it is more efficient to perform a deep comparison.
      for (let p=0, pLen=coll1.length; p<pLen && rtn; ++p) {
        let obj1 = util.valData(coll1[p]);
        rtn = coll2.some(obj2 => deepEqual(ctx, obj1, util.valData(obj2)));
      }
    }
  }
  return rtn;
}


/**
 * Implements the FHIRPath `subsetOf(other)` function.
 * Returns true if the input collection is a subset of the other collection.
 * See https://hl7.org/fhirpath/#subsetofother-collection-boolean
 * @param {Array} coll1 - the input collection.
 * @param {Array} coll2 - the collection to test against.
 * @returns {Array} [true] if coll1 is a subset of coll2, [false] otherwise.
 */
engine.subsetOfFn = function(coll1, coll2) {
  return [subsetOf(this, coll1, coll2)];
};


/**
 * Implements the FHIRPath `supersetOf(other)` function.
 * Returns true if the input collection is a superset of the other collection.
 * See https://hl7.org/fhirpath/#supersetofother-collection-boolean
 * @param {Array} coll1 - the input collection.
 * @param {Array} coll2 - the collection to test against.
 * @returns {Array} [true] if coll1 is a superset of coll2, [false] otherwise.
 */
engine.supersetOfFn = function(coll1, coll2) {
  return [subsetOf(this, coll2, coll1)];
};


/**
 * Implements the FHIRPath `isDistinct()` function.
 * Returns true if all items in the collection are distinct.
 * See https://hl7.org/fhirpath/#isdistinct-boolean
 * @param {Array} x - the input collection.
 * @returns {Array} [true] if all elements are distinct, [false] otherwise.
 */
engine.isDistinctFn = function(x) {
  return [x.length === distinctFn(x).length];
};

module.exports = engine;
