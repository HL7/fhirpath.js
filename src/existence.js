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

  var fnTable = engine.fnTable;
  fnTable.empty = engine.emptyFn;
  fnTable.not = engine.notFn;

}

module.exports = engineBuilder;
