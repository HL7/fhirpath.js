// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

const util = require("./utilities");
const {whereMacro, distinctFn} = require("./filtering");
const misc = require("./misc");
const hashObject = require('./hash-object');
const { deepEqual, maxCollSizeForDeepEqual } = require('./deep-equal');

const engine = {};
engine.emptyFn = util.isEmpty;

engine.notFn = function(coll) {
  let d = misc.singleton(coll, 'Boolean');
  return (typeof (d) === 'boolean') ? !d : [];
};

engine.existsMacro  = function(coll, expr) {
  if (expr) {
    const exprRes = whereMacro.call(this, coll, expr);
    if (exprRes instanceof Promise) {
      return exprRes.then(r => engine.existsMacro(r));
    }
    return engine.existsMacro(exprRes);
  }
  return !util.isEmpty(coll);
};

engine.allMacro = function(coll, expr) {
  const promises = [];
  for (let i=0, len=coll.length; i<len; ++i) {
    this.$index = i;
    const exprRes = expr(coll[i]);
    if (exprRes instanceof Promise) {
      promises.push(exprRes);
    } else if(!util.isTrue(exprRes)){
      return [false];
    }
  }
  if (promises.length) {
    return Promise.all(promises).then(r => r.some(i => !util.isTrue(i)) ? [false] : [true]);
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
  const coll1Length = coll1.length;
  const coll2Length = coll2.length;
  let rtn = coll1Length <= coll2Length;
  if (rtn) {
    if (coll1Length + coll2Length > maxCollSizeForDeepEqual) {
      // When we have more than maxCollSizeForDeepEqual items in input collections,
      // we use a hash table (on JSON strings) for efficiency.
      const c2Hash = coll2.reduce((hash, item) => {
        hash[hashObject(item)] = true;
        return hash;
      }, {});
      rtn = !coll1.some(item => !c2Hash[hashObject(item)]);
    } else {
      // Otherwise, it is more efficient to perform a deep comparison.
      for (let p=0, pLen=coll1.length; p<pLen && rtn; ++p) {
        let obj1 = util.valData(coll1[p]);
        rtn = coll2.some(obj2 => deepEqual(obj1, util.valData(obj2)));
      }
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
