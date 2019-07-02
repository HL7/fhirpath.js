var engine = {};
const types = require('./types');
const FP_DateTime = types.FP_DateTime;

/**
 *  Implements FHIRPath now().
 */
engine.now = function(){
  // return new FP_DateTime((new Date()).toISOString());
  // The above would construct an FP_DateTime with a timezone of "Z", which
  // would not make a difference for computation, but if the end result of an
  // expression is "now()", then it would look different when output to a user.
  // Construct it ourselves to preserve timezone
  var now = new Date();
  var isoStr = FP_DateTime.isoDateTime(now);
  return new FP_DateTime(isoStr);
};


/**
 *  Implements FHIRPath today().  See comments in now().
 */
engine.today = function(){
  // Construct the string ourselves to preserve timezone
  var now = new Date();
  var isoStr = FP_DateTime.isoDate(now); // TBD
  var year = now.getFullYear();
  var month = formatNum(now.getMonth() + 1);
  var day = formatNum(now.getDate());
  return new FP_DateTime(''+year+'-'+month+'-'+day);
};

module.exports = engine;
