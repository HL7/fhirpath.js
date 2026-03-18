// This file holds code to hande the FHIRPath Combining functions.

const combineFns = {};
const { distinctFn } = require('./filtering');
const hashObject = require('./hash-object');
const { deepEqual, maxCollSizeForDeepEqual } = require('./deep-equal');
const { TypeInfo } = require("./types");


/**
 * Returns the union of two collections, removing duplicates.
 * See https://hl7.org/fhirpath/#unionother-collection
 * @param {Array} coll1 - the first collection.
 * @param {Array} coll2 - the second collection.
 * @returns {Array} a collection containing all distinct items from both
 *   collections.
 */
combineFns.union = function(coll1, coll2){
  return distinctFn(coll1.concat(coll2));
};


/**
 * Returns the merge of two collections, preserving duplicates.
 * See https://hl7.org/fhirpath/#combineother-collection-collection
 * @param {Array} coll1 - the first collection.
 * @param {Array} coll2 - the second collection.
 * @returns {Array} a collection containing all items from both collections.
 */
combineFns.combineFn = function(coll1, coll2){
  return coll1.concat(coll2);
};


/**
 * Returns the intersection of two collections — items that appear in both.
 * Duplicates are eliminated from the result. For large collections without
 * primitive values, a hash-based approach is used for efficiency; otherwise,
 * deep equality comparison is used.
 * See https://hl7.org/fhirpath/#intersectother-collection-collection
 * @param {Array} coll1 - the first collection.
 * @param {Array} coll2 - the second collection.
 * @returns {Array} a collection containing distinct items present in both
 *   input collections.
 */
combineFns.intersect = function(coll1, coll2) {
  const ctx = this;
  let result = [];
  const coll1Length = coll1.length;
  let uncheckedLength = coll2.length;

  if (coll1Length && uncheckedLength) {
    const hasPrimitive = coll1.some(i => TypeInfo.isPrimitiveValue(i)) ||
      coll2.some(i => TypeInfo.isPrimitiveValue(i));
    if (!hasPrimitive && coll1Length + uncheckedLength > maxCollSizeForDeepEqual) {
      // When we have more than maxCollSizeForDeepEqual items in input collections,
      // we use a hash table (on JSON strings) for efficiency.
      let coll2hash = {};
      coll2.forEach(item => {
        const hash = hashObject(item);
        if (coll2hash[hash]) {
          uncheckedLength--;
        } else {
          coll2hash[hash] = true;
        }
      });

      for (let i = 0; i < coll1Length && uncheckedLength > 0; ++i) {
        let item = coll1[i];
        let hash = hashObject(item);
        if (coll2hash[hash]) {
          result.push(item);
          coll2hash[hash] = false;
          uncheckedLength--;
        }
      }
    } else {
      // Otherwise, it is more efficient to perform a deep comparison.
      result = distinctFn(coll1, hasPrimitive).filter(
        obj1 => coll2.some(obj2 => deepEqual(ctx, obj1, obj2))
      );
    }
  }

  return result;
};


/**
 * Returns items from the first collection that are not in the second.
 * For large collections without primitive values, a hash-based approach is
 * used for efficiency; otherwise, deep equality comparison is used.
 * See https://hl7.org/fhirpath/#excludeother-collection
 * @param {Array} coll1 - the source collection.
 * @param {Array} coll2 - the collection of items to exclude.
 * @returns {Array} items from coll1 that do not appear in coll2.
 */
combineFns.exclude = function(coll1, coll2) {
  let result = [];

  const coll1Length = coll1.length;
  const coll2Length = coll2.length;

  if (!coll2Length) {
    return coll1;
  }
  if (coll1Length) {
    const hasPrimitive = coll1.some(i => TypeInfo.isPrimitiveValue(i)) ||
      coll2.some(i => TypeInfo.isPrimitiveValue(i));

    if (!hasPrimitive && coll1Length + coll2Length > maxCollSizeForDeepEqual) {
      // When we have more than maxCollSizeForDeepEqual items in input collections,
      // we use a hash table (on JSON strings) for efficiency.
      let coll2hash = {};
      coll2.forEach(item => {
        const hash = hashObject(item);
        coll2hash[hash] = true;
      });

      result = coll1.filter(item => !coll2hash[hashObject(item)]);
    } else {
      const ctx = this;
      // Otherwise, it is more efficient to perform a deep comparison.
      result = coll1.filter(item => {
        return !coll2.some(item2 => deepEqual(ctx, item, item2));
      });
    }
  }

  return result;
};


module.exports = combineFns;
