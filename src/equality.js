// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");
var deepEqual = require('./deep-equal');
var types = require('./types');
const FP_Type = types.FP_Type;
const FP_DateTime = types.FP_DateTime;
const FP_Time = types.FP_Time;

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

/**
 *  Checks that the types of a and b are suitable for comparison in an
 *  inequality expression.  It is assumed that a check has already been made
 *  that there is at least one value in a and b.
 * @param a the left side of the inequality expression (which should be an array of
 *  one value).
 * @param b the right side of the inequality expression (which should be an array of
 *  one value).
 * @return the singleton values of the arrays a, and b.  If one was an FP_Type
 *  and the other was convertible, the coverted value will be retureed.
 */
function typecheck(a, b){
  let rtn = null;
  util.assertAtMostOne(a, "Singleton was expected");
  util.assertAtMostOne(b, "Singleton was expected");
  a = util.valData(a[0]);
  b = util.valData(b[0]);
  let lClass = a.constructor;
  let rClass = b.constructor;
  if (lClass != rClass) {
    // See if one is an FPDateTime or FTTime while the other is a string.
    var d;
    if (lClass === String && (rClass === FP_DateTime || rClass === FP_Time)) {
      d = rClass.checkString(a);
      if (d)
        rtn = [d, b];
    }
    else if (rClass === String && (lClass===FP_DateTime || lClass===FP_Time)) {
      d = lClass.checkString(b);
      if (d)
        rtn = [a, d];
    }

    if (!rtn) {
      util.raiseError('Type of "'+a+'" ('+lClass.name+') did not match type of "'+
        b+'" ('+rClass.name+')', 'InequalityExpression');
    }
  }
  return rtn ? rtn : [a, b];
}

engine.lt = function(a, b){
  if (!a.length || !b.length) return [];
  var vals = typecheck(a,b);
  var a0 = vals[0];
  var b0 = vals[1];
  return a0 instanceof FP_Type ? a0.compare(b0) == -1 : a0 < b0;
};

engine.gt = function(a, b){
  if (!a.length || !b.length) return [];
  var vals = typecheck(a,b);
  var a0 = vals[0];
  var b0 = vals[1];
  return a0 instanceof FP_Type ? a0.compare(b0) == 1 : a0 > b0;
};

engine.lte = function(a, b){
  if (!a.length || !b.length) return [];
  var vals = typecheck(a,b);
  var a0 = vals[0];
  var b0 = vals[1];
  return a0 instanceof FP_Type ? a0.compare(b0) <= 0 : a0 <= b0;
};

engine.gte = function(a, b){
  if (!a.length || !b.length) return [];
  var vals = typecheck(a,b);
  var a0 = vals[0];
  var b0 = vals[1];
  return a0 instanceof FP_Type ? a0.compare(b0) >= 0 : a0 >= b0;
};


module.exports = engine;
