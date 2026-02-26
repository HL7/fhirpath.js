// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");

const { FP_Quantity, TypeInfo, FP_DateTime, FP_Date, FP_Time, FP_Decimal} =
  require("./types");

var engine = {};


/**
 * Implements the FHIRPath `iif(criterion, true-result, otherwise-result)` function.
 * Evaluates the criterion expression on the input data. If the result is true,
 * returns the result of the true-result expression; otherwise returns the result
 * of the otherwise-result expression (or an empty collection if not provided).
 * See https://hl7.org/fhirpath/#iifcriterion-expression-true-result-collection-otherwise-result-collection-collection
 * @param {Array} data - the input collection.
 * @param {Function} cond - the criterion expression.
 * @param {Function} ok - the true-result expression.
 * @param {Function} [fail] - the otherwise-result expression.
 * @returns {Array|Promise<Array>} the result of the selected branch. Returns
 *   a Promise if the criterion expression is asynchronous.
 */
engine.iifMacro = function(data, cond, ok, fail) {
  const condition = cond(data);
  if (condition instanceof Promise) {
    return condition.then(c => iifMacroSync(data, c, ok, fail));
  }
  return iifMacroSync(data, condition, ok, fail);
};


/**
 * Synchronous implementation of the iif macro logic.
 * @param {Array} data - the input collection.
 * @param {Array} condition - the evaluated criterion result.
 * @param {Function} ok - the true-result expression.
 * @param {Function} [fail] - the otherwise-result expression.
 * @returns {Array} the result of the selected branch, or an empty array if
 *   the condition is false and no otherwise-result is provided.
 */
function iifMacroSync(data, condition, ok, fail) {
  if(util.isTrue(condition)) {
    return ok(data);
  } else {
    return fail ? fail(data) : [];
  }
}


/**
 * Implements the FHIRPath `trace(name, projection)` function.
 * Logs the input collection (or the result of the projection expression) to
 * the console or to a custom trace function, then returns the input collection
 * unchanged.
 * See https://hl7.org/fhirpath/#tracename-string-projection-expression-collection
 * @param {Array} x - the input collection.
 * @param {string} label - the trace label.
 * @param {Function} [expr] - an optional projection expression whose result is
 *   traced instead of the input collection.
 * @returns {Array|Promise<Array>} the original input collection. Returns a
 *   Promise if the projection expression is asynchronous.
 */
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


/**
 * Implements the FHIRPath `toInteger()` function.
 * Converts a singleton value to an integer. Supports booleans, numbers, BigInt,
 * FP_Decimal, and strings matching an integer pattern.
 * See https://hl7.org/fhirpath/#tointeger-integer
 * @param {Array} coll - the input collection (singleton).
 * @returns {number|FP_Decimal|undefined} the integer value, or undefined if
 *   the value cannot be converted (which results in an empty collection).
 * @throws {Error} if the collection contains more than one item.
 */
engine.toInteger = function(coll){
  const ctx = this;
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
    } else if (v instanceof FP_Decimal) {
      if (v.isInteger()) {
        rtn = v;
      }
    } else {
      const type = typeof v;
      if (type === "bigint") {
        // See the table of the possible conversions supported:
        // https://build.fhir.org/ig/HL7/FHIRPath/#conversion
        rtn = ctx.getDecimal(v);
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


/**
 * Implements the FHIRPath `toLong()` function.
 * Converts a singleton value to a BigInt (long integer). Supports booleans,
 * numbers, BigInt, FP_Decimal, and strings matching an integer pattern.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#tolong--long
 * @param {Array} coll - the input collection (singleton).
 * @returns {BigInt|undefined} the BigInt value, or undefined if the value
 *   cannot be converted (which results in an empty collection).
 * @throws {Error} if the collection contains more than one item.
 */
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
    } else if (v instanceof FP_Decimal) {
      if (v.isInteger()) {
        rtn = BigInt(v.toString());
      }
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

/**
 * Regular expression for parsing quantity strings.
 * Matches an optional sign, integer or decimal number, optional whitespace,
 * and an optional unit (either a UCUM code in single quotes or a calendar
 * duration keyword).
 *
 * Capture groups:
 *   1 - the full numeric value (including sign and decimal part)
 *   2 - the sign (+ or -)
 *   3 - the decimal part (e.g. ".5")
 *   4 - the full unit group (quoted UCUM code or time keyword)
 *   5 - the UCUM unit code surrounded by single quotes (e.g. 'mg')
 *   6 - the calendar duration keyword (e.g. "days", "years")
 *
 * @type {RegExp}
 */
const quantityRegex = /^(([+-])?\d+(\.\d+)?)\s*(('[^']+')|([a-zA-Z]+))?$/,
  /**
   * Maps semantic field names to their corresponding capture group indices
   * in {@link quantityRegex}.
   * @type {{value: number, unit: number, time: number}}
   */
  quantityRegexMap = {value:1,unit:5,time:6};


/**
 * Converts a value from a collection to a FP_Quantity object, optionally
 * converting to a specified unit.
 *
 * This function takes a collection containing a single value and attempts to
 * convert it to a FP_Quantity object. The input value (which may be wrapped to
 * a ResourceNode) can be a number, boolean, string (with quantity notation), or
 * an existing FP_Quantity instance. If a target unit is specified, the function
 * will also perform unit conversion.
 * See:
 *  https://hl7.org/fhirpath/#toquantityunit-string-quantity
 *  https://build.fhir.org/ig/HL7/FHIRPath/#toquantityunit--string--quantity
 *
 * @param {Array} coll - A collection that should contain a single element to
 *  convert. If the collection contains multiple items, an error will be thrown.
 *  If the collection is empty, the result will be an empty collection
 *  (undefined).
 * @param {string} [toUnit] - Optional target unit for conversion. FHIRPath
 *  calendar duration units (e.g., 'seconds', 'years', 'months') are also
 *  supported.
 *
 * @returns {FP_Quantity|undefined} Returns:
 *  - A FP_Quantity object representing the converted value
 *  - undefined if the input collection is empty or the value cannot be converted
 *
 * @throws {Error} If the collection contains multiple items (via checkSingleton)
 *
 * @description
 * Conversion rules:
 * - **Number**: Converted to a quantity with unit '1' (dimensionless)
 * - **Boolean**: Converted to 1 (true) or 0 (false) with unit '1'
 * - **String**: Parsed using quantityRegex to extract value and unit
 *   - String must match quantity notation (e.g., "5.0 'mg'", "10 days")
 *   - UCUM unit codes in strings must be surrounded by single quotes
 *   - Supported calendar duration units are determined by the presence of
 *     the corresponding key in FP_Quantity.mapTimeUnitsToUCUMCode
 * - **FP_Quantity**: Used as-is (may still be converted to toUnit if specified)
 *
 * Unit conversion restrictions:
 * - Conversion between calendar durations and definite quantity durations
 *   above days (and weeks) (the threshold is defined by
 *   FP_Quantity._maxComparableCalendarDuration) is not allowed.
 * - If such a conversion is attempted, the function returns undefined.
 */
engine.toQuantity = function (coll, toUnit) {
  const ctx = this;
  let result;

  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function.
  if (checkSingleton(coll, 'toQuantity')) {
    const v = util.valDataConverted(coll[0]);
    if (v instanceof FP_Decimal) {
      result = new FP_Quantity(ctx, v, '\'1\'');
    } else {
      const type = typeof v;
      let quantityRegexRes;

      if (type === "number") {
        result = new FP_Quantity(ctx, v, '\'1\'');
      } else if (v instanceof FP_Quantity) {
        result = v;
      } else if (type === 'boolean') {
        result = new FP_Quantity(ctx, v ? 1 : 0, '\'1\'');
      } else if (type === "string" && (quantityRegexRes = quantityRegex.exec(v)) ) {
        const value = quantityRegexRes[quantityRegexMap.value],
          unit = quantityRegexRes[quantityRegexMap.unit],
          time = quantityRegexRes[quantityRegexMap.time];

        // UCUM unit code in the input string must be surrounded with single quotes
        if (!time || FP_Quantity.mapTimeUnitsToUCUMCode[time]) {
          result = new FP_Quantity(ctx, Number(value), unit || time || '\'1\'');
        }
      }
    }


    if (result && toUnit && result.unit !== toUnit) {
      if ( result.hasIncomparableDurationMix(toUnit) ) {
        // If the durations cannot be compared, the conversion is not possible.
        return undefined;
      }

      // Surround UCUM unit code in the toUnit parameter with single quotes
      if (!FP_Quantity.mapTimeUnitsToUCUMCode[toUnit]) {
        toUnit = `'${toUnit}'`;
      }

      result = FP_Quantity.convUnitTo(ctx, result.unit, result.value, toUnit);
    }
  }

  return result;
};

const numRegex = /^[+-]?\d+(\.\d+)?$/;


/**
 * Implements the FHIRPath `toDecimal()` function.
 * Converts a singleton value to a decimal number. Supports booleans, numbers,
 * BigInt, FP_Decimal, and strings matching a decimal pattern.
 * See https://hl7.org/fhirpath/#todecimal-decimal
 * @param {Array} coll - the input collection (singleton).
 * @returns {number|FP_Decimal|undefined} the decimal value, or undefined if
 *   the value cannot be converted (which results in an empty collection).
 * @throws {Error} if the collection contains more than one item.
 */
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
      } else if (type === "number" || v instanceof FP_Decimal) {
        rtn = v;
      } else if (type === "string" && numRegex.test(v)) {
        rtn = parseFloat(v);
      }
    }
  }
  return rtn;
};


/**
 * Implements the FHIRPath `toString()` function.
 * Converts a singleton value to its string representation.
 * See https://hl7.org/fhirpath/#tostring-string
 * @param {Array} coll - the input collection (singleton).
 * @returns {string|undefined} the string representation, or undefined if
 *   the input is empty (which results in an empty collection).
 * @throws {Error} if the collection contains more than one item.
 */
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
 * Converts the input collection to an FP_Date value.
 *
 * If the input collection contains a single item that is an FP_Date, the result
 * is that FP_Date. If the input is an FP_DateTime, the result is an FP_Date with
 * the value of the date portion of the FP_DateTime. If the input is a string
 * that is convertible to an FP_Date, the result is that FP_Date value.
 *
 * If the input collection contains multiple items, an error will be thrown.
 * If the input collection is empty or the input string cannot be converted,
 * the result is undefined.
 *
 * See:
 * https://hl7.org/fhirpath/#todate-date
 * https://build.fhir.org/ig/HL7/FHIRPath/#todate--date
 *
 * @param {Array} coll - The input collection
 * @returns {FP_Date|undefined} - Returns FP_Date if conversion is successful,
 *  undefined otherwise (which will be converted to an empty collection)
 */
engine.toDate = function(coll) {
  let rtn;
  //  If the input collection contains multiple items, the evaluation of
  //  the expression will end and signal an error to the calling environment.
  //  If the input collection is empty, the result is an empty collection.
  if (checkSingleton(coll, 'toDate')) {
    const ctx = this;
    const v = util.valData(coll[0]);

    // Check if the value is already FP_Date
    if (v instanceof FP_Date) {
      rtn = v;
    }
    // Convert from FP_DateTime by extracting date portion
    else if (v instanceof FP_DateTime) {
      // Upcoming spec says: "without timezone conversion/normalization"
      // Also, see this topic:
      // https://chat.fhir.org/#narrow/channel/179266-fhirpath/topic/Converting.20from.20DateTime.20type.20to.20Date.20type
      // In case we need to apply timezone, we can use the following code:
      // const dateStr = v._getPrecision() <= 2 ? v.asStr : FP_DateTime.isoDateTime(v._getDateObj(),2)
      const dateStr = v.asStr.split('T')[0];
      rtn = new FP_Date(ctx, dateStr);
    }
    // Convert from string
    else if (typeof v === "string") {
      const t = FP_Date.checkString(ctx, v);
      if (t) {
        rtn = t;
      }
    }
  }
  return rtn;
};


/**
 * Converts the input collection to an FP_DateTime value.
 *
 * If the input collection contains a single item that is an FP_DateTime, the
 * result is that FP_DateTime. If the input is an FP_Date, the result is an
 * FP_DateTime with the value of the FP_Date and the time components empty (not set
 * to zero). If the input is a string that is convertible to an FP_DateTime, the
 * result is that FP_DateTime value.
 *
 * If the input collection contains multiple items, an error will be thrown.
 * If the input collection is empty or the input string cannot be converted,
 * the result is undefined.
 *
 * See:
 * https://hl7.org/fhirpath/#todatetime-datetime
 *
 * @param {Array} coll - The input collection
 * @returns {FP_DateTime|undefined} - Returns FP_DateTime if conversion is successful,
 *  undefined otherwise (which will be converted to an empty collection)
 */
engine.toDateTime = function(coll) {
  let rtn;
  //  If the input collection contains multiple items, the evaluation of
  //  the expression will end and signal an error to the calling environment.
  //  If the input collection is empty, the result is an empty collection.
  if (checkSingleton(coll, 'toDateTime')) {
    const ctx = this;
    const v = util.valData(coll[0]);

    // Check if the value is already FP_DateTime
    if (v instanceof FP_DateTime) {
      rtn = v;
    }
    // Convert from FP_Date (date string is valid as datetime string)
    else if (v instanceof FP_Date) {
      rtn = new FP_DateTime(ctx, v.asStr);
    }
    // Convert from string
    else if (typeof v === "string") {
      const t = FP_DateTime.checkString(ctx, v);
      if (t) {
        rtn = t;
      }
    }
  }
  return rtn;
};


/**
 * Converts the input collection to an FP_Time value.
 *
 * If the input collection contains a single item that is an FP_Time, the result
 * is that FP_Time. If the input is a string that is convertible to an FP_Time,
 * the result is that FP_Time value.
 *
 * If the input collection contains multiple items, an error will be thrown.
 * If the input collection is empty or the input string cannot be converted,
 * the result is undefined.
 *
 * See:
 * https://hl7.org/fhirpath/#totime-time
 *
 * @param {Array} coll - The input collection
 * @returns {FP_Time|undefined} - Returns FP_Time if conversion is successful,
 *  undefined otherwise (which will be converted to an empty collection)
 */
engine.toTime = function(coll) {
  let rtn;
  //  If the input collection contains multiple items, the evaluation of
  //  the expression will end and signal an error to the calling environment.
  //  If the input collection is empty, the result is an empty collection.
  if (checkSingleton(coll, 'toTime')) {
    const ctx = this;
    const v = util.valData(coll[0]);

    // Check if the value is already FP_Time
    if (v instanceof FP_Time) {
      rtn = v;
    }
    // Convert from string
    else if (typeof v === "string") {
      const t = FP_Time.checkString(ctx, v);
      if (t) {
        rtn = t;
      }
    }
  }
  return rtn;
};


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


/**
 * Implements the FHIRPath `toBoolean()` function.
 * Converts a singleton value to a boolean. Supports booleans, numbers (0/1),
 * BigInt (0n/1n), FP_Decimal (0/1), and strings ('true', 't', 'yes', 'y',
 * '1', '1.0' for true; 'false', 'f', 'no', 'n', '0', '0.0' for false).
 * See https://hl7.org/fhirpath/#toboolean-boolean
 * @param {Array} coll - the input collection (singleton).
 * @returns {boolean|undefined} the boolean value, or undefined if the value
 *   cannot be converted (which results in an empty collection).
 * @throws {Error} if the collection contains more than one item.
 */
engine.toBoolean = function (coll) {
  let rtn;
  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function..
  if (checkSingleton(coll, 'toBoolean')) {
    const v = util.valData(coll[0]);
    if (v instanceof FP_Decimal) {
      if (v.equals(1)) {
        rtn = true;
      } else if (v.equals(0)) {
        rtn = false;
      }
    } else {
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
  }
  return rtn;
};


/**
 * Creates a function that checks if a conversion function successfully converts
 * a value from a singleton collection to a specified type.
 *
 * This factory function generates a converter validation function that can be
 * used to implement FHIRPath's `convertsTo*` functions (e.g.,
 * `convertsToInteger`, `convertsToDecimal`, `convertsToBoolean`, etc.).
 *
 * @param {function(coll: Array): (*|undefined)} toFunction - A conversion
 *   function (e.g., `engine.toInteger`, `engine.toDecimal`) that takes a collection
 *   and returns the converted value or `undefined` if conversion is not possible.
 *   The function is called with `this` bound to the current evaluation context.
 * @returns {function(this: Object, coll: Array): (boolean|Array)} A function that:
 *   - Returns an empty array `[]` if the input collection does not contain
 *     exactly one item
 *   - Returns `true` if the conversion function successfully converts the value
 *     (i.e., returns a value other than `undefined`)
 *   - Returns `false` if the conversion function returns `undefined`
 *
 * @example
 * // Create a convertsToInteger function
 * engine.convertsToInteger = engine.createConvertsToFn(engine.toInteger);
 *
 * // Usage:
 * engine.convertsToInteger.call(ctx, [42]);      // returns true
 * engine.convertsToInteger.call(ctx, ['hello']); // returns false
 * engine.convertsToInteger.call(ctx, []);        // returns []
 * engine.convertsToInteger.call(ctx, [1, 2]);    // returns []
 */
engine.createConvertsToFn = function (toFunction) {
  return function (coll) {
    if (coll.length !== 1) {
      return [];
    }

    return toFunction.call(this, coll) !== undefined;
  };
};

const singletonEvalByType = {
  "Integer": function(d){
    if (d instanceof FP_Quantity) {
      const decimal = d.toDecimal();
      if (decimal?.isInteger()) {
        return decimal;
      }
    } else if (d instanceof FP_Decimal ? d.isInteger() : Number.isInteger(d)) {
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
    if (d instanceof FP_Quantity) {
      const decimal = d.toDecimal();
      if (decimal) {
        return decimal;
      }
    } else if (type === "number" || type === "bigint" || d instanceof FP_Decimal) {
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
    if (type === "string" || type === "number" || type === "bigint" || d instanceof FP_Decimal) {
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


/**
 * Implements the FHIRPath `hasValue()` function.
 * Returns true if the input collection contains a single FHIR primitive value
 * that is not null.
 * See https://hl7.org/fhir/fhirpath.html#functions
 * @param {Array} coll - the input collection.
 * @returns {boolean} true if the collection contains exactly one non-null
 *   primitive value, false otherwise.
 */
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
