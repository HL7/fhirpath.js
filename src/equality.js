// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");
var deepEqual = require('./deep-equal');
const FP_Type = require('./types').FP_Type;

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

function typecheck(a, b){
  util.assertAtMostOne(a, "Singleton was expected");
  util.assertAtMostOne(b, "Singleton was expected");
  a = a[0];
  b = b[0];
  let lType = typeof a;
  let rType = typeof b;
  if (lType != rType || Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    util.raiseError('Type of "'+a+'" did not match type of "'+b+'"', 'InequalityExpression');
  }
}

engine.lt = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] instanceof FP_Type ? a[0].compare(b[0]) == -1 : a[0] < b[0];
};

engine.gt = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] instanceof FP_Type ? a[0].compare(b[0]) == 1 : a[0] > b[0];
};

engine.lte = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] instanceof FP_Type ? a[0].compare(b[0]) <= 0 : a[0] <= b[0];
};

engine.gte = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return a[0] instanceof FP_Type ? a[0].compare(b[0]) >= 0 : a[0] >= b[0];
};


module.exports = engine;
