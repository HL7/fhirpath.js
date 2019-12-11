
// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");
var types = require("./types");

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

var intRegex = /^[+-]?\d+$/;
engine.toInteger = function(coll){
  if(coll.length != 1) { return []; }
  var v = coll[0];
  if(v === false) {return 0;}
  if(v === true) {return 1;}
  if(typeof v === "number") {
    if(Number.isInteger(v)) {
      return v;
    } else {
      return [];
    }
  }
  if(typeof v === "string") {
    if(intRegex.test(v)){
      return parseInt(v);
    } else {
      throw new Error("Could not convert to ineger: " + v);
    }
  }
  return [];
};

var numRegex = /^[+-]?\d+(\.\d+)?$/;
engine.toDecimal = function(coll){
  if(coll.length != 1) { return []; }
  var v = coll[0];
  if(v === false) {return 0;}
  if(v === true) {return 1.0;}
  if(typeof v === "number") {
    return v;
  }
  if(typeof v === "string") {
    if(numRegex.test(v)){
      return Number.parseFloat(v);
    } else {
      throw new Error("Could not convert to decimal: " + v);
    }
  }
  return [];
};

engine.toString = function(coll){
  if(coll.length != 1) { return []; }
  var v = coll[0];
  return v.toString();
};


/**
 *  Defines a function on engine called to+timeType (e.g., toDateTime, etc.).
 * @param timeType The string name of a class for a time type (e.g. "FP_DateTime").
 */
function defineTimeConverter(timeType) {
  let timeName = timeType.slice(3); // Remove 'FP_'
  engine['to'+timeName] = function(coll) {
    var rtn = [];
    if (coll.length > 1)
      throw Error('to '+timeName+' called for a collection of length '+coll.length);
    if (coll.length === 1) {
      var t = types[timeType].checkString(util.valData(coll[0]));
      if (t)
        rtn[0] = t;
    }
    return rtn;
  };
}
defineTimeConverter('FP_DateTime');
defineTimeConverter('FP_Time');

module.exports = engine;
