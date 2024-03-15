// This file holds code to hande the FHIRPath Math functions.

const {FP_Quantity, FP_Type} = require('./types');
const util = require("./utilities");

/**
 *  Adds the math functions to the given FHIRPath engine.
 */
const engine = {};

/**
 * Checks if input collection is a number singleton and runs the passed function.
 * @param {Array<ResourceNode|number|any>} x - input collection
 * @param {Function} fn - math function
 * @throws Error
 * @return {number}
 */
function callFnForNumericSingleton(x, fn){
  let res;
  if (isEmpty(x)){
    res = [];
  } else if (x.length !== 1) {
    throw new Error("Unexpected collection" + JSON.stringify(x) +
      "; expected singleton of type number");
  } else {
    const num = util.valData(x[0]);
    if (num == null) {
      res = [];
    } else if (typeof num === 'number') {
      res = fn(num);
    } else {
      throw new Error("Expected number, but got " + JSON.stringify(num));
    }
  }
  return res;
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
  let res;
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    // In the future, this and other functions might need to return ResourceNode
    // to preserve the type information (integer vs decimal, and maybe decimal
    // vs string if decimals are represented as strings), in order to support
    // "as" and "is", but that support is deferred for now.
    if (x == null || y == null) {
      res = [];
    } else if (typeof x == "string" && typeof y == "string") {
      res = x + y;
    } else if(typeof x == "number") {
      if (typeof y == "number") {
        res = x + y;
      } else if (y instanceof FP_Quantity) {
        res = (new FP_Quantity(x, "'1'")).plus(y);
      }
    } else if(x instanceof FP_Type) {
      if (y instanceof FP_Quantity) {
        res = x.plus(y);
      } else if (y instanceof FP_Type) {
        res = y.plus(x);
      } else if (typeof y == "number") {
        res = x.plus(new FP_Quantity(y, "'1'"));
      }
    }
  }
  if (res === undefined) {
    throw new Error("Cannot " + JSON.stringify(xs) + " + " + JSON.stringify(ys));
  }
  return res;
};

engine.minus = function(xs, ys){
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    if (x == null || y == null) {
      return [];
    }
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
    if (x == null || y == null) {
      return [];
    }
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
    if (x == null || y == null) {
      return [];
    }
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
  } else if (x.length !== 1) {
    throw new Error("Unexpected collection" + JSON.stringify(x) +
      "; expected singleton of type number or Quantity");
  } else {
    var val = util.valData(x[0]);
    if (val == null) {
      res = [];
    } else if (typeof val === 'number') {
      res = Math.abs(val);
    } else if (val instanceof FP_Quantity) {
      res = new FP_Quantity(Math.abs(val.value), val.unit);
    } else {
      throw new Error("Expected number or Quantity, but got " + JSON.stringify(val || x));
    }
  }

  return res;
};

engine.ceiling = function(x) {
  return callFnForNumericSingleton(x, Math.ceil);
};

engine.exp = function(x){
  return callFnForNumericSingleton(x, Math.exp);
};

engine.floor = function(x){
  return callFnForNumericSingleton(x, Math.floor);
};

engine.ln = function(x){
  return callFnForNumericSingleton(x, Math.log);
};

engine.log = function(x, base){
  return callFnForNumericSingleton(x, (num) => {
    return (Math.log(num) / Math.log(base));
  });
};

engine.power = function(x, exponent){
  return callFnForNumericSingleton(x, (num) => {
    const res = Math.pow(num, exponent);
    return isNaN(res) ? [] : res;
  });
};

/**
 * Implements the "round" function documented at
 * https://hl7.org/fhirpath/#roundprecision-integer-decimal
 * @param {Array} x - input collection
 * @param {integer} [precision] - determines what decimal place to round to
 * @return {number}
 */
engine.round = function(x, precision){
  return callFnForNumericSingleton(x, (num) => {
    if (precision === undefined) {
      return (Math.round(num));
    } else {
      let degree = Math.pow(10, precision);
      return (Math.round(num * degree) / degree);
    }
  });
};

engine.sqrt = function(x){
  return callFnForNumericSingleton(x, (num) => {
    if (num < 0) {
      return [];
    } else {
      return Math.sqrt(num);
    }
  });
};

engine.truncate = function(x){
  return callFnForNumericSingleton(x, Math.trunc);
};

module.exports = engine;
