// This file holds code to hande the FHIRPath Math functions.

/**
 *  Adds the math functions to the given FHIRPath engine.
 */

var engine = {};

engine.amp = function(x, y){
  return (x || "") + (y || "");
};

//HACK: for only polymorphic function
engine.plus = function(xs, ys){
  if(xs.length == 1 && ys.length == 1) {
    var x = xs[0];
    var y = ys[0];
    if(typeof x == "string" && typeof y == "string") {
      return x + y;
    }
    if(typeof x == "number" && typeof y == "number") {
      return x + y;
    }
  }
  throw new Error("Can not " + JSON.stringify(xs) + " + " + JSON.stringify(ys));
};

engine.minus = function(x, y){
  return x - y;
};


engine.mul = function(x, y){
  return x * y;
};

engine.div = function(x, y){
  return x / y;
};

engine.intdiv = function(x, y){
  return Math.floor(x / y);
};

engine.mod = function(x, y){
  return x % y;
};

engine.natlog = function(x){
  if (x.length > 0){
    return Math.log(x);
  }else{
    return [];
  }
};

engine.baselog = function(x, y){
  return (Math.log(x) / Math.log(y));
};

module.exports = engine;
