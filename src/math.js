// This file holds code to hande the FHIRPath Math functions.

const {FP_Type, FP_Decimal} = require('./types');
const util = require("./utilities");

/**
 *  Adds the math functions to the given FHIRPath engine.
 */
const engine = {};


/**
 * Implements the FHIRPath `&` (string concatenation) operator.
 * Concatenates two string values, treating null/undefined as empty strings.
 * See https://hl7.org/fhirpath/#string-concatenation
 * @param {string|null} x - the left operand.
 * @param {string|null} y - the right operand.
 * @returns {string} the concatenated string.
 */
engine.amp = function(x, y){
  return (x || "") + (y || "");
};


/**
 * Implements the FHIRPath `+` (addition) operator.
 * Supports string concatenation, numeric addition (including BigInt and
 * FP_Decimal), and addition on FP_Type instances (e.g. FP_Quantity,
 * FP_DateTime).
 * See https://hl7.org/fhirpath/#addition
 * @param {Array} xs - the left operand collection (singleton).
 * @param {Array} ys - the right operand collection (singleton).
 * @returns {*|Array} the result of addition, or an empty array if either
 *   operand is null.
 * @throws {Error} if the operands are not singletons.
 */
engine.plus = function(xs, ys) {
  const ctx = this;
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    // In the future, this and other functions might need to return ResourceNode
    // to preserve the type information (integer vs decimal, and maybe decimal
    // vs string if decimals are represented as strings), in order to support
    // "as" and "is", but that support is deferred for now.
    if (x == null || y == null) {
      return [];
    }
    const typeOfX = typeof x;
    const typeOfY = typeof y;
    if (typeOfX === "string" && typeOfY === "string") {
      return x + y;
    }
    if (x instanceof FP_Type) {
      return x.plus(y);
    }

    if (y instanceof FP_Type) {
      return y.plus(x);
    }

    if (typeof typeOfX === 'bigint') {
      if (typeof typeOfY === 'bigint') {
        return x + y;
      }
      return ctx.getDecimal(y).plus(x);
    }
    return ctx.getDecimal(x).plus(y);
  }
  throw new Error("Cannot " + util.toJSON(xs) + " - " + util.toJSON(ys));
};


/**
 * Implements the FHIRPath `-` (subtraction) operator.
 * Supports numeric subtraction (including BigInt and FP_Decimal) and
 * subtraction on FP_Type instances (e.g. FP_Quantity, FP_DateTime).
 * See https://hl7.org/fhirpath/#subtraction
 * @param {Array} xs - the left operand collection (singleton).
 * @param {Array} ys - the right operand collection (singleton).
 * @returns {*|Array} the result of subtraction, or an empty array if either
 *   operand is null.
 * @throws {Error} if the operands are not singletons.
 */
engine.minus = function(xs, ys) {
  const ctx = this;
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    if (x == null || y == null) {
      return [];
    }
    if (x instanceof FP_Type) {
      return x.minus(y);
    }

    if (y instanceof FP_Type) {
      return y.negate().plus(x);
    }

    if (typeof x === 'bigint') {
      if (typeof y === 'bigint') {
        return x - y;
      }
      return ctx.getDecimal(y).negate().plus(x);
    }
    return ctx.getDecimal(x).minus(y);
  }
  throw new Error("Cannot " + util.toJSON(xs) + " - " + util.toJSON(ys));
};


/**
 * Implements the FHIRPath `*` (multiplication) operator.
 * Supports numeric multiplication (including BigInt and FP_Decimal) and
 * multiplication on FP_Type instances (e.g. FP_Quantity).
 * See https://hl7.org/fhirpath/#multiplication
 * @param {Array} xs - the left operand collection (singleton).
 * @param {Array} ys - the right operand collection (singleton).
 * @returns {*|Array} the result of multiplication, or an empty array if either
 *   operand is null.
 * @throws {Error} if the operands are not singletons.
 */
engine.mul = function(xs, ys){
  const ctx = this;
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    if (x == null || y == null) {
      return [];
    }
    if (x instanceof FP_Type) {
      return x.mul(y);
    }
    if (y instanceof FP_Type) {
      return y.mul(x);
    }

    if (typeof x === 'bigint') {
      if (typeof y === 'bigint') {
        return x * y;
      }
      return ctx.getDecimal(y).mul(x);
    }
    return ctx.getDecimal(x).mul(y);
  }

  throw new Error("Cannot " + util.toJSON(xs) + " * " + util.toJSON(ys));
};


/**
 * Implements the FHIRPath `/` (division) operator.
 * Supports numeric division (including FP_Decimal) and division on FP_Type
 * instances (e.g. FP_Quantity).
 * See https://hl7.org/fhirpath/#division
 * @param {Array} xs - the left operand collection (singleton).
 * @param {Array} ys - the right operand collection (singleton).
 * @returns {*|Array} the result of division, or an empty array if either
 *   operand is null.
 * @throws {Error} if the operands are not singletons.
 */
engine.div = function(xs, ys){
  const ctx = this;
  if(xs.length === 1 && ys.length === 1) {
    const x = util.valDataConverted(xs[0]);
    const y = util.valDataConverted(ys[0]);
    if (x == null || y == null) {
      return [];
    }
    if (x instanceof FP_Type) {
      return x.div(y);
    }
    return ctx.getDecimal(x).div(y);
  }
  throw new Error("Cannot " + util.toJSON(xs) + " / " + util.toJSON(ys));
};


/**
 * Implements the FHIRPath `div` (integer division) operator.
 * Returns the integer quotient of dividing x by y. Returns an empty array
 * if the divisor is zero.
 * See https://hl7.org/fhirpath/#integer-division
 * @param {number|BigInt|FP_Decimal} x - the dividend.
 * @param {number|BigInt|FP_Decimal} y - the divisor.
 * @returns {number|BigInt|FP_Decimal|Array} the integer quotient, or an empty
 *   array if the divisor is zero.
 */
engine.intdiv = function(x, y) {
  const ctx = this;
  const isDecimalDivider = y instanceof FP_Decimal;

  if (isDecimalDivider ? y.equals?.(0): (y === 0 || y === 0n)) return [];

  if (x instanceof FP_Decimal) {
    return x.divToInt(y);
  }

  if (typeof x === 'bigint') {
    if (typeof y === 'bigint') {
      return x / y;
    }
    if (isDecimalDivider && y.isInteger()) {
      return x / y.toBigInt();
    }
  }
  return ctx.getDecimal(x).divToInt(y);
};


/**
 * Implements the FHIRPath `mod` (modulo) operator.
 * Returns the remainder of dividing x by y. Returns an empty array if the
 * divisor is zero.
 * See https://hl7.org/fhirpath/#modular-arithmetic
 * @param {number|BigInt|FP_Decimal} x - the dividend.
 * @param {number|BigInt|FP_Decimal} y - the divisor.
 * @returns {number|BigInt|FP_Decimal|Array} the remainder, or an empty array
 *   if the divisor is zero.
 */
engine.mod = function(x, y){
  const ctx = this;
  const isDecimalDivider = y instanceof FP_Decimal;
  if (isDecimalDivider ? y.equals?.(0): (y === 0 || y === 0n)) return [];
  if(typeof x === 'bigint') {
    if (typeof y === 'bigint') {
      return x % y;
    }
    if (isDecimalDivider && y.isInteger()) {
      return x % y.toBigInt();
    }
  }
  return ctx.getDecimal(x).mod(y);
};

/**
 * Helper function for singleton math operations.
 * Validates input collection and delegates to a handler function for the actual operation.
 * @param {Array} x - input collection
 * @param {Function} handler - function that receives the value and returns the result
 * @param {string} expectedType - description of expected type for error messages
 * @returns {*|Array} - the result of the operation or empty array
 */
function callSingletonMethod(x, handler, expectedType) {
  if (x.length === 0) {
    return [];
  }
  if (x.length !== 1) {
    throw new Error("Unexpected collection" + util.toJSON(x) +
      "; expected " + expectedType);
  }
  const val = util.valData(x[0]);
  if (val == null) {
    return [];
  }
  return handler(val);
}


/**
 * Implements the FHIRPath `abs()` function.
 * Returns the absolute value of the input. Supports numbers, BigInt,
 * and FP_Type instances (e.g. FP_Decimal, FP_Quantity).
 * See https://hl7.org/fhirpath/#abs-integer-decimal-quantity
 * @param {Array} x - the input collection (singleton).
 * @returns {number|BigInt|FP_Type|Array} the absolute value, or an empty
 *   array if the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.abs = function(x){
  return callSingletonMethod(x, (val) => {
    const typeOfVal = typeof val;
    if (typeOfVal === 'number') {
      return Math.abs(val);
    } else if (typeOfVal === 'bigint') {
      return val < 0n ? -val : val;
    } else if (val instanceof FP_Type) {
      return val.abs();
    }
    throw new Error("Expected a number or a Quantity, but got " + util.toJSON(val ?? x));
  }, "a number or a Quantity");
};


/**
 * Implements the FHIRPath `ceiling()` function.
 * Returns the smallest integer greater than or equal to the input value.
 * Supports numbers and FP_Type instances (e.g. FP_Decimal, FP_Quantity).
 * See https://hl7.org/fhirpath/#ceiling-integer
 * @param {Array} x - the input collection (singleton).
 * @returns {number|FP_Type|Array} the ceiling value, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.ceiling = function(x) {
  return callSingletonMethod(x, (val) => {
    if (typeof val === 'number') {
      return Math.ceil(val);
    }
    if (val instanceof FP_Type) {
      return val.ceiling();
    }
    throw new Error("Expected a number or a Quantity, but got " + util.toJSON(val ?? x));
  }, "a number or a Quantity");
};


/**
 * Implements the FHIRPath `exp()` function.
 * Returns e raised to the power of the input value.
 * Supports FP_Decimal, numbers, and BigInt.
 * See https://hl7.org/fhirpath/#exp-decimal
 * @param {Array} x - the input collection (singleton).
 * @returns {FP_Decimal|Array} the result of e^x, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.exp = function(x){
  const ctx = this;
  return callSingletonMethod(x, (num) => {
    if (num instanceof FP_Decimal) {
      return num.exp();
    }
    const typeOfNum = typeof num;
    if (typeOfNum === 'number' || typeOfNum === 'bigint') {
      return ctx.getDecimal(num).exp();
    }
    throw new Error("Expected a number, but got " + util.toJSON(num ?? x));
  }, "a number");
};


/**
 * Implements the FHIRPath `floor()` function.
 * Returns the largest integer less than or equal to the input value.
 * Supports numbers and FP_Type instances (e.g. FP_Decimal, FP_Quantity).
 * See https://hl7.org/fhirpath/#floor-integer
 * @param {Array} x - the input collection (singleton).
 * @returns {number|FP_Type|Array} the floor value, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.floor = function(x) {
  return callSingletonMethod(x, (val) => {
    if (typeof val === 'number') {
      return Math.floor(val);
    }
    if (val instanceof FP_Type) {
      return val.floor();
    }
    throw new Error("Expected a number or a Quantity, but got " + util.toJSON(val ?? x));
  }, "a number or a Quantity");
};


/**
 * Implements the FHIRPath `ln()` function.
 * Returns the natural logarithm of the input value.
 * Supports FP_Decimal, numbers, and BigInt.
 * See https://hl7.org/fhirpath/#ln-decimal
 * @param {Array} x - the input collection (singleton).
 * @returns {FP_Decimal|Array} the natural logarithm, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.ln = function(x) {
  const ctx = this;
  return callSingletonMethod(x, (num) => {
    if (num instanceof FP_Decimal) {
      return num.ln();
    }
    const typeOfNum = typeof num;
    if (typeOfNum === 'number' || typeOfNum === 'bigint') {
      return ctx.getDecimal(num).ln();
    }
    throw new Error("Expected a number, but got " + util.toJSON(num ?? x));
  }, "a number");
};


/**
 * Implements the FHIRPath `log(base)` function.
 * Returns the logarithm of the input value with the given base.
 * Supports FP_Decimal, numbers, and BigInt.
 * See https://hl7.org/fhirpath/#logbase-decimal-decimal
 * @param {Array} x - the input collection (singleton).
 * @param {number|FP_Decimal} base - the logarithm base.
 * @returns {FP_Decimal|Array} the logarithm, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.log = function(x, base){
  const ctx = this;
  return callSingletonMethod(x, (num) => {
    if (num instanceof FP_Decimal) {
      return num.log(base);
    }
    const typeOfNum = typeof num;
    if (typeOfNum === 'number' || typeOfNum === 'bigint') {
      return ctx.getDecimal(num).log(base);
    }
    throw new Error("Expected a number, but got " + util.toJSON(num ?? x));
  }, "a number");
};


/**
 * Implements the FHIRPath `power(exponent)` function.
 * Returns the input value raised to the given exponent.
 * Supports FP_Decimal, numbers, and BigInt.
 * See https://hl7.org/fhirpath/#powerexponent-integer-decimal
 * @param {Array} x - the input collection (singleton).
 * @param {number|FP_Decimal} exponent - the exponent to raise the value to.
 * @returns {FP_Decimal|Array} the result of x^exponent, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.power = function(x, exponent){
  const ctx = this;
  return callSingletonMethod(x, (num) => {
    if (num instanceof FP_Decimal) {
      return num.power(exponent);
    }
    const typeOfNum = typeof num;
    if (typeOfNum === 'number' || typeOfNum === 'bigint') {
      return ctx.getDecimal(num).power(exponent);
    }
    throw new Error("Expected a number, but got " + util.toJSON(num ?? x));
  }, "a number");
};


/**
 * Implements the FHIRPath `round(precision)` function.
 * Rounds the input value to the specified number of decimal places.
 * Supports FP_Type instances (e.g. FP_Decimal, FP_Quantity), numbers,
 * and BigInt.
 * See https://hl7.org/fhirpath/#roundprecision-integer-decimal
 * @param {Array} x - the input collection (singleton).
 * @param {number} [precision] - the number of decimal places to round to.
 * @returns {number|FP_Type|Array} the rounded value, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.round = function(x, precision){
  const ctx = this;
  return callSingletonMethod(x, (val) => {
    if (val instanceof FP_Type) {
      return val.round(precision);
    }
    const typeOfNum = typeof val;
    if (typeOfNum === 'number' || typeOfNum === 'bigint') {
      return ctx.getDecimal(val).round(precision);
    }
    throw new Error("Expected a number or a Quantity, but got " + util.toJSON(val ?? x));
  }, "a number or a Quantity");
};


/**
 * Implements the FHIRPath `sqrt()` function.
 * Returns the square root of the input value.
 * Supports FP_Decimal, numbers, and BigInt.
 * See https://hl7.org/fhirpath/#sqrt-decimal
 * @param {Array} x - the input collection (singleton).
 * @returns {FP_Decimal|Array} the square root, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.sqrt = function(x){
  const ctx = this;
  return callSingletonMethod(x, (num) => {
    if (num instanceof FP_Decimal) {
      return num.sqrt();
    }
    const typeOfNum = typeof num;
    if (typeOfNum === 'number' || typeOfNum === 'bigint') {
      return ctx.getDecimal(num).sqrt();
    }
    throw new Error("Expected a number, but got " + util.toJSON(num ?? x));
  }, "a number");
};


/**
 * Implements the FHIRPath `truncate()` function.
 * Returns the integer part of the input value by removing any fractional
 * digits. Supports numbers, BigInt, and FP_Type instances (e.g. FP_Decimal,
 * FP_Quantity).
 * See https://hl7.org/fhirpath/#truncate-integer
 * @param {Array} x - the input collection (singleton).
 * @returns {number|FP_Type|Array} the truncated value, or an empty array if
 *   the input is empty or null.
 * @throws {Error} if the input is not a singleton or not a numeric type.
 */
engine.truncate = function(x){
  const ctx = this;
  return callSingletonMethod(x, (num) => {
    if (num instanceof FP_Type) {
      return num.truncate();
    }
    const typeOfNum = typeof num;
    if (typeOfNum === 'number' || typeOfNum === 'bigint') {
      return ctx.getDecimal(num).truncate();
    }
    throw new Error("Expected a number or a Quantity, but got " + util.toJSON(num ?? x));
  }, "a number or a Quantity");
};

module.exports = engine;
