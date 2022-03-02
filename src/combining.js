// This file holds code to hande the FHIRPath Combining functions.

var combineFns = {};
var existence = require('./existence');

combineFns.union = function(coll1, coll2){
  return existence.distinctFn(coll1.concat(coll2));
};

combineFns.combineFn = function(coll1, coll2){
  return coll1.concat(coll2);
};

combineFns.intersect = function(coll1, coll2) {
  let result = [];
  if (coll1.length && coll2.length) {
    let coll2json = {};
    coll2.forEach(item => {
      coll2json[JSON.stringify(item)] = true;
    });

    for (let i=0, len=coll1.length; i<len; ++i) {
      let item = coll1[i];
      let json = JSON.stringify(item);
      if (coll2json[json]) {
        result.push(item);
        coll2json[json] = false;
      }
    }
  }

  return result;
};


module.exports = combineFns;
