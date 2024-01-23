// This file holds code to hande the FHIRPath Math functions.

const { deepEqual } = require('./deep-equal');

const engine = {};


// "b" is assumed to have one element and it tests whether "b[0]" is in "a"
function containsImpl(a,b){
  for(var i = 0; i < a.length; i++){
    if(deepEqual(a[i], b[0])) { return true; }
  }
  return false;
}

engine.contains = function(a, b){
  if(b.length == 0) { return []; }
  if(a.length == 0) { return false; }
  if(b.length > 1) {
    throw new Error("Expected singleton on right side of contains, got " + JSON.stringify(b));
  }
  return containsImpl(a,b);
};

engine.in = function(a, b){
  if(a.length == 0) { return []; }
  if(b.length == 0) { return false; }
  if(a.length > 1) {
    throw new Error("Expected singleton on right side of in, got " + JSON.stringify(b));
  }
  return containsImpl(b,a);
};

module.exports = engine;
