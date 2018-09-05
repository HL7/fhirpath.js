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
  if (x && x.length) {
    if(x.length == 1){
      return x;
    } else if (x.length == 0) {
      return [];
    } else {
      //TODO: should throw error?
      return {$status: "error", $error: "Expected single"};
    }
  } else {
    return [];
  }
};


engine.firstFn = function(x) {
  if(util.isSome(x)){
    if(x.length){
      return [x[0]];
    } else {
      return x;
    }
  } else {
    return [];
  }
};

engine.lastFn = function(x) {
  if(util.isSome(x)){
    if(x.length){
      return [x[x.length - 1]];
    } else {
      return x;
    }
  } else {
    return [];
  }
};

engine.tailFn = function(x) {
  if(util.isSome(x)){
    if(x.length){
      return x.slice(1, x.length);
    } else {
      return [x];
    }
  } else {
    return [];
  }
};

engine.takeFn = function(x, n) {
  if(util.isSome(x)){
    if(x.length){
      return x.slice(0, n);
    } else {
      return [x];
    }
  } else {
    return [];
  }
};

engine.skipFn = function(x, num) {
  if(Array.isArray(x)){
    if(x.length >= num){
      return x.slice(num, x.length);
    } else {
      return [];
    }
  } else {
    return [];
  }
};

/*
 *  TBD
 engine.ofTypeFn = function(parentData, type) {
 let rtn = [];
 for (let i=0, len=parentData.length; i<len && rtn; ++i) {
 switch(type) {
 }
 }
 return rtn;
 }
*/


module.exports = engine;
