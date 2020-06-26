
// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");
var types = require("./types");

const { FP_Quantity } = types;

var engine = {};

engine.iifMacro = function(data, cond, ok, fail) {
  if(util.isTrue(cond(data))) {
    return ok(data);
  } else {
    return fail ? fail(data) : [];
  }
};

engine.traceFn = function(x, label) {
  console.log("TRACE:[" + (label || "") + "]", JSON.stringify(x, null, " "));
  return x;
};

var intRegex = /^[+-]?\d+$/;
engine.toInteger = function(coll){
  if(coll.length != 1) { return []; }
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
  if(typeof v === "string") {
    if(intRegex.test(v)){
      return parseInt(v);
    }
  }
  return [];
};

const quantityRegex = /^((\+|-)?\d+(\.\d+)?)\s*(('[^']+')|([a-zA-Z]+))?$/,
  quantityRegexMap = {value:1,unit:5,time:6};
engine.toQuantity = function (coll, toUnit) {
  let result;
  // Surround UCUM unit code in the toUnit parameter with single quotes
  if (toUnit && !FP_Quantity.mapTimeUnitsToUCUMCode[toUnit]) {
    toUnit = `'${toUnit}'`;
  }

  if (coll.length > 1) {
    throw new Error("Could not convert to quantity: input collection contains multiple items");
  } else if (coll.length === 1) {
    const item = coll[0],
      v = util.valData(item);
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
  if(coll.length != 1) { return []; }
  var v = util.valData(coll[0]);
  if(v === false) {return 0;}
  if(v === true) {return 1.0;}
  if(typeof v === "number") {
    return v;
  }
  if(typeof v === "string") {
    if(numRegex.test(v)){
      return parseFloat(v);
    } else {
      throw new Error("Could not convert to decimal: " + v);
    }
  }
  return [];
};

engine.toString = function(coll){
  if(coll.length != 1) { return []; }
  var v = util.valData(coll[0]);
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
      var t = types[timeType].checkString(util.valData(coll[0]));
      if (t)
        rtn = t;
    }
    return rtn;
  };
}
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

module.exports = engine;
