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


class FP_Quantity extends FP_Type {
  constructor(value, unit) {
    super();
    this.asStr = value + ' ' + unit;
  }
}


class FP_TimeBase extends FP_Type {
  constructor(timeStr) {
    super();
    this.asStr = timeStr;
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
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.
   */
  _dateAtPrecision(precision) {
    var timeParts = this._getTimeParts().slice(0, precision+1);
    var timeZone = this._getMatchData()[7];
    var hasTime = timeParts.length > 3;
    if (hasTime) {
      timeParts[3] = 'T' + timeParts[3]; // restore the T removed before
      if (timeParts.length === 4)
        timeParts[4] = ':00'; // Date constructor requires minutes with hour
    }
    else if (timeZone) {
      // The date constructor requires a time if a time zone is present.
      timeParts[3] = 'T00';
      timeParts[4]= ':00';
    }
    var timeStr = timeParts.join('');
    if (timeParts.length > 3) { // has a time part
      if (timeZone)
        timeStr += timeZone;
    }
    return new Date(timeStr);
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
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.
   */
  _dateAtPrecision(precision) {
    var timeParts = this._getTimeParts().slice(0, precision+1);
    if (timeParts.length === 1)
      timeParts[1] = ':00'; // Date constructor requires minutes
    var timeStr = '2010T'+timeParts.join('');
    var timeZone = this._getMatchData()[4];
    if (timeZone)
      timeStr += timeZone;
    return new Date(timeStr);
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


module.exports = {
  FP_Type: FP_Type,
  FP_DateTime: FP_DateTime,
  FP_Time: FP_Time,
  FP_Quantity: FP_Quantity,
  timeRE: timeRE,
  dateTimeRE: dateTimeRE
};
