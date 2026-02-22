var engine = {};
const types = require('./types');
const constants = require('./constants');
const util = require('./utilities');
const FP_Date = types.FP_Date;
const FP_DateTime = types.FP_DateTime;
const FP_Time = types.FP_Time;
const ResourceNode = types.ResourceNode;

/**
 *  Implements FHIRPath now().
 */
engine.now = function(){
  if (!constants.now) {
    // return new FP_DateTime((new Date()).toISOString());
    // The above would construct an FP_DateTime with a timezone of "Z", which
    // would not make a difference for computation, but if the end result of an
    // expression is "now()", then it would look different when output to a user.
    // Construct it ourselves to preserve timezone
    var now = constants.nowDate; // a JS Date
    var isoStr = FP_DateTime.isoDateTime(now);
    constants.now = new FP_DateTime(isoStr);
  }
  return constants.now;
};


/**
 *  Implements FHIRPath today().  See comments in now(). This does not
 *  include a timezone offset.
 */
engine.today = function(){
  if (!constants.today) {
    // Construct the string ourselves to preserve timezone
    var now = constants.nowDate; // a JS Date
    var isoStr = FP_Date.isoDate(now);
    constants.today = new FP_Date(isoStr);
  }
  return constants.today;
};

/**
 *  Implements FHIRPath timeOfDay().  See comments in now(). This does not
 *  include a timezone offset.
 */
engine.timeOfDay = function() {
  if (!constants.timeOfDay) {
    // Construct the string ourselves to preserve timezone
    const now = constants.nowDate; // a JS Date
    const isoStr = FP_DateTime.isoTime(now);
    constants.timeOfDay = new FP_Time(isoStr);
  }
  return constants.timeOfDay;
};

/**
 *  Returns the FP_DateTime or FP_Date value from a collection item,
 *  converting from ResourceNode if necessary.
 *  @param {*} item - a collection item
 *  @return {FP_DateTime|FP_Date|FP_Time|null}
 */
function toDateTimeValue(item) {
  let v = item instanceof ResourceNode ? item.convertData() : item;
  if (v instanceof FP_DateTime || v instanceof FP_Date || v instanceof FP_Time) {
    return v;
  }
  if (typeof v === 'string') {
    return FP_DateTime.checkString(v) || FP_Date.checkString(v) || FP_Time.checkString(v);
  }
  return null;
}

/**
 *  Validates that coll is a singleton and returns the date/time value,
 *  or returns null if the collection is empty or the value is not a date/time.
 *  @param {Array} coll - input collection
 *  @param {string} fnName - function name for error messages
 *  @return {FP_DateTime|FP_Date|FP_Time|null}
 */
function getSingletonDateTimeValue(coll, fnName) {
  if (coll.length === 0) return null;
  if (coll.length > 1) {
    util.raiseError('Expected singleton input', fnName);
  }
  return toDateTimeValue(coll[0]);
}

/**
 *  Implements FHIRPath yearOf().
 *  Returns the year component of a Date or DateTime value as an Integer.
 */
engine.yearOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'yearOf');
  if (v instanceof FP_Time || !v) return [];
  return parseInt(v._getTimeParts()[0]);
};

/**
 *  Implements FHIRPath monthOf().
 *  Returns the month component of a Date or DateTime value as an Integer.
 *  If the value does not have month precision, returns empty.
 */
engine.monthOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'monthOf');
  if (v instanceof FP_Time || !v) return [];
  if (v._getPrecision() < 1) return [];
  return parseInt(v._getTimeParts()[1].slice(1));
};

/**
 *  Implements FHIRPath dayOf().
 *  Returns the day component of a Date or DateTime value as an Integer.
 *  If the value does not have day precision, returns empty.
 */
engine.dayOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'dayOf');
  if (v instanceof FP_Time || !v) return [];
  if (v._getPrecision() < 2) return [];
  return parseInt(v._getTimeParts()[2].slice(1));
};

/**
 *  Implements FHIRPath hourOf().
 *  Returns the hour component of a DateTime or Time value as an Integer.
 *  For DateTime, requires precision >= 3. For Time, requires precision >= 0.
 *  Not valid for Date values.
 */
engine.hourOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'hourOf');
  if (!v) return [];
  if (v instanceof FP_Time) {
    // Time always has at least hour precision
    return parseInt(v._getTimeParts()[0]);
  }
  // FP_Date has no time component
  if (v instanceof FP_Date) return [];
  // FP_DateTime needs precision >= 3 (hour)
  if (v._getPrecision() < 3) return [];
  return parseInt(v._getTimeParts()[3]);
};

/**
 *  Implements FHIRPath minuteOf().
 *  Returns the minute component of a DateTime or Time value as an Integer.
 *  For DateTime, requires precision >= 4. For Time, requires precision >= 1.
 *  Not valid for Date values.
 */
engine.minuteOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'minuteOf');
  if (!v) return [];
  if (v instanceof FP_Time) {
    if (v._getPrecision() < 1) return [];
    return parseInt(v._getTimeParts()[1].slice(1));
  }
  if (v instanceof FP_Date) return [];
  if (v._getPrecision() < 4) return [];
  return parseInt(v._getTimeParts()[4].slice(1));
};

/**
 *  Implements FHIRPath secondOf().
 *  Returns the second component of a DateTime or Time value as an Integer.
 *  For DateTime, requires precision >= 5. For Time, requires precision >= 2.
 *  Not valid for Date values.
 */
engine.secondOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'secondOf');
  if (!v) return [];
  if (v instanceof FP_Time) {
    if (v._getPrecision() < 2) return [];
    return parseInt(v._getTimeParts()[2].slice(1));
  }
  if (v instanceof FP_Date) return [];
  if (v._getPrecision() < 5) return [];
  return parseInt(v._getTimeParts()[5].slice(1));
};

/**
 *  Implements FHIRPath millisecondOf().
 *  Returns the millisecond component of a DateTime or Time value as an Integer.
 *  Requires millisecond precision in the input value.
 *  Not valid for Date values.
 */
engine.millisecondOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'millisecondOf');
  if (!v) return [];
  if (v instanceof FP_Time) {
    const timeParts = v._getTimeParts();
    if (timeParts.length <= 3) return [];
    return parseInt(timeParts[3].slice(1));
  }
  if (v instanceof FP_Date) return [];
  const timeParts = v._getTimeParts();
  if (timeParts.length <= 6) return [];
  return parseInt(timeParts[6].slice(1));
};

/**
 *  Implements FHIRPath timezoneOffsetOf().
 *  Returns the timezone offset of a DateTime value as a decimal number of
 *  hours from UTC (e.g. -7.0, 8.75). Returns empty if no timezone is present,
 *  or if the input is not a DateTime.
 */
engine.timezoneOffsetOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'timezoneOffsetOf');
  if (!v) return [];
  // Only valid for DateTime — not Date-only (FP_Date) or Time (FP_Time).
  // FP_Date extends FP_DateTime, so check FP_Date before FP_DateTime.
  if (v instanceof FP_Time || v instanceof FP_Date) return [];
  const tz = v._getMatchData()[7];
  if (!tz) return [];
  if (tz === 'Z') return [0.0];
  const sign = tz[0] === '-' ? -1 : 1;
  const colonIdx = tz.indexOf(':');
  const hours = parseInt(tz.slice(1, colonIdx));
  const minutes = parseInt(tz.slice(colonIdx + 1));
  return [sign * (hours + minutes / 60)];
};

/**
 *  Implements FHIRPath dateOf().
 *  Returns the date component of a Date or DateTime value as an FP_Date.
 *  Returns empty for Time values or empty collections.
 */
engine.dateOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'dateOf');
  if (!v) return [];
  if (v instanceof FP_Time) return [];
  // FP_Date is already a date-only value — return as-is
  if (v instanceof FP_Date) return [v];
  // FP_DateTime: reconstruct the date-only string from the time parts
  const tp = v._getTimeParts();
  let dateStr = tp[0];
  if (tp.length > 1) dateStr += tp[1];
  if (tp.length > 2) dateStr += tp[2];
  return [new FP_Date(dateStr)];
};

/**
 *  Implements FHIRPath timeOf().
 *  Returns the time component of a DateTime value as an FP_Time.
 *  Returns empty if there is no time component, or for Date or Time inputs.
 */
engine.timeOf = function(coll) {
  const v = getSingletonDateTimeValue(coll, 'timeOf');
  if (!v) return [];
  // Only valid for DateTime — not Date-only (FP_Date) or Time (FP_Time)
  if (v instanceof FP_Time || v instanceof FP_Date) return [];
  const tp = v._getTimeParts();
  // Return empty if no time component is present
  if (tp.length < 4) return [];
  let timeStr = tp[3];
  if (tp.length > 4) timeStr += tp[4];
  if (tp.length > 5) timeStr += tp[5];
  if (tp.length > 6) timeStr += tp[6];
  return [new FP_Time(timeStr)];
};

module.exports = engine;
