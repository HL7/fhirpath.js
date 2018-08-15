// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");

/**
 *  Adds the existence functions to the given FHIRPath engine.
 */
function engineBuilder(engine) {
  engine.emptyFn = function(x) {
    if(x){
      return [x.length == 0];
    } else {
      if(engine.isSome(x)){
        return [false];
      } else {
        return [true];
      }
    }
  };

  engine.notFn = function(x) {
    util.assertAtMostOne(x, "not");
    util.assertType(x, ["boolean"], "not");
    return [!x[0]];
  }

  engine.existsFn  = function(x, criteria) {
 //   TBD
 //   if (criteria)
 //     x = engine.whereMacro(ctx, x, node);
    return [engine.isSome(x)];
  };

  engine.allFn = function(x, criteria) {
    // TBD -- all(criteria)
    throw "TBD";
  }

  engine.allTrueFn  = function(x) {
    let rtn = true;
    for (let i=0, len=x.length; i<len && rtn; ++i) {
      util.assertType(x, ["boolean"], "allTrue");
      rtn = x[i] === true;
    }
    return rtn;
  };

  engine.anyTrueFn  = function(x) {
    let rtn = false;
    for (let i=0, len=x.length; i<len && !rtn; ++i) {
      util.assertType(x, ["boolean"], "anyTrue");
      rtn = x[i] === true;
    }
    return rtn;
  };

  engine.allFalseFn  = function(x) {
    let rtn = true;
    for (let i=0, len=x.length; i<len && rtn; ++i) {
      util.assertType(x, ["boolean"], "allFalse");
      rtn = x[i] === false;
    }
    return rtn;
  };

  engine.anyFalseFn  = function(x) {
    let rtn = false;
    for (let i=0, len=x.length; i<len && !rtn; ++i) {
      util.assertType(x, ["boolean"], "anyFalse");
      rtn = x[i] === false;
    }
    return rtn;
  };

  var fnTable = engine.fnTable;
  var existenceFns = ["empty", "not", "exists", "all", "allTrue", "anyTrue",
    'allFalse', 'anyTrue'];
  for (let i=0, len=existenceFns.length; i<len; ++i) {
    let name=existenceFns[i];
    fnTable[name] = engine[name+"Fn"];
  }
}

module.exports = engineBuilder;
