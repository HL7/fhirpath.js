// This file holds code to hande the FHIRPath Math functions.

const {FP_Quantity, FP_Type} = require('./types');
const util = require("./utilities");

/**
 *  Adds the math functions to the given FHIRPath engine.
 */
const engine = {};

function ensureNumberSingleton(x){
  let d = util.valData(x);
  if (typeof d !== 'number') {
    if (d.length === 1 && typeof (d=util.valData(d[0])) === 'number') {
      return d;
    }else{
      throw new Error("Expected number, but got " + JSON.stringify(d || x));
    }
  }
  else
    return d;
}

function ensureNumberOrQuantitySingleton(x){
  let d = util.valData(x);
  if (typeof d !== 'number' && !(d instanceof FP_Quantity)) {
    if (d.length === 1 && (typeof (d=util.valData(d[0])) === 'number' || d instanceof FP_Quantity) ) {
      return d;
    } else {
      throw new Error("Expected number or Quantity, but got " + JSON.stringify(d || x));
    }
  }
  else
    return d;
}

function isEmpty(x) {
  if(typeof(x) == 'number'){
    return false;
  }
  return x.length === 0;
}

engine.amp = function(x, y){
  return (x || "") + (y || "");
};

//HACK: for only polymorphic function
//  Actually, "minus" is now also polymorphic
engine.plus = function(xs, ys){
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    let res;
    let error = false;
    // In the future, this and other functions might need to return ResourceNode
    // to preserve the type information (integer vs decimal, and maybe decimal
    // vs string if decimals are represented as strings), in order to support
    // "as" and "is", but that support is deferred for now.
    if(typeof x == "string" && typeof y == "string") {
      res = x + y;
    } else if(typeof x == "number") {
      if (typeof y == "number") {
        res = x + y;
      } else if (y instanceof FP_Quantity) {
        res = (new FP_Quantity(x, "'1'")).plus(y);
      } else {
        error = true;
      }
    } else if(x instanceof FP_Type) {
      if (y instanceof FP_Quantity) {
        res = x.plus(y);
      } else if (y instanceof FP_Type) {
        res = y.plus(x);
      } else if (typeof y == "number") {
        res = x.plus(new FP_Quantity(y, "'1'"));
      } else {
        error = true;
      }
    } else {
      error = true;
    }
    if (!error) {
      return res;
    }
  }
  throw new Error("Cannot " + JSON.stringify(xs) + " + " + JSON.stringify(ys));
};

engine.minus = function(xs, ys){
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    if(typeof x == "number") {
      if (typeof y == "number") {
        return x - y;
      }
      if (y instanceof FP_Quantity) {
        return (new FP_Quantity(x, "'1'")).plus(new FP_Quantity(-y.value, y.unit));
      }
    }

    if(x instanceof FP_Type) {
      if (y instanceof FP_Quantity) {
        return x.plus(new FP_Quantity(-y.value, y.unit));
      }
      if (typeof y == "number") {
        return x.plus(new FP_Quantity(-y, "'1'"));
      }
    }
  }
  throw new Error("Cannot " + JSON.stringify(xs) + " - " + JSON.stringify(ys));
};


engine.mul = function(xs, ys){
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    if(typeof x == "number") {
      if (typeof y == "number") {
        return x * y;
      }
      if (y instanceof FP_Quantity) {
        return (new FP_Quantity(x, "'1'")).mul(y);
      }
    }

    if(x instanceof FP_Type) {
      if (y instanceof FP_Quantity) {
        return x.mul(y);
      }
      if (typeof y == 'number') {
        return x.mul(new FP_Quantity(y, "'1'"));
      }
    }
  }
  throw new Error("Cannot " + JSON.stringify(xs) + " * " + JSON.stringify(ys));
};

engine.div = function(xs, ys){
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    if(typeof x == "number") {
      if (typeof y == "number") {
        if (y === 0) return [];
        return x / y;
      }
      if (y instanceof FP_Quantity) {
        return (new FP_Quantity(x, "'1'")).div(y);
      }
    }

    if(x instanceof FP_Type) {
      if (y instanceof FP_Quantity) {
        return x.div(y);
      }
      if (typeof y == "number") {
        return x.div(new FP_Quantity(y, "'1'"));
      }
    }
  }
  throw new Error("Cannot " + JSON.stringify(xs) + " / " + JSON.stringify(ys));

};

engine.intdiv = function(x, y){
  if (y === 0) return [];
  return Math.floor(x / y);
};

engine.mod = function(x, y){
  if (y === 0) return [];
  return x % y;
};

engine.abs = function(x){
  let res;

  if (isEmpty(x)) {
    res = [];
  } else {
    const val = ensureNumberOrQuantitySingleton(x);
    if (val instanceof FP_Quantity) {
      res = new FP_Quantity(Math.abs(val.value), val.unit);
    } else {
      res = Math.abs(val);
    }
  }

  return res;
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
    if (num < 0 && (Math.floor(num2) !== num2)){
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
