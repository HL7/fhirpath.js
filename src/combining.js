// This file holds code to hande the FHIRPath Combining functions.

const combineFns = {};
const {distinctFn} = require('./filtering');
const deepEqual = require('./deep-equal');

combineFns.union = function(coll1, coll2){
  return distinctFn(coll1.concat(coll2));
};

combineFns.combineFn = function(coll1, coll2){
  return coll1.concat(coll2);
};

combineFns.intersect = function(coll1, coll2) {
  let result = [];
  if (coll1.length && coll2.length) {
    result = distinctFn(coll1).filter(
      obj1 => coll2.some(obj2 => deepEqual(obj1, obj2))
    );
  }

  return result;
};


module.exports = combineFns;
