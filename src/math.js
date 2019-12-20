// This file holds code to hande the FHIRPath Math functions.

var types = require('./types');
let {FP_TimeBase, FP_Quantity} = types;
const util = require("./utilities");

/**
 *  Adds the math functions to the given FHIRPath engine.
 */

var engine = {};

function ensureNumberSingleton(x){
  let d = util.valData(x);
  if (typeof d !== 'number') {
    if (d.length == 1 && typeof (d=util.valData(d[0])) === 'number') {
      return d;
    }else{
      throw new Error("Expected number, but got " + JSON.stringify(d || x));
    }
  }
  else
    return d;
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
//  Actually, "minus" is now also polymorphic
engine.plus = function(xs, ys){
  if(xs.length == 1 && ys.length == 1) {
    var x = util.valData(xs[0]);
    var y = util.valData(ys[0]);
    // In the future, this and other functions might need to return ResourceNode
    // to preserve the type information (integer vs decimal, and maybe decimal
    // vs string if decimals are represented as strings), in order to support
    // "as" and "is", but that support is deferred for now.
    if(typeof x == "string" && typeof y == "string") {
      return x + y;
    }
    if(typeof x == "number" && typeof y == "number") {
      return x + y;
    }
    if(x instanceof FP_TimeBase && y instanceof FP_Quantity) {
      return x.plus(y);
    }
  }
  throw new Error("Cannot " + JSON.stringify(xs) + " + " + JSON.stringify(ys));
};

engine.minus = function(xs, ys){
  if(xs.length == 1 && ys.length == 1) {
    var x = util.valData(xs[0]);
    var y = util.valData(ys[0]);
    if(typeof x == "number" && typeof y == "number")
      return x - y;
    if(x instanceof FP_TimeBase && y instanceof FP_Quantity)
      return x.plus(new FP_Quantity(-y.value, y.unit));
  }
  throw new Error("Cannot " + JSON.stringify(xs) + " - " + JSON.stringify(ys));
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
    return Math.abs(num);
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

engine.power = function(x, degree){
  if (isEmpty(x) || isEmpty(degree)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    let num2 = ensureNumberSingleton(degree);
    if (num < 0 && (Math.floor(num2) != num2)){
      return [];
    }else{
      return Math.pow(num, num2);
    }
  }
};

engine.round = function(x, acc){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    if (isEmpty(acc)){
      return (Math.round(num));
    }else{
      let num2 = ensureNumberSingleton(acc);
      let degree = Math.pow(10, num2);
      return (Math.round(num * degree) / degree);
    }
  }
};

engine.sqrt = function(x){
  if (isEmpty(x)){
    return [];
  }else{
    let num = ensureNumberSingleton(x);
    if (num < 0) {
      return [];
    }else{
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
