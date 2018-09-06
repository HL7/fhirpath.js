// This file holds code to hande the FHIRPath Combining functions.

var combineFns = {};
var existence = require('./existence');

combineFns.unionOp = function(coll1, coll2){
  return existence.distinctFn(coll1.concat(coll2));
};

combineFns.combineFn = function(coll1, coll2){
  return coll1.concat(coll2);
};


module.exports = combineFns;
