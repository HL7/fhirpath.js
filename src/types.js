let timeFormat =
  '[0-9][0-9](\\:[0-9][0-9](\\:[0-9][0-9](\\.[0-9]+)?)?)?(Z|(\\+|-)[0-9][0-9]\\:[0-9][0-9])?';
let timeRE = new RegExp('^T?'+timeFormat+'$');
let dateTimeRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T'+timeFormat+')?)?)?Z?$');

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
}

class FP_Time extends FP_Type {
  constructor(timeStr) {
    super();
    if (timeStr[0] == 'T')
      timeStr = timeStr.slice(1);
    this.asStr = timeStr;
    // Create a date object for use in comparing times.  Add a fixed date
    // part so as not to be influenced by system time & date.
    this.dateObj = new Date('2010T'+timeStr);
    var timeMatchData = timeStr.match(timeRE);
    this.maxPrecision = timeMatchData[3] ? 'ms' :
      timeMatchData[2] ? 's' : timeMatchData[1] ? 'min' : 'h';
  }

  equals(otherTime) {
    var rtn;
    if (!(otherTime instanceof FP_Time))
      rtn = false;
    else if (this.maxPrecision == otherTime.maxPrecision)
      rtn = this.dateObj.getTime() == otherTime.dateObj.getTime();
    return rtn;
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
    if (resource.match(dateTimeRE))
      rtn = new FP_DateTime(resource);
    else if (resource.match(timeRE))
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
