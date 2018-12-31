let timeFormat =
  '[0-9][0-9](\\:[0-9][0-9](\\:[0-9][0-9](\\.[0-9]+)?)?)?(Z|(\\+|-)[0-9][0-9]\\:[0-9][0-9])?';
let timeRE = new RegExp('^T?'+timeFormat+'$');
let dateTimeRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T'+timeFormat+')?)?)?Z?$');
let fhirTimeRE = /([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?/;
let fhirDateTimeRE =
/([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?/;


// testEnvironment: node in jest config
// --runInBand
class FP_Type {
  /**
   *  Tests whether this object is equal to another.  Returns either true,
   *  false, or undefined (where in the FHIRPath specification empty would be
   *  returned).
   */
  equals(/* otherObj */) {
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

class FP_DateTime extends FP_Type {
  constructor(dateStr) {
    super();
    this.asString = dateStr;
    this.dateObj = new Date(dateStr);
    var dateMatchData = dateStr.match(dateTimeRE);
    this.maxPrecision = dateMatchData[6] ? 'ms' :
      dateMatchData[5] ? 's' : dateMatchData[4] ? 'min' :
        dateMatchData[3] ? 'h' : dateMatchData[2] ? 'd' :
          dateMatchData[1] ? 'month' : 'y';
  }

  equals(otherDateTime) {
    var rtn;
    if (!(otherDateTime instanceof FP_DateTime))
      rtn = false;
    else if (this.maxPrecision == otherDateTime.maxPrecision)
      rtn = this.dateObj.getTime() == otherDateTime.dateObj.getTime();
    return rtn;
  }

  /**
   *  Returns -1, 0, or 1 if this date time is less then, equal to, or greater
   *  than otherDateTime.  Comparisons are made at the lesser of the two date time
   *  precisions.
   */
  compare(otherDateTime) {
    if (!(otherDateTime instanceof FP_DateTime))
      throw 'Invalid comparison of a DateTime with something else';
    //var thisPrecision = this._getPrecision();
    return false;
  }
}

class FP_Time extends FP_Type {
  constructor(timeStr) {
    super();
    if (timeStr[0] == 'T')
      timeStr = timeStr.slice(1);
    this.asStr = timeStr;
  }

  equals(otherTime) {
    var rtn;
    if (!(otherTime instanceof FP_Time))
      rtn = false;
    else if (this._getPrecision() == otherTime._getPrecision())
      rtn = this._getDateObj().getTime() == otherTime._getDateObj().getTime();
    return rtn;
  }

  /**
   *  Returns -1, 0, or 1 if this time is less then, equal to, or greater
   *  than otherTime.  Comparisons are made at the lesser of the two time
   *  precisions.
   */
  compare(otherTime) {
    if (!(otherTime instanceof FP_Time))
      throw 'Invalid comparison of a time with something else';
    var thisPrecision = this._getPrecision();
    var otherPrecision = otherTime._getPrecision();
    var thisTimeInt, otherTimeInt;
    if (thisPrecision === otherPrecision) {
      thisTimeInt = this._getDateObj().getTime();
      otherTimeInt = otherTime._getDateObj().getTime();
    }
    else {
      if (thisPrecision > otherPrecision) {
        thisTimeInt = this._dateAtPrecision(otherPrecision).getTime();
        otherTimeInt = otherTime._getDateObj().getTime();
      }
      else {
        thisTimeInt = this._getDateObj().getTime();
        otherTimeInt = otherTime._dateAtPrecision(thisPrecision).getTime();
      }
    }
    return thisTimeInt < otherTimeInt ?
      -1 : thisTimeInt === otherTimeInt ? 0 : 1;
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
   *  Returns a number representing the precision of the time string given to
   *  the constructor.  (Higher means more precise).  The number is the number
   *  of components of the time string (ignoring the time zone) produced by
   *  matching against the time regular expression.
   */
  _getPrecision() {
    if (this.maxPrecision === undefined)
      this._getMatchData();
    return this.maxPrecision;
  }

  /**
   *  Returns the match data from matching timeRE against the time string.
   *  Also sets this.maxPrecision.
   */
  _getMatchData() {
    if (!this.timeMatchData) {
      this.timeMatchData = this.asStr.match(timeRE);
      for (let i=3; i>=0 && this.maxPrecision === undefined; --i) {
        if (this.timeMatchData[i])
          this.maxPrecision = i;
      }
    }
    return this.timeMatchData;
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
      this.timeParts = [];
      var timeMatchData = this._getMatchData();
      // Finish parsing the data into pieces, for later use in building
      // lower-precision versions of the date if needed.
      this.timeParts = [timeMatchData[0]];
      var timeZone = timeMatchData[4];
      if (timeZone) { // remove time zone from hours
        let hours = this.timeParts[0];
        this.timeParts[0] = hours.slice(0, hours.length-timeZone.length);
      }
      var min = timeMatchData[1];
      if (min) { // remove minutes from hours
        this.maxPrecision = 1;
        let hours = this.timeParts[0];
        this.timeParts[0] = hours.slice(0, hours.length-min.length);
        this.timeParts[1] = min;
        var sec = timeMatchData[2];
        if (sec) { // remove seconds from minutes
          this.maxPrecision = 2;
          this.timeParts[1] = min.slice(0, min.length-sec.length);
          this.timeParts[2] = sec;
          var ms = timeMatchData[3];
          if (ms) { // remove milliseconds from seconds
            this.maxPrecision = 3;
            this.timeParts[2] = sec.slice(0, sec.length-ms.length);
            this.timeParts[3] = ms;
          }
        }
      }
    }
    return this.timeParts;
  }
}


/**
 *  Adds types to a FHIR resource that was parsed from JSON.  Some types such as
 *  times are just represented as strings in the JSON format.
 * @param resource a FHIR resource.  This will be modified by this function.
 * @return the modified resource
 */
function addTypes(resource) {
  var rtn = resource;
  // Eventually this might take a second optional parameter that would provide type
  // information pulled from a specific version of FHIR.  In the absence of such
  // information we will just guess based on what the strings look like.
  if (resource instanceof Object && !(resource instanceof FP_Type)) {
    let keys = Object.keys(resource);
    for (let i=0, len=keys.length; i<len; ++i) {
      let key = keys[i];
      resource[key] = addTypes(resource[key]);
    }
  }
  else if (typeof resource == "string") {
    if (resource.match(fhirDateTimeRE))
      rtn = new FP_DateTime(resource);
    else if (resource.match(fhirTimeRE))
      rtn = new FP_Time(resource);
  }
  return rtn;
}


module.exports = {
  addTypes: addTypes,
  FP_Type: FP_Type,
  FP_DateTime: FP_DateTime,
  FP_Time: FP_Time,
  timeRE: timeRE,
  dateTimeRE: dateTimeRE
};
