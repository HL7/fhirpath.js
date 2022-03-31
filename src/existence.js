// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

const util = require("./utilities");
const {whereMacro, distinctFn} = require("./filtering");
const misc = require("./misc");
const deepEqual = require('./deep-equal');

const engine = {};
engine.emptyFn = util.isEmpty;

engine.notFn = function(coll) {
  let d = misc.singleton(coll, 'Boolean');
  return (typeof (d) === 'boolean') ? !d : [];
};

engine.existsMacro  = function(coll, expr) {
  var vec = coll;
  if (expr) {
    return engine.existsMacro(whereMacro(coll, expr));
  }
  return !util.isEmpty(vec);
};

engine.allMacro = function(coll, expr) {
  for (let i=0, len=coll.length; i<len; ++i) {
    this.$index = i;
    if(!util.isTrue(expr(coll[i]))){
      return [false];
    }
  }
  return [true];
};

engine.allTrueFn  = function(x) {
  let rtn = true;
  for (let i=0, len=x.length; i<len && rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "allTrue");
    rtn = xi === true;
  }
  return [rtn];
};

engine.anyTrueFn  = function(x) {
  let rtn = false;
  for (let i=0, len=x.length; i<len && !rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "anyTrue");
    rtn = xi === true;
  }
  return [rtn];
};

engine.allFalseFn  = function(x) {
  let rtn = true;
  for (let i=0, len=x.length; i<len && rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "allFalse");
    rtn = xi === false;
  }
  return [rtn];
};

engine.anyFalseFn  = function(x) {
  let rtn = false;
  for (let i=0, len=x.length; i<len && !rtn; ++i) {
    let xi = util.assertType(x[i], ["boolean"], "anyFalse");
    rtn = xi === false;
  }
  return [rtn];
};


/**
 *  Returns true if coll1 is a subset of coll2.
 */
function subsetOf(coll1, coll2) {
  let rtn = coll1.length <= coll2.length;
  if (rtn) {
    for (let p=0, pLen=coll1.length; p<pLen && rtn; ++p) {
      let obj1 = util.valData(coll1[p]);
      rtn = coll2.some(obj2 => deepEqual(obj1, util.valData(obj2)));
    }
  }
  return rtn;
}

engine.subsetOfFn = function(coll1, coll2) {
  return [subsetOf(coll1, coll2)];
};

engine.supersetOfFn = function(coll1, coll2) {
  return [subsetOf(coll2, coll1)];
};

engine.isDistinctFn = function(x) {
  return [x.length === distinctFn(x).length];
};

module.exports = engine;
