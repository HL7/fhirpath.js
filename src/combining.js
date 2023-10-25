// This file holds code to hande the FHIRPath Combining functions.

const combineFns = {};
const { distinctFn } = require('./filtering');
const hashObject = require('./hash-object');
const { deepEqual, maxCollSizeForDeepEqual } = require('./deep-equal');

combineFns.union = function(coll1, coll2){
  return distinctFn(coll1.concat(coll2));
};

combineFns.combineFn = function(coll1, coll2){
  return coll1.concat(coll2);
};

combineFns.intersect = function(coll1, coll2) {
  let result = [];
  const coll1Length = coll1.length;
  let uncheckedLength = coll2.length;

  if (coll1Length && uncheckedLength) {
    if (coll1Length + uncheckedLength > maxCollSizeForDeepEqual) {
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
      result = distinctFn(coll1).filter(
        obj1 => coll2.some(obj2 => deepEqual(obj1, obj2))
      );
    }
  }

  return result;
};


combineFns.exclude = function(coll1, coll2) {
  let result = [];

  const coll1Length = coll1.length;
  const coll2Length = coll2.length;

  if (!coll2Length) {
    return coll1;
  }
  if (coll1Length) {
    if (coll1Length + coll2Length > maxCollSizeForDeepEqual) {
      // When we have more than maxCollSizeForDeepEqual items in input collections,
      // we use a hash table (on JSON strings) for efficiency.
      let coll2hash = {};
      coll2.forEach(item => {
        const hash = hashObject(item);
        coll2hash[hash] = true;
      });

      result = coll1.filter(item => !coll2hash[hashObject(item)]);
    } else {
      // Otherwise, it is more efficient to perform a deep comparison.
      result = coll1.filter(item => {
        return !coll2.some(item2 => deepEqual(item, item2));
      });
    }
  }

  return result;
};


module.exports = combineFns;
