// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");
var filtering = require("./filtering");

var engine = {};
engine.emptyFn = util.isEmpty;

engine.notFn = function(x) {
  let d;
  return (x.length === 1 && typeof (d=util.valData(x[0])) === 'boolean') ? !d : [];
};

engine.existsMacro  = function(coll, expr) {
  var vec = coll;
  if (expr) {
    return engine.existsMacro(filtering.whereMacro(coll, expr));
  }
  return !util.isEmpty(vec);
};

engine.allMacro = function(coll, expr) {
  for (let i=0, len=coll.length; i<len; ++i) {
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
 *  Returns a JSON version of the given object, but with keys of the object in
 *  sorted order (or at least a stable order).
 *  From: https://stackoverflow.com/a/35810961/360782
 */
function orderedJsonStringify(obj) {
  return JSON.stringify(sortObjByKey(obj));
}

/**
 *  If given value is an object, returns a new object with the properties added
 *  in sorted order, and handles nested objects.  Otherwise, returns the given
 *  value.
 *  From: https://stackoverflow.com/a/35810961/360782
 */
function sortObjByKey(value) {
  return (typeof value === 'object') ?
    (Array.isArray(value) ?
      value.map(sortObjByKey) :
      Object.keys(value).sort().reduce(
        (o, key) => {
          const v = value[key];
          o[key] = sortObjByKey(v);
          return o;
        }, {})
    ) :
    value;
}


/**
 *  Returns true if coll1 is a subset of coll2.
 */
function subsetOf(coll1, coll2) {
  let rtn = coll1.length <= coll2.length;
  if (rtn) {
    // This requires a deep-equals comparision of every object in coll1,
    // against each object in coll2.
    // Optimize by building a hashmap of JSON versions of the objects.
    var c2Hash = {};
    for (let p=0, pLen=coll1.length; p<pLen && rtn; ++p) {
      let obj1 = util.valData(coll1[p]);
      let obj1Str = orderedJsonStringify(obj1);
      let found = false;
      if (p===0) { // c2Hash is not yet built
        for (let i=0, len=coll2.length; i<len; ++i) {
          // No early return from this loop, because we're building c2Hash.
          let obj2 = util.valData(coll2[i]);
          let obj2Str = orderedJsonStringify(obj2);
          c2Hash[obj2Str] = obj2;
          found = found || (obj1Str === obj2Str);
        }
      }
      else
        found = !!c2Hash[obj1Str];
      rtn = found;
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
  return [x.length === engine.distinctFn(x).length];
};

engine.distinctFn = function(x) {
  let unique = [];
  // Since this requires a deep equals, use a hash table (on JSON strings) for
  // efficiency.
  if (x.length > 0) {
    let uniqueHash = {};
    for (let i=0, len=x.length; i<len; ++i) {
      let xObj = x[i];
      let xStr = JSON.stringify(xObj);
      let uObj = uniqueHash[xStr];
      if (uObj === undefined) {
        unique.push(xObj);
        uniqueHash[xStr] = xObj;
      }
    }
  }
  return unique;
};

engine.countFn = function(x) {
  if (x && x.length) {
    return x.length;
  } else {
    return 0;
  }
};


module.exports = engine;
