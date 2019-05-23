// This file holds code to hande the FHIRPath Math functions.

/**
 *  Adds the math functions to the given FHIRPath engine.
 */

var engine = {};

function ensureNumberSingleton(x){
  if (typeof x != 'number'){
    if (x.length == 1){
      return x[0];
    }else{
      throw new Error("Expected number, but got " + JSON.stringify(x));
    }
  }else{
    return x;
  }
}

function isEmpty(x) {
  if(typeof(x) == 'number'){
    return false;
  }
  return x.length == 0;
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

engine.abs = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    if (typeof num != 'number'){
      return num;
    }else{
      return Math.abs(num);
    }
  }
};

engine.ceiling = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    return Math.ceil(num);
  }
};

engine.exp = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    return Math.exp(num);
  }
};

engine.floor = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    return Math.floor(num);
  }
};

engine.ln = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    return Math.log(num);
  }
};

engine.log = function(x, base){
  if (isEmpty(x) || isEmpty(base)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    let num2 = ensureNumberSingleton(base);
    return (Math.log(num) / Math.log(num2));
  }
};

engine.sqrt = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    if (x < 0){
      return [];
    }else{
      let num = ensureNumberSingleton(x);
      return Math.sqrt(num);
    }
  }
};

engine.truncate = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    return Math.trunc(num);
  }
};

module.exports = engine;
