const addMinutes = require('date-fns/add_minutes');
const ucumUtils = require('@lhncbc/ucum-lhc').UcumLhcUtils.getInstance();
const numbers = require('./numbers');

const ucumSystemUrl = 'http://unitsofmeasure.org';
let timeFormat =
  '[0-9][0-9](\\:[0-9][0-9](\\:[0-9][0-9](\\.[0-9]+)?)?)?(Z|(\\+|-)[0-9][0-9]\\:[0-9][0-9])?';
let timeRE = new RegExp('^T?'+timeFormat+'$');
let dateTimeRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T'+timeFormat+')?)?)?Z?$');
let dateRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9])?)?$');
let instantRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T[0-9][0-9](\\:[0-9][0-9](\\:[0-9][0-9](\\.[0-9]+)?))(Z|(\\+|-)[0-9][0-9]\\:[0-9][0-9]))))$');
// FHIR date/time regular expressions are slightly different.  For now, we will
// stick with the FHIRPath regular expressions.
//let fhirTimeRE = /([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?/;
//let fhirDateTimeRE =
///([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?/;

/**
 *   Class FP_Type is the superclass for FHIRPath types that required special
 *   handling.
 */
class FP_Type {
  /**
   *  Tests whether this object is equal to another.  Returns either true,
   *  false, or undefined (where in the FHIRPath specification empty would be
   *  returned).  The undefined return value indicates that the values were the
   *  same to the shared precision, but that they had differnent levels of
   *  precision.
   */
  equals(/* otherObj */) {
    return false;
  }

  /**
   *  Tests whether this object is equivalant to another.  Returns either true,
   *  false, or undefined (where in the FHIRPath specification empty would be
   *  returned).
   */
  equivalentTo(/* otherObj */) {
    return false;
  }

  toString() {
    return this.asStr ? this.asStr : super.toString();
  }

  toJSON() {
    return this.toString();
  }

  /**
   *  Returns -1, 0, or 1 if this object is less then, equal to, or greater
   *  than otherObj.
   */
  compare(/* otherObj */) {
    throw 'Comparison not implemented for ' + this.constructor.name;
  }

  /**
   *  Adds other value to this value.
   */
  plus(/* otherObj */) {
    throw 'Addition not implemented for ' + this.constructor.name;
  }

  /**
   * Multiplies this value by another value.
   */
  mul(/* otherObj */) {
    throw 'Multiplication not implemented for ' + this.constructor.name;
  }

  /**
   * Divides this value by another value.
   */
  div(/* otherObj */) {
    throw 'Division not implemented for ' + this.constructor.name;
  }
}


/**
 *  A class for Quantities.
 */
class FP_Quantity extends FP_Type {
  constructor(value, unit) {
    super();
    this.asStr = value + ' ' + unit;
    this.value = value;
    this.unit = unit;
  }

  equals(otherQuantity) {
    if (!(otherQuantity instanceof this.constructor)) {
      return false;
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    if (
      !thisUnitInSeconds !== !otherUnitInSeconds &&
      (thisUnitInSeconds > 1 || otherUnitInSeconds > 1)
    ) {
      // If one of the operands is a calendar duration greater than seconds and
      // another one is not a calendar duration, return empty result
      return null;
    }

    if (this.unit === otherQuantity.unit) {
      return numbers.isEqual(this.value, otherQuantity.value);
    }

    // Special year/month comparison case: 1 year = 12 month
    const compareYearsAndMonths = this._compareYearsAndMonths(otherQuantity);
    if (compareYearsAndMonths) {
      return compareYearsAndMonths.isEqual;
    }

    // General comparison case
    const thisQuantity = FP_Quantity.toUcumQuantity(this.value, this.unit),
      normalizedOtherQuantity = FP_Quantity.toUcumQuantity(otherQuantity.value, otherQuantity.unit),
      convResult = ucumUtils.convertUnitTo(normalizedOtherQuantity.unit, normalizedOtherQuantity.value, thisQuantity.unit);

    if (convResult.status !== 'succeeded') {
      return false;
    }

    return numbers.isEqual(thisQuantity.value, convResult.toVal);
  }

  equivalentTo(otherQuantity) {
    if (!(otherQuantity instanceof this.constructor)) {
      return false;
    }

    if (this.unit === otherQuantity.unit) {
      return numbers.isEquivalent(this.value, otherQuantity.value);
    }

    const ucumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(this.unit),
      otherUcumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(otherQuantity.unit),
      convResult = ucumUtils.convertUnitTo(otherUcumUnitCode, otherQuantity.value, ucumUnitCode);

    if (convResult.status !== 'succeeded') {
      return false;
    }

    return numbers.isEquivalent(this.value, convResult.toVal);
  }

  /**
   *  Returns a number less than 0, equal to 0 or greater than 0
   *  if this quantity is less than, equal to, or greater than otherQuantity.
   *  If the quantities could not be compared, returns null, which will be
   *  converted to an empty collection in the "doInvoke" function
   *  See https://hl7.org/fhirpath/#comparison
   *  @param {FP_Quantity} otherQuantity
   *  @return {number|null}
   */
  compare(otherQuantity) {
    if (this.unit === otherQuantity.unit) {
      return this.value - otherQuantity.value;
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    if (
      !thisUnitInSeconds !== !otherUnitInSeconds &&
      (thisUnitInSeconds > 1 || otherUnitInSeconds > 1)
    ) {
      // If one of the operands is a calendar duration greater than seconds and
      // another one is not a calendar duration, return empty result
      // For example, 1 year > 1 'a' should return []
      return null;
    }

    const ucumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(this.unit),
      otherUcumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(otherQuantity.unit),
      convResult = ucumUtils.convertUnitTo(otherUcumUnitCode, otherQuantity.value, ucumUnitCode);

    if (convResult.status !== 'succeeded') {
      return null;
    }

    return this.value - convResult.toVal;
  }

  /**
   *  Adds a quantity to this quantity.
   * @param {FP_Quantity} otherQuantity a quantity to be added to this quantity.
   * @return {FP_Quantity|null}
   */
  plus(otherQuantity) {
    const thisConvFactor = FP_Quantity._yearMonthConversionFactor[this.unit];
    const otherConvFactor = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];
    if (thisConvFactor && otherConvFactor) {
      // If the values are indicated in years and months, we use the conversion factor: 1 year = 12 months
      return new FP_Quantity(this.value + otherQuantity.value * otherConvFactor / thisConvFactor, this.unit);
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    if (
      !thisUnitInSeconds !== !otherUnitInSeconds &&
      (thisUnitInSeconds > 1 || otherUnitInSeconds > 1)
    ) {
      // If one of the operands is a calendar duration greater than seconds and
      // another one is not a calendar duration, return empty result
      return null;
    }

    const thisUcumUnitCode = thisUnitInSeconds ? 's' : this.unit.replace(surroundingApostrophesRegex, '');
    const thisValue = (thisUnitInSeconds || 1) * this.value;

    const otherUcumUnitCode = otherUnitInSeconds ? 's' : otherQuantity.unit.replace(surroundingApostrophesRegex, '');
    const otherValue = (otherUnitInSeconds || 1) * otherQuantity.value;

    const convResult = ucumUtils.convertUnitTo(otherUcumUnitCode, otherValue, thisUcumUnitCode);

    if (convResult.status !== 'succeeded'
      || convResult.fromUnit.isSpecial_
      || convResult.toUnit.isSpecial_) {
      return null;
    }

    return new FP_Quantity(thisValue + convResult.toVal, thisUcumUnitCode);
  }

  /**
   * Multiplies this quantity to another quantity.
   * @param {FP_Quantity} otherQuantity a quantity by which to multiply this quantity.
   * @return {FP_Quantity}
   */
  mul(otherQuantity) {
    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    if (
      (thisUnitInSeconds > 1 && otherQuantity.unit !== "'1'") ||
      (otherUnitInSeconds > 1 && this.unit !== "'1'")
    ) {
      // If one of the operands is a calendar duration greater than seconds and
      // another one is not a number, return empty result
      return null;
    }

    const thisQ = this.convToUcumUnits(this, thisUnitInSeconds);
    if (!thisQ) {
      // If the first operand is not a UCUM quantity or it has a special unit
      return null;
    }

    const otherQ = this.convToUcumUnits(otherQuantity, otherUnitInSeconds);
    if (!otherQ) {
      // If the second operand is not a UCUM quantity or it has a special unit
      return null;
    }

    // Do not use UCUM unit codes for durations in simple cases
    if (this.unit === "'1'") {
      return new FP_Quantity(this.value * otherQuantity.value, otherQuantity.unit);
    } else if (otherQuantity.unit === "'1'") {
      return new FP_Quantity(this.value * otherQuantity.value, this.unit);
    }

    return new FP_Quantity(
      thisQ.value * otherQ.value,
      `'(${thisQ.unit}).(${otherQ.unit})'`
    );
  }

  /**
   * Divides this quantity by another quantity.
   * @param {FP_Quantity} otherQuantity a quantity by which to divide this quantity.
   * @return {FP_Quantity}
   */
  div(otherQuantity) {
    // Division by zero always gives an empty result
    if (otherQuantity.value === 0) {
      return null;
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    if (thisUnitInSeconds) {
      if (otherUnitInSeconds) {
        // If both operands are calendar duration quantities
        const thisConvFactor = FP_Quantity._yearMonthConversionFactor[this.unit];
        const otherConvFactor = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];
        if (thisConvFactor && otherConvFactor) {
          // If the values are indicated in years and months, we use the conversion factor: 1 year = 12 months
          return new FP_Quantity(this.value * thisConvFactor / (otherQuantity.value * otherConvFactor), "'1'");
        }
      } else if (otherQuantity.unit === "'1'") {
        // If the second operand is a number
        return new FP_Quantity(this.value / otherQuantity.value, this.unit);
      } else if (thisUnitInSeconds > 1) {
        // If the first operand is a calendar duration greater than seconds
        // and the other is not a calendar duration or number, return an empty result.
        return null;
      }
    } else if (otherUnitInSeconds > 1) {
      // If the first operands is not a calendar duration and the other is a
      // calendar duration greater than seconds, return an empty result.
      return null;
    }

    const thisQ = this.convToUcumUnits(this, thisUnitInSeconds);
    if (!thisQ) {
      // If the first operand is not a UCUM quantity or it has a special unit
      return null;
    }

    const otherQ = this.convToUcumUnits(otherQuantity, otherUnitInSeconds);
    if (!otherQ) {
      // If the second operand is not a UCUM quantity or it has a special unit
      return null;
    }

    const resultUnit = otherQ.unit === '1'
      ? thisQ.unit
      : `(${thisQ.unit})/(${otherQ.unit})`;

    const convResult = ucumUtils.convertToBaseUnits(resultUnit, thisQ.value / otherQ.value);
    if (convResult.status !== 'succeeded') {
      // If the result units are unclear
      return null;
    }
    return new FP_Quantity(
      convResult.magnitude,
      `'${Object.keys(convResult.unitToExp).map(key => key+convResult.unitToExp[key]).join('.') || "1"}'`
    );
  }

  /**
   * Converts a quantity to UCUM unit if possible, otherwise returns null.
   * @param {FP_Quantity} quantity - source quantity.
   * @param {number|undefined} unitInSeconds - if the source quantity is a
   *  calendar duration then the value of the quantity unit in seconds,
   *  otherwise undefined.
   * @return {{unit: string, value: number} | null}
   */
  convToUcumUnits(quantity, unitInSeconds) {
    if (unitInSeconds) {
      return {
        value: unitInSeconds * quantity.value,
        unit: 's'
      };
    } else {
      const unit = quantity.unit.replace(surroundingApostrophesRegex, '');
      const convRes = ucumUtils.convertToBaseUnits(unit, quantity.value);
      if (convRes.status !== 'succeeded' || convRes.fromUnitIsSpecial) {
        // If it is not a UCUM quantity or it has a special unit
        return null;
      }
      return {
        value: convRes.magnitude,
        unit: Object.keys(convRes.unitToExp).map(key => key+convRes.unitToExp[key]).join('.') || "1"
      };
    }
  }

  /**
   * If both quantities have one of these units: year or month,
   * then a special case will apply; otherwise returns null.
   * In the special case of comparison, the fact that 1 year = 12 months is used.
   *
   * Just note: in general, for a calendar duration:
   * 1 year = 365 days
   * 12 month = 12*30 days = 360 days
   * so, 1 year != 12 month
   * That's why this special case is needed
   *
   * @param {FP_Quantity} otherQuantity
   * @return {null|{isEqual: boolean}}
   * @private
   */
  _compareYearsAndMonths(otherQuantity) {
    const magnitude1 = FP_Quantity._yearMonthConversionFactor[this.unit],
      magnitude2 = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];

    if ( magnitude1 && magnitude2) {
      return {
        isEqual: numbers.isEqual(this.value*magnitude1, otherQuantity.value*magnitude2)
      };
    }

    return null;
  }

}

const  surroundingApostrophesRegex = /^'|'$/g;
/**
 * Converts a FHIR path unit to a UCUM unit code by converting a calendar duration keyword to an equivalent UCUM unit code
 * or removing single quotes for a UCUM unit.
 * @param {string} unit
 * @return {string}
 */
FP_Quantity.getEquivalentUcumUnitCode = function (unit) {
  return FP_Quantity.mapTimeUnitsToUCUMCode[unit] || unit.replace(surroundingApostrophesRegex, '');
};

/**
 * Converts FHIR path value/unit to UCUM value/unit. Usable for comparison.
 * @param {number} value
 * @param {string} unit
 * @returns { {value: number, unit: string} }
 */
FP_Quantity.toUcumQuantity = function (value, unit) {
  const magnitude = FP_Quantity._calendarDuration2Seconds[unit];
  if (magnitude) {
    return {
      value: magnitude * value,
      unit: 's'
    };
  }

  return {
    value,
    unit: unit.replace(surroundingApostrophesRegex, '')
  };
};


/**
 * Converts FHIRPath value/unit to other FHIRPath value/unit.
 * @param {string} fromUnit
 * @param {number} value
 * @param {string} toUnit
 * @return {FP_Quantity|null}
 */
FP_Quantity.convUnitTo = function (fromUnit, value, toUnit) {
  // 1 Year <-> 12 Months
  const fromYearMonthMagnitude = FP_Quantity._yearMonthConversionFactor[fromUnit],
    toYearMonthMagnitude = FP_Quantity._yearMonthConversionFactor[toUnit];
  if (fromYearMonthMagnitude && toYearMonthMagnitude) {
    return new FP_Quantity( fromYearMonthMagnitude*value/toYearMonthMagnitude, toUnit);
  }

  const fromMagnitude = FP_Quantity._calendarDuration2Seconds[fromUnit],
    toMagnitude = FP_Quantity._calendarDuration2Seconds[toUnit];

  // To FHIR path calendar duration
  if (toMagnitude) {
    if (fromMagnitude) {
      return new FP_Quantity( fromMagnitude*value/toMagnitude, toUnit);
    } else {
      const convResult = ucumUtils.convertUnitTo(fromUnit.replace(/^'|'$/g, ''), value, 's');

      if (convResult.status === 'succeeded') {
        return new FP_Quantity(convResult.toVal/toMagnitude, toUnit);
      }
    }
  // To Ucum unit
  } else {
    const convResult = fromMagnitude ? ucumUtils.convertUnitTo('s', fromMagnitude*value, toUnit.replace(/^'|'$/g, ''))
      : ucumUtils.convertUnitTo(fromUnit.replace(/^'|'$/g, ''), value, toUnit.replace(/^'|'$/g, ''));

    if(convResult.status === 'succeeded') {
      return new FP_Quantity(convResult.toVal, toUnit);
    }
  }

  return null;
};


// Defines conversion factors for calendar durations
FP_Quantity._calendarDuration2Seconds = {
  'years': 365*24*60*60,
  'months': 30*24*60*60,
  'weeks': 7*24*60*60,
  'days': 24*60*60,
  'hours': 60*60,
  'minutes': 60,
  'seconds': 1,
  'milliseconds': .001,
  'year': 365*24*60*60,
  'month': 30*24*60*60,
  'week': 7*24*60*60,
  'day': 24*60*60,
  'hour': 60*60,
  'minute': 60,
  'second': 1,
  'millisecond': .001
};

// Defines special case to compare years with months for calendar durations
FP_Quantity._yearMonthConversionFactor = {
  'years': 12,
  'months': 1,
  'year': 12,
  'month': 1
};

/**
 *  Defines a map from time units that are supported for date/time arithmetic
 *  (including some UCUM time based units) to FHIRPath time units.
 */
FP_Quantity.dateTimeArithmeticDurationUnits = {
  'years': "year",
  'months': "month",
  'weeks': "week",
  'days': "day",
  'hours': "hour",
  'minutes': "minute",
  'seconds': "second",
  'milliseconds': "millisecond",
  'year': "year",
  'month': "month",
  'week': "week",
  'day': "day",
  'hour': "hour",
  'minute': "minute",
  'second': "second",
  'millisecond': "millisecond",
  "'s'": "second",
  "'ms'": "millisecond"
};

/**
 *  Defines a map from UCUM code to FHIRPath time units.
 */
FP_Quantity.mapUCUMCodeToTimeUnits = {
  'a': "year",
  'mo': "month",
  'wk': "week",
  'd': "day",
  'h': "hour",
  'min': "minute",
  's': "second",
  'ms': "millisecond",
};

/**
 *  Defines a map from FHIRPath time units to UCUM code.
 */
FP_Quantity.mapTimeUnitsToUCUMCode = Object.keys(FP_Quantity.mapUCUMCodeToTimeUnits)
  .reduce(function (res, key) {
    res[FP_Quantity.mapUCUMCodeToTimeUnits[key]] = key;
    res[FP_Quantity.mapUCUMCodeToTimeUnits[key]+'s'] = key;
    return res;
  }, {});

class FP_TimeBase extends FP_Type {
  constructor(timeStr) {
    super();
    this.asStr = timeStr;
  }

  /**
   *  Adds a time-based quantity to this date/time.
   * @param timeQuantity a quantity to be added to this date/time.  See the
   *  FHIRPath specification for supported units.
   */
  plus(timeQuantity) {
    const unit = timeQuantity.unit;
    let timeUnit = FP_Quantity.dateTimeArithmeticDurationUnits[unit];
    if (!timeUnit) {
      throw new Error('For date/time arithmetic, the unit of the quantity ' +
        'must be one of the following time-based units: ' +
        Object.keys(FP_Quantity.dateTimeArithmeticDurationUnits));
    }
    const cls = this.constructor;
    const unitPrecision = cls._timeUnitToDatePrecision[timeUnit];
    if (unitPrecision === undefined) {
      throw new Error('Unsupported unit for +.  The unit should be one of ' +
        Object.keys(cls._timeUnitToDatePrecision).join(', ') + '.');
    }
    let qVal = timeQuantity.value;
    const isTime = (cls === FP_Time);

    // From the FHIRPath specification: "For precisions above seconds, the
    // decimal portion of the time-valued quantity is ignored, since date/time
    // arithmetic above seconds is performed with calendar duration semantics."
    if (isTime ? unitPrecision < 2 : unitPrecision < 5) {
      qVal = Math.trunc(qVal);
    }

    // If the precision of the time quantity is higher than the precision of the
    // date, we need to convert the time quantity to the precision of the date.
    if (this._getPrecision() < unitPrecision) {
      const neededUnit = cls._datePrecisionToTimeUnit[
        this._getPrecision()];
      if (neededUnit !== 'second') {
        const newQuantity = FP_Quantity.convUnitTo(timeUnit, qVal, neededUnit);
        timeUnit = newQuantity.unit;
        qVal = Math.trunc(newQuantity.value);
      }
    }
    const newDate = FP_TimeBase.timeUnitToAddFn[timeUnit](this._getDateObj(), qVal);
    // newDate is a Date.  We need to make a string with the correct precision.
    let precision = this._getPrecision();
    if (isTime)
      precision += 3; // based on dateTimeRE, not timeRE
    let newDateStr = FP_DateTime.isoDateTime(newDate, precision);
    if (isTime) {
      // FP_Time just needs the time part of the string
      newDateStr = newDateStr.slice(newDateStr.indexOf('T') + 1);
    }

    return new cls(newDateStr);
  }


  /**
   *  Tests whether this object is equal to another.  Returns either true,
   *  false, or undefined (where in the FHIRPath specification empty would be
   *  returned).  The undefined return value indicates that the values were the
   *  same to the shared precision, but that they had differnent levels of
   *  precision.
   * @param otherDateTime any sub-type of FP_TimeBase, but it should be the same
   *  as the type of "this".
   */
  equals(otherDateTime) {
    // From the 2019May ballot:
    // For Date, DateTime and Time equality, the comparison is performed by
    // considering each precision in order, beginning with years (or hours for
    // time values), and respecting timezone offsets. If the values are the
    // same, comparison proceeds to the next precision; if the values are
    // different, the comparison stops and the result is false. If one input has
    // a value for the precision and the other does not, the comparison stops
    // and the result is empty ({ }); if neither input has a value for the
    // precision, or the last precision has been reached, the comparison stops
    // and the result is true.
    // Note:  Per the spec above
    //   2012-01 = 2012 //  empty
    //   2012-01 = 2011 //  false
    //   2012-01 ~ 2012 //  false
    var rtn;
    if (!(otherDateTime instanceof this.constructor) && !(this instanceof otherDateTime.constructor))
      rtn = false;
    else {
      var thisPrec  = this._getPrecision();
      var otherPrec = otherDateTime._getPrecision();

      if (thisPrec == otherPrec) {
        rtn = this._getDateObj().getTime() == otherDateTime._getDateObj().getTime();
      }
      else {
        // The dates are not equal, but decide whether to return empty or false.
        var commonPrec  = thisPrec <= otherPrec ? thisPrec : otherPrec;
        // Adjust for timezone offsets, if any, so they are at a common timezone
        var thisUTCStr  = this._getDateObj().toISOString();
        var otherUTCStr = otherDateTime._getDateObj().toISOString();

        if (this.constructor === FP_Time) {
          commonPrec += 3; // because we now have year, month, and day
          thisPrec += 3;
          otherPrec += 3;
        }

        // Now parse the strings and compare the adjusted time parts.
        // Dates without time specify no timezone and should be treated as already normalized to UTC. So we do not adjust the timezone, as this would change the date
        var thisAdj  = thisPrec > 2 ? (new FP_DateTime(thisUTCStr))._getTimeParts() : this._getTimeParts();
        var otherAdj = otherPrec > 2 ? (new FP_DateTime(otherUTCStr))._getTimeParts() : otherDateTime._getTimeParts();

        for (var i = 0; i <= commonPrec && rtn !== false; ++i) {
          rtn = thisAdj[i] == otherAdj[i];
        }
        // if rtn is still true, then return empty to indicate the difference in
        // precision.
        if (rtn)
          rtn = undefined;
      }
    }
    // else return undefined (empty)
    return rtn;
  }


  /**
   *  Tests whether this object is equivalant to another.  Returns either true
   *  or false.
   */
  equivalentTo(otherDateTime) {
    var rtn = otherDateTime instanceof this.constructor;
    if (rtn) {
      var thisPrec = this._getPrecision();
      var otherPrec = otherDateTime._getPrecision();
      rtn = thisPrec == otherPrec;
      if (rtn) {
        rtn = this._getDateObj().getTime() ==
          otherDateTime._getDateObj().getTime();
      }
    }
    return rtn;
  }


  /**
   *  Returns a number less than 0, equal to 0 or greater than 0
   *  if this (date) time is less than, equal to, or greater than otherTime.
   *  Comparisons are made at the lesser of the two time precisions.
   *  @param {FP_TimeBase} otherTime
   *  @return {number}
   */
  compare(otherTime) {
    var thisPrecision = this._getPrecision();
    var otherPrecision = otherTime._getPrecision();
    var thisTimeInt = thisPrecision <= otherPrecision ?
      this._getDateObj().getTime(): this._dateAtPrecision(otherPrecision).getTime();
    var otherTimeInt = otherPrecision <= thisPrecision ?
      otherTime._getDateObj().getTime(): otherTime._dateAtPrecision(thisPrecision).getTime();
    if (thisPrecision !== otherPrecision && thisTimeInt === otherTimeInt) {
      return null;
    }
    return thisTimeInt - otherTimeInt;
  }


  /**
   *  Returns a number representing the precision of the time string given to
   *  the constructor.  (Higher means more precise).  The number is the number
   *  of components of the time string (ignoring the time zone) produced by
   *  matching against the time regular expression, except that milliseconds
   *  and seconds are counted together as a single of level of precision.
   *  @return {number}
   */
  _getPrecision() {
    if (this.precision === undefined)
      this._getMatchData();
    return this.precision;
  }

  /**
   *  Returns the match data from matching the given RegExp against the
   *  date/time string given to the constructor.
   *  Also sets this.precision.
   * @param regEx The regular expression to match against the date/time string.
   * @param maxPrecision the maximum precision possible for the type
   */
  _getMatchData(regEx, maxPrecision) {
    if (this.timeMatchData === undefined) {
      this.timeMatchData = this.asStr.match(regEx);
      if (this.timeMatchData) {
        for (let i=maxPrecision; i>=0 && this.precision === undefined; --i) {
          if (this.timeMatchData[i])
            this.precision = i;
        }
      }
    }
    return this.timeMatchData;
  }

  /**
   *  Returns an array of the pieces of the given time string, for use in
   *  constructing lower precision versions of the time. The returned array will
   *  contain separate elements for the hour, minutes, seconds, and milliseconds
   *  (or as many of those are as present).  The length of the returned array
   *  will therefore be an indication of the precision.
   *  It will not include the timezone.
   * @timeMatchData the result of matching the time portion of the string passed
   *  into the constructor against the "timeRE" regular expression.
   */
  _getTimeParts(timeMatchData) {
    var timeParts = [];
    // Finish parsing the data into pieces, for later use in building
    // lower-precision versions of the date if needed.
    timeParts = [timeMatchData[0]];
    var timeZone = timeMatchData[4];
    if (timeZone) { // remove time zone from hours
      let hours = timeParts[0];
      timeParts[0] = hours.slice(0, hours.length-timeZone.length);
    }
    var min = timeMatchData[1];
    if (min) { // remove minutes from hours
      let hours = timeParts[0];
      timeParts[0] = hours.slice(0, hours.length-min.length);
      timeParts[1] = min;
      var sec = timeMatchData[2];
      if (sec) { // remove seconds from minutes
        timeParts[1] = min.slice(0, min.length-sec.length);
        timeParts[2] = sec;
        var ms = timeMatchData[3];
        if (ms) { // remove milliseconds from seconds
          timeParts[2] = sec.slice(0, sec.length-ms.length);
          timeParts[3] = ms;
        }
      }
    }
    return timeParts;
  }


  /**
   *  Returns a date object representing this time on a certain date.
   */
  _getDateObj() {
    if (!this.dateObj) {
      var precision = this._getPrecision();
      // We cannot directly pass the string into the date constructor because
      // (1) we don't want to introduce a time-dependent system date and (2) the
      // time string might not have contained minutes, which are required by the
      // Date constructor.
      this.dateObj = this._dateAtPrecision(precision);
    }
    return this.dateObj;
  }


  /**
   *  Creates a date object for the given timezone.  The returned date object
   *  will have the specified date and time in the specified timezone.
   * @param year...ms Just as in the Date constructor.
   * @param timezoneOffset (optional) a string in the format (+-)HH:mm or Z, representing the
   *  timezone offset.  If not provided, the local timzone will be assumed (as the
   *  Date constructor does).
   */
  _createDate(year, month, day, hour, minutes, seconds, ms, timezoneOffset) {
    var d = new Date(year, month, day, hour, minutes, seconds, ms);
    if (timezoneOffset) {
      // d is in local time.  Adjust for the timezone offset.
      // First adjust the date by the timezone offset before reducing its
      // precision.  Otherwise,
      // @2018-11-01T-04:00 < @2018T-05:00
      var localTimezoneMinutes = d.getTimezoneOffset();
      var timezoneMinutes = 0; // if Z
      if (timezoneOffset != 'Z') {
        var timezoneParts = timezoneOffset.split(':'); // (+-)hours:minutes
        var hours = parseInt(timezoneParts[0]);
        timezoneMinutes = parseInt(timezoneParts[1]);
        if (hours < 0)
          timezoneMinutes = -timezoneMinutes;
        timezoneMinutes += 60*hours;
      }
      // localTimezoneMinutes has the inverse sign of its timezone offset
      d = addMinutes(d, -localTimezoneMinutes-timezoneMinutes);
    }
    return d;
  }
}

/**
 *  A map from a FHIRPath time units to a function used to add that
 *  quantity to a date/time.
 */
FP_TimeBase.timeUnitToAddFn = {
  "year": require('date-fns/add_years'),
  "month": require('date-fns/add_months'),
  "week": require('date-fns/add_weeks'),
  "day": require('date-fns/add_days'),
  "hour": require('date-fns/add_hours'),
  "minute": require('date-fns/add_minutes'),
  "second": require('date-fns/add_seconds'),
  "millisecond": require('date-fns/add_milliseconds')
};


class FP_DateTime extends FP_TimeBase {
  /**
   *  Constructs an FP_DateTime, assuming dateStr is valid.  If you don't know
   *  whether a string is a valid DateTime, use FP_DateTime.checkString instead.
   */
  constructor(dateStr) {
    super(dateStr);
  }


  /**
   *  Returns -1, 0, or 1 if this date time is less then, equal to, or greater
   *  than otherDateTime.  Comparisons are made at the lesser of the two date time
   *  precisions.
   */
  compare(otherDateTime) {
    if (!(otherDateTime instanceof FP_DateTime))
      throw 'Invalid comparison of a DateTime with something else';
    return super.compare(otherDateTime);
  }


  /**
   *  Returns the match data from matching dateTimeRE against the datetime string.
   *  Also sets this.precision.
   */
  _getMatchData() {
    return super._getMatchData(dateTimeRE, 5);
  }

  /**
   *  Returns an array of the pieces of the date time string passed into the
   *  constructor, for use in constructing lower precision versions of the
   *  date time. The returned array will contain separate elements for the year,
   *  month, day, hour, minutes, seconds, and milliseconds (or as many of those
   *  are as present).  The length of the returned array will therefore be an
   *  indication of the precision.  It will not include the timezone.
   */
  _getTimeParts() {
    if (!this.timeParts) {
      let timeMatchData =  this._getMatchData();
      let year = timeMatchData[0];
      this.timeParts = [year];
      var month = timeMatchData[1];
      if (month) { // Remove other information from year
        this.timeParts[0] = year.slice(0, year.length-month.length);
        this.timeParts[1] = month;
        let day = timeMatchData[2];
        if (day) { // Remove day information from month
          this.timeParts[1] = month.slice(0, month.length-day.length);
          this.timeParts[2] = day;
          let time = timeMatchData[3];
          if (time) { // Remove time from day
            this.timeParts[2] = day.slice(0, day.length-time.length);
            if (time[0] === 'T') // remove T from hour
              timeMatchData[3] = time.slice(1);
            this.timeParts = this.timeParts.concat(
              super._getTimeParts(timeMatchData.slice(3)));
          }
        }
      }
    }
    return this.timeParts;
  }


  /**
   *  Returns a new Date object for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.
   * @param precision the new precision, which is assumed to be less than
   *  or equal to the current precision.
   */
  _dateAtPrecision(precision) {
    var timeParts = this._getTimeParts();
    var timezoneOffset = this._getMatchData()[7];
    // Get the date object first at the current precision.
    var thisPrecision = this._getPrecision();
    var year = parseInt(timeParts[0]);
    var month = thisPrecision > 0 ? parseInt(timeParts[1].slice(1)) - 1 : 0;
    var day = thisPrecision > 1 ? parseInt(timeParts[2].slice(1)) : 1;
    var hour = thisPrecision > 2 ? parseInt(timeParts[3]) : 0;
    var minutes = thisPrecision > 3 ? parseInt(timeParts[4].slice(1)): 0;
    var seconds = thisPrecision > 4 ? parseInt(timeParts[5].slice(1)): 0;
    var ms = timeParts.length > 6 ? parseInt(timeParts[6].slice(1)): 0;
    var d = this._createDate(year, month, day, hour, minutes, seconds, ms,
      timezoneOffset);
    if (precision < thisPrecision) {
      // Adjust the precision
      year = d.getFullYear();
      month = precision > 0 ? d.getMonth() : 0;
      day = precision > 1 ? d.getDate() : 1;
      hour = precision > 2 ? d.getHours() : 0;
      minutes = precision > 3 ? d.getMinutes(): 0;
      // Here the precision will always be less than the maximum
      // due to the condition in the if statement: "precision < thisPrecision"
      d = new Date(year, month, day, hour, minutes);
    }
    return d;
  }
}

/**
 *  Tests str to see if it is convertible to a DateTime.
 * @return If str is convertible to a DateTime, returns an FP_DateTime;
 *  otherwise returns null.
 */
FP_DateTime.checkString = function(str) {
  let d = new FP_DateTime(str);
  if (!d._getMatchData())
    d = null;
  return d;
};

/**
 *  A map from FHIRPath time units to the internal DateTime "precision" number.
 */
FP_DateTime._timeUnitToDatePrecision = {
  "year": 0,
  "month": 1,
  "week": 2, // wk is just 7*d
  "day": 2,
  "hour": 3,
  "minute": 4,
  "second": 5,
  "millisecond": 6
};

/**
 *  The inverse of _timeUnitToDatePrecision.
 */
FP_DateTime._datePrecisionToTimeUnit = [
  "year", "month", "day", "hour", "minute", "second", "millisecond"
];



class FP_Time extends FP_TimeBase {
  /**
   *  Constructs an FP_Time, assuming dateStr is valid.  If you don't know
   *  whether a string is a valid DateTime, use FP_Time.checkString instead.
   */
  constructor(timeStr) {
    if (timeStr[0] == 'T')
      timeStr = timeStr.slice(1);
    super(timeStr);
  }


  /**
   *  Returns -1, 0, or 1 if this time is less then, equal to, or greater
   *  than otherTime.  Comparisons are made at the lesser of the two time
   *  precisions.
   */
  compare(otherTime) {
    if (!(otherTime instanceof FP_Time))
      throw 'Invalid comparison of a time with something else';
    return super.compare(otherTime);
  }


  /**
   *  Returns a new Date object for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.
   *  The "date" portion of the returned Date object is not meaningful, and
   *  should be ignored.
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.  A precision of 0 means the hour.
   */
  _dateAtPrecision(precision) {
    var timeParts = this._getTimeParts();
    var timezoneOffset = this._getMatchData()[4];
    // Get the date object first at the current precision.
    var thisPrecision = this._getPrecision();
    var year = 2010; // Have to pick some year for the date object
    var month = 0;
    var day = 1;
    var hour = parseInt(timeParts[0]);
    var minutes = thisPrecision > 0 ? parseInt(timeParts[1].slice(1)): 0;
    var seconds = thisPrecision > 1 ? parseInt(timeParts[2].slice(1)): 0;
    var ms = timeParts.length > 3 ? parseInt(timeParts[3].slice(1)): 0;
    var d = this._createDate(year, month, day, hour, minutes, seconds, ms,
      timezoneOffset);
    if (timezoneOffset) {
      // Keep the date the same (in the local timezone), so it is not a relevant
      // factor when comparing different times.
      d.setYear(year);
      d.setMonth(month);
      d.setDate(day);
    }
    if (precision < thisPrecision) {
      // Adjust the precision
      hour = d.getHours();
      minutes = precision > 0 ? d.getMinutes(): 0;
      // Here the precision will always be less than the maximum
      // due to the condition in the if statement: "precision < thisPrecision"
      d = new Date(year, month, day, hour, minutes);
    }
    return d;
  }


  /**
   *  Returns the match data from matching timeRE against the time string.
   *  Also sets this.precision.
   */
  _getMatchData() {
    return super._getMatchData(timeRE, 2);
  }

  /**
   *  Returns an array of the pieces of the time string passed into the
   *  constructor, for use in constructing lower precision versions of the
   *  time. The returned array will contain separate elements for the hour,
   *  minutes, seconds, and milliseconds (or as many of those are as present).
   *  The length of the returned array will therefore be an indication of the
   *  precision.  It will not include the timezone.
   */
  _getTimeParts() {
    if (!this.timeParts) {
      this.timeParts = super._getTimeParts(this._getMatchData());
    }
    return this.timeParts;
  }
}

/**
 *  Tests str to see if it is convertible to a Time.
 * @return If str is convertible to a Time, returns an FP_Time;
 *  otherwise returns null.
 */
FP_Time.checkString = function(str) {
  let d = new FP_Time(str);
  if (!d._getMatchData())
    d = null;
  return d;
};

/**
 *  A map from FHIRPath time units to the internal DateTime "precision" number.
 */
FP_Time._timeUnitToDatePrecision = {
  "hour": 0,
  "minute": 1,
  "second": 2,
  "millisecond": 3
};

/**
 *  The inverse of _timeUnitToDatePrecision.
 */
FP_Time._datePrecisionToTimeUnit = ["hour", "minute", "second", "millisecond"];


/**
 *  Returns either the given number or a string with the number prefixed by
 *  zeros if the given number is less than the given length.
 * @param num the nubmer to format
 * @param len the number of returned digits.  For now this must either be 2 or
 *  3. (Optional-- default is 2).
 */
function formatNum(num, len) {
  // Could use String.repeat, but that requires convertin num to an string first
  // to get its length.  This might be slightly faster given that we only need 2
  // or three 3 digit return values.
  var rtn = num;
  if (len === 3 && num < 100)
    rtn = '0' + num;
  if (num < 10)
    rtn = '0' + rtn;
  return rtn;
}


/**
 *  Formats the given date object into an ISO8601 datetime string, expressing it
 *  in the local timezone.
 * @date the date to format
 * @precision the precision at which to terminate string string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  dateTimeRE.
 * @return a string in ISO8601 format.
 */
FP_DateTime.isoDateTime = function(date, precision) {
  if (precision === undefined)
    precision = 5; // maximum
  // YYYY-MM-DDTHH:mm:ss.sss[+-]HH:mm
  // Note:  Date.toISOString sets the timezone at 'Z', which I did not want.
  // Actually, I wanted to keep the original timezone given in the constructor,
  // but that is difficult due to daylight savings time changes.  (For instance,
  // if you add 6 months, the timezone offset could change).
  var rtn = '' + date.getFullYear();
  if (precision > 0) {
    rtn += '-' + formatNum(date.getMonth() + 1);
    if (precision > 1) {
      rtn += '-' + formatNum(date.getDate());
      if (precision > 2) {
        rtn += 'T' + FP_DateTime.isoTime(date, precision - 3);
      }
    }
  }
  // FHIRPath STU1 does not allow a timezone offset on a dateTime that does not
  // have a time part (except that the grammar allows 'Z', which is
  // inconsistent).
  if (precision > 2) {
    // Note:  getTimezoneoffset returns the offset for the local system at the
    // given date.
    var tzOffset = date.getTimezoneOffset();
    // tzOffset is a number of minutes, and is positive for negative timezones,
    // and negative for positive timezones.
    var tzSign = tzOffset < 0 ? '+' : '-';
    tzOffset = Math.abs(tzOffset);
    var tzMin = tzOffset % 60;
    var tzHour = (tzOffset - tzMin) / 60;
    rtn += tzSign + formatNum(tzHour) + ':' + formatNum(tzMin);
  }
  return rtn;
};


/**
 *  Returns a time string in ISO format at the given precision level.
 * @date the date to format
 * @precision the precision at which to terminate string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  timeRE.
 * @return a string in ISO 8601 format.
 */
FP_DateTime.isoTime = function(date, precision) {
  if (precision === undefined)
    precision = 2; // maximum

  let rtn = '' + formatNum(date.getHours());
  if (precision > 0) {
    rtn += ':' + formatNum(date.getMinutes());
    if (precision > 1) {
      rtn += ':' + formatNum(date.getSeconds() );
      if (date.getMilliseconds())
        rtn += '.' + formatNum(date.getMilliseconds(), 3);
    }
  }
  return rtn;
};


class FP_Date extends FP_DateTime {
  /**
   * Constructs an FP_Date, assuming dateStr is valid.  If you don't know
   * whether a string is a valid Date, use FP_Date.checkString instead.
   */
  constructor(dateStr) {
    super(dateStr);
  }


  /**
   * Returns the match data from matching dateRE against the date string.
   * Also sets this.precision.
   */
  _getMatchData() {
    return FP_TimeBase.prototype._getMatchData.apply(this, [dateRE, 2]);
  }
}


/**
 * Tests str to see if it is convertible to a Date.
 * @return If str is convertible to a Date, returns an FP_Date;
 *  otherwise returns null.
 */
FP_Date.checkString = function(str) {
  let d = new FP_Date(str);
  if (!d._getMatchData())
    d = null;
  return d;
};


/**
 * Returns a date string in ISO format at the given precision level.
 * @date the date to format
 * @precision the precision at which to terminate string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  dateTimeRE.
 * @return a string in ISO8601 format.
 */
FP_Date.isoDate = function(date, precision) {
  if (precision === undefined || precision > 2)
    precision = 2;
  return FP_DateTime.isoDateTime(date, precision);
};

class FP_Instant extends FP_DateTime {
  /**
   * Constructs an FP_Instant, assuming instantStr is valid.  If you don't know
   * whether a string is a valid "instant", use FP_Instant.checkString instead.
   */
  constructor(instantStr) {
    super(instantStr);
  }


  /**
   * Returns the match data from matching instantRE against the "instant" string.
   * Also sets this.precision.
   */
  _getMatchData() {
    return FP_TimeBase.prototype._getMatchData.apply(this, [instantRE, 5]);
  }
}


/**
 * Tests str to see if it is convertible to an "instant".
 * @return If str match the "instant" RegExp, returns an FP_Instant;
 *  otherwise returns null.
 */
FP_Instant.checkString = function(str) {
  let d = new FP_Instant(str);
  if (!d._getMatchData())
    d = null;
  return d;
};

/**
 *  A class that represents a node in a FHIR resource, with path and possibly type
 *  information.
 */
class ResourceNode {
  /**
   *  Constructs a instance for the given node ("data") of a resource.  If the
   *  data is the top-level node of a resouce, the path and type parameters will
   *  be ignored in favor of the resource's resourceType field.
   * @param {*} data - the node's data or value (which might be an object with
   *  sub-nodes, an array, or FHIR data type)
   * @param {ResourceNode} parentResNode - parent ResourceNode.
   * @param {string} path - the node's path in the resource (e.g. Patient.name).
   *  If the data's type can be determined from data, that will take precedence
   *  over this parameter.
   * @param {*} _data - additional data stored in a property named with "_"
   *  prepended, see https://www.hl7.org/fhir/element.html#json for details.
   * @param {string} fhirNodeDataType - FHIR node data type, if the resource node
   *  is described in the FHIR model.
   */
  constructor(data, parentResNode, path, _data, fhirNodeDataType) {
    // If data is a resource (maybe a contained resource) reset the path
    // information to the resource type.
    if (data?.resourceType) {
      path = data.resourceType;
      fhirNodeDataType = data.resourceType;
    }
    this.parentResNode = parentResNode || null;
    this.path = path || null;
    this.data = data;
    this._data = _data || {};
    this.fhirNodeDataType = fhirNodeDataType || null;
  }

  /**
   * Returns resource node type info.
   * @return {TypeInfo}
   */
  getTypeInfo() {
    if (!this.typeInfo) {
      let typeInfo;

      if (TypeInfo.model) {
        if (/^System\.(.*)$/.test(this.fhirNodeDataType)) {
          typeInfo = new TypeInfo({namespace: TypeInfo.System, name: RegExp.$1});
        } else if (this.fhirNodeDataType) {
          typeInfo = new TypeInfo({
            namespace: TypeInfo.FHIR,
            name: this.fhirNodeDataType
          });
        }
      }

      this.typeInfo = typeInfo
        // Resource object properties that are not defined in the model now have
        // System.* data types:
        || TypeInfo.createByValueInSystemNamespace(this.data);
    }
    return this.typeInfo;
  }

  toJSON() {
    return JSON.stringify(this.data);
  }

  /**
   * Converts a resource node value to an instance of the FHIRPath system type
   * (FP_Quantity, FP_Date, FP_DateTime, or FP_Time) for use in evaluating
   * a FHIRPath expression if the node path matches the specified type in the
   * model and when conversion is possible, otherwise returns the data as is.
   * Throws an exception if the data is a Quantity that has a comparator.
   * The Mapping from FHIR Quantity to FHIRPath System.Quantity is explained here:
   * https://www.hl7.org/fhir/fhirpath.html#quantity
   * this.data is not changed, but converted value is returned.
   * @return {FP_Type|any}
   */
  convertData() {
    if (!this.convertedData) {
      var data = this.data;
      const cls = TypeInfo.typeToClassWithCheckString[this.path];
      if (cls) {
        data = cls.checkString(data) || data;
      } else if (TypeInfo.isType(this.path, 'Quantity')) {
        if (data?.system === ucumSystemUrl) {
          if (typeof data.value === 'number' && typeof data.code === 'string') {
            if (data.comparator !== undefined)
              throw new Error('Cannot convert a FHIR.Quantity that has a comparator');
            data = new FP_Quantity(
              data.value,
              FP_Quantity.mapUCUMCodeToTimeUnits[data.code] || '\'' + data.code + '\''
            );
          }
        }
      }

      this.convertedData = data;
    }
    return this.convertedData;
  }

}


/**
 *  Returns a ResourceNode for the given data node, checking first to see if the
 *  given node is already a ResourceNode.  Takes the same arguments as the
 *  constructor for ResourceNode.
 */
ResourceNode.makeResNode = function(data, parentResNode, path, _data, fhirNodeDataType = null) {
  return (data instanceof ResourceNode) ? data : new ResourceNode(data, parentResNode, path, _data, fhirNodeDataType);
};

// The set of available data types in the System namespace
const availableSystemTypes = new Set();
// IE11 probably doesn't support `new Set(iterable)`
['Boolean', 'String', 'Integer', 'Decimal', 'Date', 'DateTime', 'Time', 'Quantity'].forEach(i => availableSystemTypes.add(i));

/**
 * Object class defining type information.
 * Used for minimal type support.
 * (see http://hl7.org/fhirpath/#types-and-reflection)
 */
class TypeInfo {
  constructor({name, namespace}) {
    this.name = name;
    this.namespace = namespace;
  }

  // The "model" data object specific to a domain, e.g. R4.
  static model = null;

  /**
   * Checks for equality with another TypeInfo object, or that another TypeInfo
   * object specifies a superclass for the type specified by this object.
   * @param {TypeInfo} other
   * @return {boolean}
   */
  is(other) {
    if (
      other instanceof TypeInfo &&
      (!this.namespace || !other.namespace || this.namespace === other.namespace)
    ) {
      return TypeInfo.model && (!this.namespace || this.namespace === TypeInfo.FHIR)
        ? TypeInfo.isType(this.name, other.name)
        : this.name === other.name;
    }
    return false;
  }

  /**
   * Returns the string representation of type info.
   * @returns {string}
   */
  toString() {
    return (this.namespace ? this.namespace + '.' : '') + this.name;
  }

  /**
   * Returns true if type info represents a valid type identifier, false otherwise.
   * @returns {boolean}
   */
  isValid() {
    let result = false;
    if (this.namespace === 'System') {
      result = availableSystemTypes.has(this.name);
    } else if (this.namespace === 'FHIR') {
      result = TypeInfo.model?.availableTypes.has(this.name);
    } else if (!this.namespace) {
      result = availableSystemTypes.has(this.name)
        || TypeInfo.model?.availableTypes.has(this.name);
    }
    return result;
  }
}

/**
 * Defines a map from a datatype to a datatype class which has a checkString method.
 * @type {Object.<string, FP_DateTime | FP_Time>}
 */
TypeInfo.typeToClassWithCheckString = {
  date: FP_Date,
  dateTime: FP_DateTime,
  instant: FP_Instant,
  time: FP_Time
};

/**
 * Checks if the type name or its parent type name is equal to
 * the expected type name.
 * @param type - type name to check.
 * @param superType - expected type name.
 * @return {boolean}
 */
TypeInfo.isType = function(type, superType) {
  do {
    if (type === superType) {
      return true;
    }
  } while ((type = TypeInfo.model?.type2Parent[type]));
  return false;
};

// Available namespaces:
TypeInfo.System = 'System';
TypeInfo.FHIR = 'FHIR';

/**
 * Creates new TypeInfo object for specified value in the System namespace.
 * @param {*} value
 * @return {TypeInfo}
 */
TypeInfo.createByValueInSystemNamespace = function(value) {
  let name = typeof value;

  if (Number.isInteger(value)) {
    name = 'integer';
  } else if (name === "number") {
    name = 'decimal';
  } else if (value instanceof FP_Date) {
    name = 'date';
  } else if (value instanceof FP_DateTime) {
    name = 'dateTime';
  } else if (value instanceof FP_Time) {
    name = 'time';
  } else if (value instanceof FP_Quantity) {
    name = 'Quantity';
  }

  name = name.replace(/^\w/, c => c.toUpperCase());

  // Currently can return name = "Object" which is probably wrong,
  // but the isValid method allows you to check this.
  return new TypeInfo({namespace: TypeInfo.System, name}) ;
};

/**
 * Retrieves TypeInfo by value
 * @param {*} value
 * @return {TypeInfo}
 */
TypeInfo.fromValue = function (value) {
  return value instanceof ResourceNode
    ? value.getTypeInfo()
    : TypeInfo.createByValueInSystemNamespace(value);
};

/**
 * Set of primitive data type names.
 */
const primitives = new Set();
// IE11 probably doesn't support `new Set(iterable)`
[
  "instant",
  "time",
  "date",
  "dateTime",
  "base64Binary",
  "decimal",
  "integer64",
  "boolean",
  "string",
  "code",
  "markdown",
  "id",
  "integer",
  "unsignedInt",
  "positiveInt",
  "uri",
  "oid",
  "uuid",
  "canonical",
  "url",
  "Integer",
  "Decimal",
  "String",
  "Date",
  "DateTime",
  "Time"
].forEach(i => primitives.add(i));

/**
 * Checks whether the specified type information contains a primitive data type.
 * @param {TypeInfo} typeInfo
 * @return {boolean}
 */
TypeInfo.isPrimitive = function(typeInfo) {
  return primitives.has(typeInfo.name);
};

/**
 * Basic "type()" function implementation
 * (see http://hl7.org/fhirpath/#reflection)
 * @param {Array<*>} coll - input collection
 * @return {Array<*>}
 */
function typeFn(coll) {
  return coll.map(value => {
    return TypeInfo.fromValue(value);
  });
}

/**
 * Implementation of function "is(type : type specifier)" and operator "is"
 * (see http://hl7.org/fhirpath/#is-type-specifier)
 * @param {Array<*>} coll - input collection
 * @param {TypeInfo} typeInfo
 * @return {boolean|[]}
 */
function isFn(coll, typeInfo) {
  if(coll.length === 0) {
    return [];
  }

  if(coll.length > 1) {
    throw new Error("Expected singleton on left side of 'is', got " + JSON.stringify(coll));
  }

  return TypeInfo.fromValue(coll[0]).is(typeInfo);
}

/**
 * Implementation of function "as(type : type specifier)" and operator "as"
 * (see http://hl7.org/fhirpath/#as-type-specifier)
 * @param {Array<*>} coll - input collection
 * @param {TypeInfo} typeInfo
 * @return {Array<*>}
 */
function asFn(coll, typeInfo) {
  if(coll.length === 0) {
    return [];
  }

  if(coll.length > 1) {
    throw new Error("Expected singleton on left side of 'as', got " + JSON.stringify(coll));
  }

  return TypeInfo.fromValue(coll[0]).is(typeInfo) ? coll : [];
}

module.exports = {
  FP_Type,
  FP_TimeBase,
  FP_Date,
  FP_DateTime,
  FP_Instant,
  FP_Time,
  FP_Quantity,
  timeRE,
  dateTimeRE,
  dateRE,
  instantRE,
  ResourceNode,
  TypeInfo,
  typeFn,
  isFn,
  asFn
};
