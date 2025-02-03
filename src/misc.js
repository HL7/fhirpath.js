
// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");
var types = require("./types");

const { FP_Quantity, TypeInfo } = types;

var engine = {};

engine.iifMacro = function(data, cond, ok, fail) {
  const condition = cond(data);
  if (condition instanceof Promise) {
    return condition.then(c => iifMacroSync(data, c, ok, fail));
  }
  return iifMacroSync(data, condition, ok, fail);
};

function iifMacroSync(data, condition, ok, fail) {
  if(util.isTrue(condition)) {
    return ok(data);
  } else {
    return fail ? fail(data) : [];
  }
}

engine.traceFn = function (x, label, expr) {
  const exprRes = expr ? expr(x) : null;
  if (exprRes instanceof Promise) {
    return exprRes.then((r) => engine.traceFn(x, label, r));
  }
  if (this.customTraceFn) {
    if (expr){
      this.customTraceFn(expr(x), label ?? "");
    }
    else {
      this.customTraceFn(x, label ?? "");
    }
  }
  else {
    if (expr){
      console.log("TRACE:[" + (label || "") + "]", JSON.stringify(expr(x), null, " "));
    }
    else {
      console.log("TRACE:[" + (label || "") + "]", JSON.stringify(x, null, " "));
    }
  }
  return x;
};

/**
 * Defines a variable named name that is accessible in subsequent expressions
 * and has the value of expr if present, otherwise the value of the input
 * collection.
 * @param {Array} x - the input collection on which the function is executed
 * @param {string} label - the name of the variable to define
 * @param {*} [expr] - an expression to run on the input collection
 * @returns the value of the input collection (The function should be transparent
 *  to the caller)
 */
engine.defineVariable = function (x, label, expr) {
  let data = x;
  if (expr){
    data = expr(x);
  }
  // Just in time initialization of definedVars
  if (!this.definedVars) this.definedVars = {};

  if (label in this.vars || label in this.processedVars) {
    throw new Error("Environment Variable %" + label + " already defined");
  }

  if (Object.keys(this.definedVars).includes(label)) {
    throw new Error("Variable %" + label + " already defined");
  }

  this.definedVars[label] = data;
  return x;
};

var intRegex = /^[+-]?\d+$/;
engine.toInteger = function(coll){
  if(coll.length !== 1) { return []; }
  var v = util.valData(coll[0]);
  if(v === false) {return 0;}
  if(v === true) {return 1;}
  if(typeof v === "number") {
    if(Number.isInteger(v)) {
      return v;
    } else {
      return [];
    }
  }
  if(typeof v === "string" && intRegex.test(v)) {
    return parseInt(v);
  }
  return [];
};

const quantityRegex = /^((\+|-)?\d+(\.\d+)?)\s*(('[^']+')|([a-zA-Z]+))?$/,
  quantityRegexMap = {value:1,unit:5,time:6};
engine.toQuantity = function (coll, toUnit) {
  let result;

  if (coll.length > 1) {
    throw new Error("Could not convert to quantity: input collection contains multiple items");
  } else if (coll.length === 1) {
    if (toUnit) {
      const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
      const toUnitInSeconds = FP_Quantity._calendarDuration2Seconds[toUnit];
      if (
        !thisUnitInSeconds !== !toUnitInSeconds &&
        (thisUnitInSeconds > 1 || toUnitInSeconds > 1)
      ) {
        // Conversion from calendar duration quantities greater than seconds to
        // time-valued UCUM quantities greater than seconds or vice versa is not
        // allowed.
        return null;
      }

      // Surround UCUM unit code in the toUnit parameter with single quotes
      if (!FP_Quantity.mapTimeUnitsToUCUMCode[toUnit]) {
        toUnit = `'${toUnit}'`;
      }
    }

    var v = util.valDataConverted(coll[0]);
    let quantityRegexRes;

    if (typeof v === "number") {
      result = new FP_Quantity(v, '\'1\'');
    } else if (v instanceof FP_Quantity) {
      result = v;
    } else if (typeof v === 'boolean') {
      result = new FP_Quantity(v ? 1 : 0, '\'1\'');
    } else if (typeof v === "string" && (quantityRegexRes = quantityRegex.exec(v)) ) {
      const value = quantityRegexRes[quantityRegexMap.value],
        unit = quantityRegexRes[quantityRegexMap.unit],
        time = quantityRegexRes[quantityRegexMap.time];

      // UCUM unit code in the input string must be surrounded with single quotes
      if (!time || FP_Quantity.mapTimeUnitsToUCUMCode[time]) {
        result = new FP_Quantity(Number(value), unit || time || '\'1\'');
      }
    }

    if (result && toUnit && result.unit !== toUnit) {
      result = FP_Quantity.convUnitTo(result.unit, result.value, toUnit);
    }
  }

  return result || [];
};

var numRegex = /^[+-]?\d+(\.\d+)?$/;
engine.toDecimal = function(coll){
  if(coll.length !== 1) { return []; }
  var v = util.valData(coll[0]);
  if(v === false) {return 0;}
  if(v === true) {return 1.0;}
  if(typeof v === "number") {
    return v;
  }
  if(typeof v === "string" && numRegex.test(v)) {
    return parseFloat(v);
  }
  return [];
};

engine.toString = function(coll){
  if(coll.length !== 1) { return []; }
  var v = util.valDataConverted(coll[0]);
  if (v == null) { return []; }
  return v.toString();
};


/**
 *  Defines a function on engine called to+timeType (e.g., toDateTime, etc.).
 * @param timeType The string name of a class for a time type (e.g. "FP_DateTime").
 */
function defineTimeConverter(timeType) {
  let timeName = timeType.slice(3); // Remove 'FP_'
  engine['to'+timeName] = function(coll) {
    var rtn = [];
    if (coll.length > 1)
      throw Error('to '+timeName+' called for a collection of length '+coll.length);
    if (coll.length === 1) {
      var v = util.valData(coll[0]);
      if (typeof v === "string") {
        var t = types[timeType].checkString(v);
        if (t) {
          rtn = t;
        }
      }
    }
    return rtn;
  };
}
defineTimeConverter('FP_Date');
defineTimeConverter('FP_DateTime');
defineTimeConverter('FP_Time');

// Possible string values convertible to the true boolean value
const trueStrings = ['true', 't', 'yes', 'y', '1', '1.0'].reduce((acc, val) => {
  acc[val] = true;
  return acc;
}, {});

// Possible string values convertible to the false boolean value
const falseStrings = ['false', 'f', 'no', 'n', '0', '0.0'].reduce((acc, val) => {
  acc[val] = true;
  return acc;
}, {});

engine.toBoolean = function (coll) {
  if(coll.length !== 1) {
    return [];
  }

  const v = util.valData(coll[0]);
  switch (typeof v) {
    case 'boolean':
      return v;
    case 'number':
      if (v === 1) {
        return true;
      }
      if (v === 0) {
        return false;
      }
      break;
    case 'string':
      // eslint-disable-next-line no-case-declarations
      const lowerCaseValue = v.toLowerCase();
      if (trueStrings[lowerCaseValue]) {
        return true;
      }
      if (falseStrings[lowerCaseValue]) {
        return false;
      }
  }
  return [];
};

/**
 * Creates function that checks if toFunction returns specified type
 * @param {function(coll: array): <type|[]>} toFunction
 * @param {string|class} type - specifies type, for example: 'string' or FP_Quantity
 * @return {function(coll: array)}
 */
engine.createConvertsToFn = function (toFunction, type) {
  if (typeof type === 'string') {
    return function (coll) {
      if (coll.length !== 1) {
        return [];
      }

      return typeof toFunction(coll) === type;
    };
  }

  return function (coll) {
    if (coll.length !== 1) {
      return [];
    }

    return toFunction(coll) instanceof type;
  };
};

const singletonEvalByType = {
  "Integer": function(d){
    if (Number.isInteger(d)) {
      return d;
    }
  },
  "Boolean": function(d){
    if (d === true || d === false) {
      return d;
    } else {
      return true;
    }
  },
  "Number": function(d) {
    if (typeof d === "number") {
      return d;
    }
  },
  "String": function(d){
    if (typeof d === "string") {
      return d;
    }
  },
  "StringOrNumber": function(d){
    if (typeof d === "string" || typeof d === "number") {
      return d;
    }
  },
  "AnySingletonAtRoot": function (d) {
    return d;
  }
};

/**
 * Converts a collection to a singleton of the specified type.
 * The result can be an empty array if input collection is empty.
 * See http://hl7.org/fhirpath/#singleton-evaluation-of-collections for details.
 * @param {Array} coll - collection
 * @param {string} type - 'Integer', 'Boolean', 'Number' or 'String'
 * @throws {Error}  if there is more than one item in input collection,
 *   or an item that is not a specified type
 * @return {*|[]} the value of specified type or empty array
 */
engine.singleton = function (coll, type) {
  if(coll.length > 1){
    throw new Error("Unexpected collection" + JSON.stringify(coll) +
      "; expected singleton of type " + type);
  } else if (coll.length === 0) {
    return [];
  }
  const v = util.valData(coll[0]);
  if (v == null) {
    return [];
  }
  const toSingleton = singletonEvalByType[type];
  if (toSingleton) {
    const value = toSingleton(v);
    if (value !== undefined) {
      return value;
    }
    throw new Error(`Expected ${type.toLowerCase()}, but got: ${JSON.stringify(coll)}`);
  }
  throw new Error('Not supported type ' + type);
};

engine.hasValueFn = function(coll) {
  return coll.length === 1 && util.valData(coll[0]) != null
    && TypeInfo.isPrimitive(TypeInfo.fromValue(coll[0]));
};

/**
 * Returns the underlying system value for the FHIR primitive if the input
 * collection contains a single value which is a FHIR primitive, and it has a
 * primitive value. Otherwise, the return value is empty (i.e. []).
 *
 * See: https://hl7.org/fhir/fhirpath.html#functions
 * @param {Array<*>} coll - input collection
 * @returns {*|[]}
 */
engine.getValueFn = function(coll) {
  if (coll.length === 1) {
    const node = coll[0];
    const v = util.valData(node);
    if (v != null && TypeInfo.isPrimitive(TypeInfo.fromValue(node))) {
      return v;
    }
  }
  return [];
};

module.exports = engine;
