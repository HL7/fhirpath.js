// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");
var deepEqual = require('./deep-equal');

var engine = {};

function equality(x,y){
  if(util.isEmpty(x) || util.isEmpty(y)) { return []; }
  return [deepEqual(x, y)];
}

function equivalence(x,y){
  if(util.isEmpty(x) && util.isEmpty(y)) { return [true]; }
  if(util.isEmpty(x) || util.isEmpty(y)) { return []; }
  return [deepEqual(x, y, {fuzzy: true})];
}

engine.equal = function(a, b){
  return equality(a, b);
};

engine.unequal = function(a, b){
  var eq = equality(a, b);
  // TODO: imple utils not
  return eq.length == 1 ? [!eq[0]] : [];
};
engine.equival = function(a, b){
  return equivalence(a, b);
};

engine.unequival = function(a, b){
  var eq =  equivalence(a, b);
  return eq.length == 1 ? [!eq[0]] : [];
};

function typecheck(a, b){
  util.assertAtMostOne(a, "InequalityExpression");
  util.assertAtMostOne(b, "InequalityExpression");
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
  return [a[0] < b[0]];

};

engine.gt = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return [a[0] > b[0]];

};

engine.lte = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return [a[0] <= b[0]];

};

engine.gte = function(a, b){
  if (!a.length || !b.length) return [];
  typecheck(a,b);
  return [a[0] >= b[0]];
};


module.exports = engine;
