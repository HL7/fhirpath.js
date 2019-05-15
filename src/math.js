// This file holds code to hande the FHIRPath Math functions.

/**
 *  Adds the math functions to the given FHIRPath engine.
 */

var engine = {};

function ensureNumberSingleton(x){
  if(x.length == 1 && typeof x[0] === "number") {
    return x[0];
  }
  throw new Error("Expected number, but got " + JSON.stringify(x));
}

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
    let num = ensureNumberSingleton(x);
    return Math.log(num);
  }else{
    return [];
  }
};

engine.baselog = function(x, base){
  let num = ensureNumberSingleton(x);
  return (Math.log(num) / Math.log(base));
};

module.exports = engine;
