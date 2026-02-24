
// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");

const { FP_Quantity, TypeInfo, FP_DateTime, FP_Date, FP_Time, ResourceNode } = require("./types");

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
 *  If the collection is empty, the result will be an empty collection (null).
 * @param {string} [toUnit] - Optional target unit for conversion. FHIRPath
 *  calendar duration units (e.g., 'seconds', 'years', 'months') are also
 *  supported.
 *
 * @returns {FP_Quantity|null} Returns:
 *  - A FP_Quantity object representing the converted value
 *  - null if the input collection is empty or the value cannot be converted
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
 * - If such a conversion is attempted, the function returns null.
 */
engine.toQuantity = function (coll, toUnit) {
  let result = null;

  // If the input collection contains multiple items, the evaluation of
  // the expression will end and signal an error to the calling environment.
  // If the input collection is empty, the result is an empty collection.
  // Note: An undefined result will be converted to an empty collection in
  // the calling function.
  if (checkSingleton(coll, 'toQuantity')) {
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
      if ( result.hasIncomparableDurationMix(toUnit) ) {
        // If the durations cannot be compared, the conversion is not possible.
        return null;
      }

      // Surround UCUM unit code in the toUnit parameter with single quotes
      if (!FP_Quantity.mapTimeUnitsToUCUMCode[toUnit]) {
        toUnit = `'${toUnit}'`;
      }

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
      rtn = new FP_Date(dateStr);
    }
    // Convert from string
    else if (typeof v === "string") {
      const t = FP_Date.checkString(v);
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
    const v = util.valData(coll[0]);

    // Check if the value is already FP_DateTime
    if (v instanceof FP_DateTime) {
      rtn = v;
    }
    // Convert from FP_Date (date string is valid as datetime string)
    else if (v instanceof FP_Date) {
      rtn = new FP_DateTime(v.asStr);
    }
    // Convert from string
    else if (typeof v === "string") {
      const t = FP_DateTime.checkString(v);
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
    const v = util.valData(coll[0]);

    // Check if the value is already FP_Time
    if (v instanceof FP_Time) {
      rtn = v;
    }
    // Convert from string
    else if (typeof v === "string") {
      const t = FP_Time.checkString(v);
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

/**
 * Builds the pathname string for a ResourceNode.
 * When short is falsy, all non-root elements include an indexer (e.g. [0]),
 * even for singleton properties.
 * When short is true, indexers are excluded for elements that are not arrays
 * (i.e. elements where index is null — meaning the underlying JSON value is
 * not stored in an array).
 * @param {ResourceNode} node - the resource node
 * @param {boolean} short - whether to use the short form
 * @return {string}
 */
function buildPathname(node, short) {
  // Collect segments from leaf to root, then reverse
  const segments = [];
  let current = node;

  while (current) {
    if (current.propName != null) {
      let propName = current.propName;

      // Handle choice types (same logic as fullPropertyName)
      if (current.parentResNode && current.model && current.fhirNodeDataType &&
        propName.endsWith(current.fhirNodeDataType.charAt(0).toUpperCase() +
          current.fhirNodeDataType.substring(1)) &&
        current.model.choiceTypePaths[current.parentResNode?.path + '.' +
          propName.substring(0, propName.length - current.fhirNodeDataType.length)]
      ) {
        propName = propName.substring(0, propName.length - current.fhirNodeDataType.length);
      }

      // Determine whether to include an indexer
      let indexStr = '';
      if (current.index != null) {
        // The element is from an array property — always include indexer
        indexStr = '[' + current.index + ']';
      } else if (!short) {
        // Without short, include [0] for all elements (including singletons)
        indexStr = '[0]';
      }

      segments.push(propName + indexStr);
    } else if (current.path) {
      // Root node (resource type) — no indexer
      segments.push(current.path);
    }

    current = current.parentResNode;
  }

  segments.reverse();
  return segments.join('.');
}

/**
 * Implementation of the pathname() function.
 * Returns the path of each item in the input collection within the input
 * resource, using element names and indexers.
 *
 * Items derived from computation (not ResourceNode instances) are excluded
 * from the result. Items outside the input resource (navigated via resolve())
 * are also excluded.
 *
 * @param {Array} coll - the input collection
 * @param {boolean} [short] - when true, excludes array indexers for elements
 *   known to not be arrays (either in the model or at runtime)
 * @return {string[]}
 */
engine.pathnameFn = function(coll, short) {
  const result = [];
  for (let i = 0; i < coll.length; i++) {
    const item = coll[i];
    // Only include ResourceNode instances — computed values are excluded
    if (item instanceof ResourceNode) {
      result.push(buildPathname(item, short));
    }
  }
  return result;
};

module.exports = engine;
