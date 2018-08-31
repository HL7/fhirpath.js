// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");

/**
 *  Adds the existence functions to the given FHIRPath engine.
 */
var engine = {};
engine.emptyFn = function(x) {
  if(x){
    return [x.length == 0];
  } else {
    if(util.isSome(x)){
      return [false];
    } else {
      return [true];
    }
  }
};

engine.notFn = function(x) {
  return (x.length === 1 && typeof x[0] === 'boolean') ? [!x[0]] : [];
};

engine.existsMacro  = function(coll, expr) {
  var vec = coll;
  if (expr) {
    vec = coll.filter(function(x){
      //FIXME: i do not like this logic
      var res = expr(x);
      return util.isFalse(res) ? false : util.isSome(res);
    });
  }
  return [!util.isEmpty(vec)];
};

engine.allMacro = function(coll, expr) {
  let rtn = true;
  for (let i=0, len=coll.length; i<len && rtn; ++i) {
    if(!util.isTrue(expr(coll[i]))){
      return [false];
    }
  }
  return [rtn];
};

engine.allTrueFn  = function(x) {
  let rtn = true;
  for (let i=0, len=x.length; i<len && rtn; ++i) {
    util.assertType(x[i], ["boolean"], "allTrue");
    rtn = x[i] === true;
  }
  return [rtn];
};

engine.anyTrueFn  = function(x) {
  let rtn = false;
  for (let i=0, len=x.length; i<len && !rtn; ++i) {
    util.assertType(x[i], ["boolean"], "anyTrue");
    rtn = x[i] === true;
  }
  return [rtn];
};

engine.allFalseFn  = function(x) {
  let rtn = true;
  for (let i=0, len=x.length; i<len && rtn; ++i) {
    util.assertType(x[i], ["boolean"], "allFalse");
    rtn = x[i] === false;
  }
  return [rtn];
};

engine.anyFalseFn  = function(x) {
  let rtn = false;
  for (let i=0, len=x.length; i<len && !rtn; ++i) {
    util.assertType(x[i], ["boolean"], "anyFalse");
    rtn = x[i] === false;
  }
  return [rtn];
};


/**
 *  Returns true if coll1 is a subset of coll2.
 */
function subsetOf(coll1, coll2) {
  let rtn = coll1.length <= coll2.length;
  if (rtn) {
    // This requires a deep-equals comparision of every object in coll1,
    // against each objectin coll2.
    // Optimize by building a hashmap of JSON versions of the objects.
    var c2Hash = {};
    for (let p=0, pLen=coll1.length; p<pLen && rtn; ++p) {
      let obj1 = coll1[p];
      let obj1Str = JSON.stringify(obj1);
      let found = false;
      if (p===0) { // c2Hash is not yet built
        for (let i=0, len=coll2.length; i<len; ++i) {
          // No early return from this loop, because we're building c2Hash.
          let obj2 = coll2[i];
          let obj2Str = JSON.stringify(obj2);
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
    return [x.length];
  } else {
    return [0];
  }
};


module.exports = engine;
