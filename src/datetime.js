const engine = {};
const types = require('./types');
const constants = require('./constants');
const FP_Date = types.FP_Date;
const FP_DateTime = types.FP_DateTime;
const FP_Time = types.FP_Time;

/**
 * Implements the FHIRPath `now()` function.
 * Returns the current date and time, including the timezone offset.
 * The value is cached for the duration of the evaluation so that multiple
 * calls to `now()` within the same expression return the same value.
 * See https://hl7.org/fhirpath/#now-datetime
 * @returns {FP_DateTime} the current date and time.
 */
engine.now = function(){
  if (!constants.now) {
    // return new FP_DateTime((new Date()).toISOString());
    // The above would construct an FP_DateTime with a timezone of "Z", which
    // would not make a difference for computation, but if the end result of an
    // expression is "now()", then it would look different when output to a user.
    // Construct it ourselves to preserve timezone
    const ctx = this;
    const now = constants.nowDate; // a JS Date
    const isoStr = FP_DateTime.isoDateTime(now);
    constants.now = new FP_DateTime(ctx, isoStr);
  }
  return constants.now;
};


/**
 * Implements the FHIRPath `today()` function.
 * Returns the current date without a timezone offset.
 * The value is cached for the duration of the evaluation so that multiple
 * calls to `today()` within the same expression return the same value.
 * See https://hl7.org/fhirpath/#today-date
 * @returns {FP_Date} the current date.
 */
engine.today = function(){
  if (!constants.today) {
    const ctx = this;
    // Construct the string ourselves to preserve timezone
    var now = constants.nowDate; // a JS Date
    var isoStr = FP_Date.isoDate(now);
    constants.today = new FP_Date(ctx, isoStr);
  }
  return constants.today;
};

/**
 * Implements the FHIRPath `timeOfDay()` function.
 * Returns the current time of day without a timezone offset.
 * The value is cached for the duration of the evaluation so that multiple
 * calls to `timeOfDay()` within the same expression return the same value.
 * See https://hl7.org/fhirpath/#timeofday-time
 * @returns {FP_Time} the current time of day.
 */
engine.timeOfDay = function() {
  if (!constants.timeOfDay) {
    const ctx = this;
    // Construct the string ourselves to preserve timezone
    const now = constants.nowDate; // a JS Date
    const isoStr = FP_DateTime.isoTime(now);
    constants.timeOfDay = new FP_Time(ctx, isoStr);
  }
  return constants.timeOfDay;
};

module.exports = engine;
