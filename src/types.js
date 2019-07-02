//import * as moment from 'moment';
//const moment = require('moment');
const addYears = require('date-fns/add_years');
const addMonths = require('date-fns/add_months');
const addWeeks = require('date-fns/add_weeks');
const addDays = require('date-fns/add_days');
const addHours = require('date-fns/add_hours');
const addMinutes = require('date-fns/add_minutes');
const ucumUtils = require('@lhncbc/ucum-lhc').UcumLhcUtils.getInstance();

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
}

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
}


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
}


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

console.log("%%% oldDate = "+this._getDateObj());
    var newDate = FP_TimeBase.timeUnitToAddFn[ucumUnit](this._getDateObj(), qVal);
console.log("%%% newDate = "+newDate);
    // newDate is a Date.  We need to make a string with the correct precision.
    var isTime = (cls === FP_Time);
    var precision = this._getPrecision();
    if (isTime)
      precision += 4; // based on dateTimeRE, not timeRE
    var newDateStr = isoDateTime(newDate, precision);
    if (cls === FP_Time) {
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
      var thisPrec = this._getPrecision();
      var otherPrec = otherDateTime._getPrecision();
      if (thisPrec == otherPrec)
        rtn = this._getDateObj().getTime()==otherDateTime._getDateObj().getTime();
      else {
        // The dates are not equal, but decide whether to return empty or false.
        var commonPrec = thisPrec <= otherPrec ? thisPrec : otherPrec;
        // Adjust for timezone offsets, if any, so they are at a common timezone
        var thisUTCStr = this._getDateObj().toISOString();
        var otherUTCStr = otherDateTime._getDateObj().toISOString();
        // Now parse the strings and compare the adjusted time parts.
        var thisAdj = (new FP_DateTime(thisUTCStr))._getTimeParts();
        var otherAdj = (new FP_DateTime(otherUTCStr))._getTimeParts();
        if (this.constructor === FP_Time)
          commonPrec += 3; // because we now have year, month, and day
        for (var i=0; i<=commonPrec && rtn !== false; ++i) {
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
   *  Returns a datetime string for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.
   */
  _dateStrAtPrecision(precision) {
console.log("%%% precision = "+precision);
    var timeParts = this._getTimeParts().slice(0, precision+1);
    var timeZone = this._getMatchData()[7];
console.log("%%% timeZone="+timeZone);
    var hasTime = timeParts.length > 3;
    if (hasTime) {
      timeParts[3] = 'T' + timeParts[3]; // restore the T removed before
      if (timeParts.length === 4)
        timeParts[4] = ':00'; // Date constructor requires minutes with hour
    }
    // TBD- In FHIRPath R2, a timezone can be present without a time
    var timeStr = timeParts.join('');
    if (timeParts.length > 3) { // has a time part
      if (timeZone)
        timeStr += timeZone;
    }
console.log("%%% dateStrAtPrecision = "+timeStr);
    return timeStr;
  }


  /**
   *  Returns a new Date object for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.
   */
  _dateAtPrecision(precision) {
    return new Date(this._dateStrAtPrecision(precision));
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
   *  Returns a time string for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.  This
   *  string will just be the time, without a "T", and not the date part.
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.
   */
  _dateStrAtPrecision(precision) {
    var timeParts = this._getTimeParts().slice(0, precision+1);
    var timeStr = timeParts.join('');
    var timeZone = this._getMatchData()[4];
    if (timeZone)
      timeStr += timeZone;
    return timeStr;
  }


  /**
   *  Returns a new Date object for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.
   */
  _dateAtPrecision(precision) {
    var timeParts = this._getTimeParts().slice(0, precision+1);
    if (precision === 0)
      timeParts[2] = ':00'; // Date constructor requires minutes
    var timeZone = this._getMatchData()[4];
    if (timeZone)
      timeParts.push(timeZone);
    return new Date('2010T'+timeParts.join(''));
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
 *  Formats the given date object into an ISO8601 datetime string, preserving
 *  the time offset.
 * @date the date to format
 * @precision the precision at which to terminate string string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  dateTimeRE.
 * @return a string in ISO8601 format.
 */
function isoDateTime(date, precision) {
  // YYYY-MM-DDTHH:mm:ss.sss[+-]HH:mm
  // Note:  Date.toISOString sets the timezone at 'Z', which we don't want to do
  var rtn = date.getFullYear();
  if (precision > 1) {
    rtn += '-' + formatNum(date.getMonth() + 1);
    if (precision > 2 {
      rtn += '-' + formatNum(date.getDate());
      if (precision > 3) {
        rtn += 'T' + formatNum(date.getHours());
        if (precision > 4) {
          rtn += ':' + formatNum(date.getMinutes());
          if (precision > 5) {
            rtn += ':' + formatNum(date.getSeconds());
            if (precision > 6)
              rtn += formatNum(date.getMilliseconds(), 3);
          }
        }
      }
    }
  }
  var tzOffset = date.getTimezoneOffset();
  // tzOffset is a number of minutes, and is positive for negative timezones,
  // and negative for positive timezones.
  var tzSign = tzOffset < 0 ? '+' : '-';
  tzOffset = Math.abs(tzOffset);
  var tzMin = tzOffset % 60;
  var tzHour = formatNum((tzOffset - tzMin) / 60);
  return ''+year+'-'+month+'-'+day+'T'+hour+':'+min+':'+sec+'.'+
    mil + tzSign + tzHour + ':' + formatNum(tzMin));
}


module.exports = {
  FP_Type: FP_Type,
  FP_TimeBase: FP_TimeBase,
  FP_DateTime: FP_DateTime,
  FP_Time: FP_Time,
  FP_Quantity: FP_Quantity,
  timeRE: timeRE,
  dateTimeRE: dateTimeRE,
};
