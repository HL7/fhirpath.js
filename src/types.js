let timeFormat = '[0-9][0-9](\\:[0-9][0-9](\\:[0-9][0-9](\\.[0-9]+)?)?)?(Z|(\\+|-)[0-9][0-9]\\:[0-9][0-9])?'
let timeRE = new RegExp('^'+timeFormat+'$');
let dateTimeRE = new RegExp('^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T'+timeFormat+')?)?)?Z?$')

// testEnvironment: node in jest config
// --runInBand
class FP_Type {
  equals(otherObj) {
    return [false];
  }
}

class FP_DateTime extends FP_Type {
  constructor(dateStr) {
    super();
    this.dateStr = dateStr
    this.dateObj = new Date(dateStr);
    var dateMatchData = dateStr.match(dateTimeRE);
    this.maxPrecision = dateMatchData[6] ? 'ms' :
      dateMatchData[5] ? 's' : dateMatchData[4] ? 'min' :
      dateMatchData[3] ? 'h' : dateMatchData[2] ? 'd' :
      dateMatchData[1] ? 'month' : 'y'
  }

  toString() {
    return this.dateStr;
  }

  equals(otherDateTime) {
    var rtn = [];
    if (!(otherDateTime instanceof FP_DateTime))
      rtn.push(false);
    else if (this.maxPrecision == otherDateTime.maxPrecision)
      rtn.push(this.dateObj.getTime() == otherDateTime.dateObj.getTime());
    return rtn;
  }
}

class FP_Time extends FP_Type {
  constructor(timeStr) {
    super();
   // TBD set precision
  }

  equals(otherTime) {
    var rtn = [];
    if (!(otherTime instanceof FP_Time))
      rtn.push(false);
    else
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
  if (resource instanceof Object) {
    let keys = Object.keys(resource);
    for (let i=0, len=keys.length; i<len; ++i) {
      let key = keys[i];
      resource[key] = addTypes(resource[key]);
    }
  }
  else if (typeof resource == "string") {
    if (resource.match(dateTimeRE))
      rtn = new FP_DateTime(resource);
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
}
