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

engine.selectMacro = function(parentData, expr) {
  if(parentData !== false && ! parentData) { return []; }

  return util.flatten(parentData.map(function(x) {
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
    lres = util.flatten(expr(next));
    if(lres){
      res = res.concat(lres);
      items = items.concat(lres);
    }
  }
  return res;
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
