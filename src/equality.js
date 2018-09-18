// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");
var deepEqual = require('./deep-equal');

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
  return !equality(a, b);
};
engine.equival = function(a, b){
  return equivalence(a, b);
};

engine.unequival = function(a, b){
  return !equivalence(a, b);
};

function typecheck(a, b){
  util.assertAtMostOne(a, "Singleton was expected");
  util.assertAtMostOne(b, "Singleton was expected");
  a = a[0];
  b = b[0];
  let lType = typeof a;
  let rType = typeof b;
  if (lType != rType) {
    util.raiseError('Type of "'+a+'" did not match type of "'+b+'"', 'InequalityExpression');
  }
}

engine.lt = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] < b[0];

};

engine.gt = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] > b[0];

};

engine.lte = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] <= b[0];
};

engine.gte = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] >= b[0];
};

function containsImpl(a,b){
  if(b.length == 0) { return true; }
  for(var i = 0; i < a.length; i++){
    if(deepEqual(a[i], b[0])) { return true; }
  }
  return false;
}

engine.contains = function(a, b){
  if(b.length > 1) {
    throw new Error("Expected singleton on right side of contains, got " + JSON.stringify(b));
  }
  return containsImpl(a,b);
};

engine.in = function(a, b){
  if(a.length > 1) {
    throw new Error("Expected singleton on right side of in, got " + JSON.stringify(b));
  }
  return containsImpl(b,a);
};

module.exports = engine;
