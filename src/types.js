const addMinutes = require('date-fns/add_minutes');
const ucumUtils = require('@lhncbc/ucum-lhc').UcumLhcUtils.getInstance();
const numbers = require('./numbers');

const ucumSystemUrl = 'http://unitsofmeasure.org';
let timeFormat =
  '[0-9][0-9](\\:[0-9][0-9](\\:[0-9][0-9](\\.[0-9]+)?)?)?(Z|(\\+|-)[0-9][0-9]\\:[0-9][0-9])?';
let timeRE = new RegExp('^T?'+timeFormat+'$');
let dateTimeRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T'+timeFormat+')?)?)?Z?$');
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
    throw 'Not implemented';
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
 *  Defines a map from FHIRPath time units to UCUM.
 */
FP_Quantity.timeUnitsToUCUM = {
  'years': "'a'",
  'months': "'mo'",
  'weeks': "'wk'",
  'days': "'d'",
  'hours': "'h'",
  'minutes': "'min'",
  'seconds': "'s'",
  'milliseconds': "'ms'",
  'year': "'a'",
  'month': "'mo'",
  'week': "'wk'",
  'day': "'d'",
  'hour': "'h'",
  'minute': "'min'",
  'second': "'s'",
  'millisecond': "'ms'",
  "'a'": "'a'",
  "'mo'": "'mo'",
  "'wk'": "'wk'",
  "'d'": "'d'",
  "'h'": "'h'",
  "'min'": "'min'",
  "'s'": "'s'",
  "'ms'": "'ms'"
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

/**
 *  A map of the UCUM units that must be paired with integer values when doing
 *  arithmetic.
 */
FP_Quantity.integerUnits = {
  "'a'": true,
  "'mo'": true,
  "'wk'": true,
  "'d'": true,
  "'h'": true,
  "'min'": true
};


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
    var unit = timeQuantity.unit;
    var ucumUnit = FP_Quantity.timeUnitsToUCUM[unit];
    if (!ucumUnit) {
      throw new Error('For date/time arithmetic, the unit of the quantity '+
        'must be a recognized time-based unit');
    }
    var cls = this.constructor;
    var unitPrecision = cls._ucumToDatePrecision[ucumUnit];
    if (unitPrecision === undefined) {
      throw new Error('Unsupported unit for +.  The unit should be one of '+
        Object.keys(cls._ucumToDatePrecision).join(', ') + '.');
    }
    var isIntUnit = FP_Quantity.integerUnits[ucumUnit];
    var qVal = timeQuantity.value;
    if (isIntUnit && !Number.isInteger(qVal)) {
      throw new Error('When adding a quantity of unit '+unit+' to a date/time,'+
        ' the value must be an integer.');
    }

    // If the precision of the time quantity is higher than the precision of the
    // date, we need to convert the time quantity to the precision of the date.
    if (this._getPrecision() < unitPrecision) {
      var unquotedUnit = ucumUnit.slice(1, ucumUnit.length-1);
      var neededUnit = cls._datePrecisionToUnquotedUcum[
        this._getPrecision()];
      var convResult = ucumUtils.convertUnitTo(unquotedUnit, qVal, neededUnit);
      if (convResult.status != 'succeeded') {
        throw new Error(convResult.msg.join("\n"));
      }
      ucumUnit = "'"+neededUnit+"'";
      qVal = Math.floor(convResult.toVal);
    }
    var newDate = FP_TimeBase.timeUnitToAddFn[ucumUnit](this._getDateObj(), qVal);
    // newDate is a Date.  We need to make a string with the correct precision.
    var isTime = (cls === FP_Time);
    var precision = this._getPrecision();
    if (isTime)
      precision += 3; // based on dateTimeRE, not timeRE
    var newDateStr = FP_DateTime.isoDateTime(newDate, precision);
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
    if (!(otherDateTime instanceof this.constructor))
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
   *  Returns -1, 0, or 1 if this (date) time is less then, equal to, or greater
   *  than otherTime.  Comparisons are made at the lesser of the two time
   *  precisions.
   */
  compare(otherTime) {
    var thisPrecision = this._getPrecision();
    var otherPrecision = otherTime._getPrecision();
    var thisTimeInt = thisPrecision <= otherPrecision ?
      this._getDateObj().getTime(): this._dateAtPrecision(otherPrecision).getTime();
    var otherTimeInt = otherPrecision <= thisPrecision ?
      otherTime._getDateObj().getTime(): otherTime._dateAtPrecision(thisPrecision).getTime();
    return thisTimeInt < otherTimeInt ?
      -1 : thisTimeInt === otherTimeInt ? 0 : 1;
  }


  /**
   *  Returns a number representing the precision of the time string given to
   *  the constructor.  (Higher means more precise).  The number is the number
   *  of components of the time string (ignoring the time zone) produced by
   *  matching against the time regular expression.
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
 *  A map from a UCUM time based unit to a function used to add that quantity to
 *  a date/time.
 */
FP_TimeBase.timeUnitToAddFn = {
  "'a'": require('date-fns/add_years'),
  "'mo'": require('date-fns/add_months'),
  "'wk'": require('date-fns/add_weeks'),
  "'d'": require('date-fns/add_days'),
  "'h'": require('date-fns/add_hours'),
  "'min'": require('date-fns/add_minutes'),
  "'s'": require('date-fns/add_seconds'),
  "'ms'": require('date-fns/add_milliseconds')
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
   *  Returns the match data from matching timeRE against the time string.
   *  Also sets this.precision.
   */
  _getMatchData() {
    return super._getMatchData(dateTimeRE, 6);
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
    var ms = thisPrecision > 5 ? parseInt(timeParts[6].slice(1)): 0;
    var d = this._createDate(year, month, day, hour, minutes, seconds, ms,
      timezoneOffset);
    if (precision < this._getPrecision()) {
      // Adjust the precision
      year = d.getFullYear();
      month = precision > 0 ? d.getMonth() : 0;
      day = precision > 1 ? d.getDate() : 1;
      hour = precision > 2 ? d.getHours() : 0;
      minutes = precision > 3 ? d.getMinutes(): 0;
      seconds = precision > 4 ? d.getSeconds(): 0;
      ms = precision > 5 ? d.getMilliseconds(): 0;
      d = new Date(year, month, day, hour, minutes, seconds, ms);
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
 *  A map from UCUM units (in quotation marks, which is the FHIRPath syntax for
 *  UCUM) to the internal DateTime "precision" number.
 */
FP_DateTime._ucumToDatePrecision = {
  "'a'": 0,
  "'mo'": 1,
  "'wk'": 2, // wk is just 7*d
  "'d'": 2,
  "'h'": 3,
  "'min'": 4,
  "'s'": 5,
  "'ms'": 6
};

/**
 *  The inverse of _ucumToDatePrecision, except with unquoted UCUM units.
 */
FP_DateTime._datePrecisionToUnquotedUcum = ["a", "mo", "d", "h", "min", "s",
  "ms"];



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
    var ms = thisPrecision > 2 ? parseInt(timeParts[3].slice(1)): 0;
    var d = this._createDate(year, month, day, hour, minutes, seconds, ms,
      timezoneOffset);
    if (timezoneOffset) {
      // Keep the date the same (in the local timezone), so it is not a relevant
      // factor when comparing different times.
      d.setYear(year);
      d.setMonth(month);
      d.setDate(day);
    }
    if (precision < this._getPrecision()) {
      // Adjust the precision
      hour = d.getHours();
      minutes = precision > 0 ? d.getMinutes(): 0;
      seconds = precision > 1 ? d.getSeconds(): 0;
      ms = precision > 2 ? d.getMilliseconds(): 0;
      d = new Date(year, month, day, hour, minutes, seconds, ms);
    }
    return d;
  }


  /**
   *  Returns the match data from matching timeRE against the time string.
   *  Also sets this.precision.
   */
  _getMatchData() {
    return super._getMatchData(timeRE, 3);
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
 *  A map from UCUM units (in quotation marks, which is the FHIRPath syntax for
 *  UCUM) to the internal DateTime "precision" number.
 */
FP_Time._ucumToDatePrecision = {
  "'h'": 0,
  "'min'": 1,
  "'s'": 2,
  "'ms'": 3
};

/**
 *  The inverse of _ucumToDatePrecision, except with unquoted UCUM units.
 */
FP_Time._datePrecisionToUnquotedUcum = ["h", "min", "s", "ms"];


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
    precision = 6; // maximum
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
        rtn += 'T' + formatNum(date.getHours());
        if (precision > 3) {
          rtn += ':' + formatNum(date.getMinutes());
          if (precision > 4) {
            rtn += ':' + formatNum(date.getSeconds());
            if (precision > 5)
              rtn += '.' + formatNum(date.getMilliseconds(), 3);
          }
        }
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
 *  Returns a date string in ISO format at the given precision level.
 * @date the date to format
 * @precision the precision at which to terminate string string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  dateTimeRE.
 * @return a string in ISO8601 format.
 */
FP_DateTime.isoDate = function(date, precision) {
  if (precision === undefined || precision > 2)
    precision = 2;
  return FP_DateTime.isoDateTime(date, precision);
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
   * @param data the node's data or value (which might be an object with
   *  sub-nodes, an array, or FHIR data type)
   * @param path the node's path in the resource (e.g. Patient.name).  If the
   *  data's type can be determined from data, that will take precedence over
   *  this parameter.
   */
  constructor(data, path) {
    // console.log('>>>', path);
    // console.log(JSON.stringify(data, null, 4));
    // If data is a resource (maybe a contained resource) reset the path
    // information to the resource type.
    if (data.resourceType)
      path = data.resourceType;
    this.path = path;
    this.data = getResourceNodeData(data, path);
  }

  toJSON() {
    return JSON.stringify(this.data);
  }
}

/**
 * Prepare data for ResourceNode:
 * Converts value from FHIR Quantity to FHIRPath System.Quantity.
 * The Mapping from FHIR Quantity to FHIRPath System.Quantity is explained here:
 * https://www.hl7.org/fhir/fhirpath.html#quantity
 * @param {Object|...} data
 * @param {string} path
 * @return {FP_Quantity|Object|...}
 */
function getResourceNodeData(data, path) {
  if (path === 'Quantity' && data.system === ucumSystemUrl) {
    if (typeof data.value === 'number' && typeof data.code === 'string') {
      data = new FP_Quantity(data.value, FP_Quantity.mapUCUMCodeToTimeUnits[data.code] || '\'' + data.code + '\'');
    }
  }

  return data;
}

/**
 *  Returns a ResourceNode for the given data node, checking first to see if the
 *  given node is already a ResourceNode.  Takes the same arguments as the
 *  constructor for ResourceNode.
 */
ResourceNode.makeResNode = function(data, path) {
  return (data instanceof ResourceNode) ? data : new ResourceNode(data, path);
};

module.exports = {
  FP_Type: FP_Type,
  FP_TimeBase: FP_TimeBase,
  FP_DateTime: FP_DateTime,
  FP_Time: FP_Time,
  FP_Quantity: FP_Quantity,
  timeRE: timeRE,
  dateTimeRE: dateTimeRE,
  ResourceNode: ResourceNode
};
