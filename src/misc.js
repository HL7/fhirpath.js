
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
      console.log("TRACE:[" + (label || "") + "]", util.toJSON(expr(x), null, " "));
    }
    else {
      console.log("TRACE:[" + (label || "") + "]", util.toJSON(x, null, " "));
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


/**
 * Checks if the input collection is a singleton (contains exactly one item).
 * Throws an error if the collection contains more than one item.
 *
 * @param {Array} coll - The input collection to check.
 * @param {string} fnName - The name of the calling function, used in the error message.
 * @return {boolean} - Returns true if the input collection has only one item,
 *  false - if the input collection has no items.
 * @throws {Error} - Throws an error if the input collection contains more than one item
 */
function checkSingleton(coll, fnName) {
  if (coll.length > 1) {
    util.raiseError('The input collection contains multiple items', fnName);
  }
  return coll.length === 1;
}

var intRegex = /^[+-]?\d+$/;
engine.toInteger = function(coll){
  let rtn;
  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function.
  if (checkSingleton(coll, 'toInteger')) {
    const v = util.valData(coll[0]);
    if (v === false) {
      rtn = 0;
    } else if (v === true) {
      rtn = 1;
    } else {
      const type = typeof v;
      if (type === "bigint") {
        // See the table of the possible conversions supported:
        // https://build.fhir.org/ig/HL7/FHIRPath/#conversion
        rtn = Number(v);
      } else if (type === "number") {
        if (Number.isInteger(v)) {
          rtn = v;
        }
      } else if (type === "string" && intRegex.test(v)) {
        rtn = parseInt(v);
      }
    }
  }
  return rtn;
};


engine.toLong = function(coll){
  let rtn;
  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function.
  if (checkSingleton(coll, 'toLong')) {
    const v = util.valData(coll[0]);

    if (v === false) {
      rtn = 0n;
    } else if (v === true) {
      rtn = 1n;
    } else {
      const type = typeof v;
      if (type === "bigint") {
        rtn = v;
      } else if (type === "number") {
        if (Number.isInteger(v)) {
          rtn = BigInt(v);
        }
      } else if (type === "string" && intRegex.test(v)) {
        rtn = BigInt(v);
      }
    }
  }
  return rtn;
};

const quantityRegex = /^((\+|-)?\d+(\.\d+)?)\s*(('[^']+')|([a-zA-Z]+))?$/,
  quantityRegexMap = {value:1,unit:5,time:6};
engine.toQuantity = function (coll, toUnit) {
  let result;

  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function.
  if (checkSingleton(coll, 'toQuantity')) {
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

    const v = util.valDataConverted(coll[0]);
    const type = typeof v;
    let quantityRegexRes;

    if (type === "number") {
      result = new FP_Quantity(v, '\'1\'');
    } else if (v instanceof FP_Quantity) {
      result = v;
    } else if (type === 'boolean') {
      result = new FP_Quantity(v ? 1 : 0, '\'1\'');
    } else if (type === "string" && (quantityRegexRes = quantityRegex.exec(v)) ) {
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

  return result;
};

var numRegex = /^[+-]?\d+(\.\d+)?$/;
engine.toDecimal = function(coll){
  let rtn;
  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function.
  if (checkSingleton(coll, 'toDecimal')) {
    const v = util.valData(coll[0]);
    if (v === false) {
      rtn = 0;
    } else if (v === true) {
      rtn = 1;
    } else {
      const type = typeof v;
      if (type === "bigint") {
        // See the table of the possible conversions supported:
        // https://build.fhir.org/ig/HL7/FHIRPath/#conversion
        rtn = Number(v);
      } else if (type === "number") {
        rtn = v;
      } else if (type === "string" && numRegex.test(v)) {
        rtn = parseFloat(v);
      }
    }
  }
  return rtn;
};

engine.toString = function(coll){
  let rtn;
  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function.
  if (checkSingleton(coll, 'toString')) {
    rtn = util.valDataConverted(coll[0])?.toString();
  }
  return rtn;
};


/**
 *  Defines a function on engine called to+timeType (e.g., toDateTime, etc.).
 * @param timeType The string name of a class for a time type (e.g. "FP_DateTime").
 */
function defineTimeConverter(timeType) {
  let timeName = timeType.slice(3); // Remove 'FP_'
  engine['to'+timeName] = function(coll) {
    let rtn;
    //  If the input collection contains multiple items, the evaluation of
    //  the expression will end and signal an error to the calling environment.
    //  If the input collection is empty, the result is an empty collection.
    if (checkSingleton(coll, 'to'+timeName)) {
      const v = util.valData(coll[0]);
      if (typeof v === "string") {
        const t = types[timeType].checkString(v);
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
  let rtn;
  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function..
  if (checkSingleton(coll, 'toBoolean')) {
    const v = util.valData(coll[0]);
    switch (typeof v) {
      case 'boolean':
        rtn = v;
        break;
      case 'bigint':
        // See the table of the possible conversions supported:
        // https://build.fhir.org/ig/HL7/FHIRPath/#conversion
        if (v === 1n) {
          rtn = true;
        } else if (v === 0n) {
          rtn = false;
        }
        break;
      case 'number':
        if (v === 1) {
          rtn = true;
        } else if (v === 0) {
          rtn = false;
        }
        break;
      case 'string': {
        const lowerCaseValue = v.toLowerCase();
        if (trueStrings[lowerCaseValue]) {
          rtn = true;
        } else if (falseStrings[lowerCaseValue]) {
          rtn = false;
        }
      }
    }
  }
  return rtn;
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
    const type = typeof d;
    if (type === "number" || type === "bigint") {
      return d;
    }
  },
  "String": function(d){
    if (typeof d === "string") {
      return d;
    }
  },
  "StringOrNumber": function(d){
    const type = typeof d;
    if (type === "string" || type === "number") {
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
    throw new Error("Unexpected collection" + util.toJSON(coll) +
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
    throw new Error(`Expected ${type.toLowerCase()}, but got: ${util.toJSON(coll)}`);
  }
  throw new Error('Not supported type ' + type);
};

engine.hasValueFn = function(coll) {
  return coll.length === 1 && util.valData(coll[0]) != null
    && TypeInfo.isPrimitiveValue(coll[0]);
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
    if (v != null && TypeInfo.isPrimitiveValue(node)) {
      return v;
    }
  }
  return [];
};

module.exports = engine;
