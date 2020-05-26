// Contains the FHIRPath Filtering and Projection functions.  (Section 5.2 of
// the FHIRPath 1.0.0 specification).

/**
 *  Adds the filtering and projection functions to the given FHIRPath engine.
 */
let util = require('./utilities');

var engine = {};
engine.whereMacro = function(parentData, expr) {
  if(parentData !== false && ! parentData) { return []; }

  return util.flatten(parentData.filter(function(x) {
    return expr(x)[0];
  }));
};

engine.selectMacro = function(data, expr) {
  if(data !== false && ! data) { return []; }
  return util.flatten(data.map(function(x) {
    return expr(x);
  }));
};

engine.repeatMacro = function(parentData, expr) {
  if(parentData !== false && ! parentData) { return []; }

  var res = [];
  var items = parentData;

  var next = null;
  var lres = null;
  while (items.length != 0) {
    next = items.shift();
    lres = expr(next);
    if(lres){
      res = res.concat(lres);
      items = items.concat(lres);
    }
  }
  return res;
};

//TODO: behavior on object?
engine.singleFn = function(x) {
  if(x.length == 1){
    return x;
  } else if (x.length == 0) {
    return [];
  } else {
    //TODO: should throw error?
    return {$status: "error", $error: "Expected single"};
  }
};


engine.firstFn = function(x) {
  return x[0];
};

engine.lastFn = function(x) {
  return x[x.length - 1];
};

engine.tailFn = function(x) {
  return x.slice(1, x.length);
};

engine.takeFn = function(x, n) {
  return x.slice(0, n);
};

engine.skipFn = function(x, num) {
  return x.slice(num, x.length);
};

function checkFHIRType(x, tp){
  if(typeof x === tp){
    return true;
  }
  if(tp === "integer") {
    return Number.isInteger(x);
  }
  if(tp === "decimal") {
    return typeof x == "number";
  }
  return false;
}
// naive typeof implementation
// understand only basic types like string, number etc
engine.ofTypeFn = function(coll, type) {
  return coll.filter(function(x){
    return checkFHIRType(util.valData(x), type);
  });
};


module.exports = engine;
