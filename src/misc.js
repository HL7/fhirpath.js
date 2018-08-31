
// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");

var engine = {};

engine.iifMacro = function(data, cond, ok, fail) {
  if(util.isTrue(cond(data))) {
    return ok(data);
  } else {
    return fail(data);
  }
};

engine.traceFn = function(x, label) {
  console.log("TRACE:[" + (label || "") + "]", JSON.stringify(x, null, " "));
  return x;
};

module.exports = engine;
