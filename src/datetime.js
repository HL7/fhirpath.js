var engine = {};
const types = require('./types');
const constants = require('./constants');
const FP_Date = types.FP_Date;
const FP_DateTime = types.FP_DateTime;
const FP_Time = types.FP_Time;

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

module.exports = engine;
