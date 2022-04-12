// This file holds code to hande the FHIRPath Combining functions.

const combineFns = {};
const {distinctFn} = require('./filtering');
const hashObject = require('./hash-object');

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
    let coll2hash = {};
    coll2.forEach(item => {
      const hash = hashObject(item);
      if (coll2hash[hash]) {
        uncheckedLength--;
      } else {
        coll2hash[hash] = true;
      }
    });

    for (let i=0; i<coll1Length && uncheckedLength > 0; ++i) {
      let item = coll1[i];
      let hash = hashObject(item);
      if (coll2hash[hash]) {
        result.push(item);
        coll2hash[hash] = false;
        uncheckedLength--;
      }
    }
  }

  return result;
};


module.exports = combineFns;
