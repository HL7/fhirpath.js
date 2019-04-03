var engine = {};
const FP_DateTime = require('./types').FP_DateTime;

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
  // else assume len === 2
  if (num < 10)
    rtn = '0' + rtn;
  return rtn;
}


/**
 *  Implements FHIRPath now().
 */
engine.now = function(){
  // return new FP_DateTime((new Date()).toISOString());
  // The above would construct an FP_DateTime with a timezone of "Z", which
  // would not make a difference for computation, but if the end result of an
  // expression is "now()", then it would look different when output to a user.
  // YYYY-MM-DDTHH:mm:ss.sss[+-]HH:mm
  // Construct it ourselves to preserve timezone
  var now = new Date();
  var year = now.getFullYear();
  var month = formatNum(now.getMonth() + 1);
  var day = formatNum(now.getDate());
  var hour = formatNum(now.getHours());
  var min = formatNum(now.getMinutes());
  var sec = formatNum(now.getSeconds());
  var mil = formatNum(now.getMilliseconds(), 3);
  var tzOffset = now.getTimezoneOffset();
  // tzOffset is a number of minutes, and is positive for negative timezones,
  // and negative for positive timezones.
  var tzSign = tzOffset < 0 ? '+' : '-';
  tzOffset = Math.abs(tzOffset);
  var tzMin = tzOffset % 60;
  var tzHour = formatNum((tzOffset - tzMin) / 60);
  return new FP_DateTime(''+year+'-'+month+'-'+day+'T'+hour+':'+min+':'+sec+'.'+
    mil + tzSign + tzHour + ':' + formatNum(tzMin));
};


/**
 *  Implements FHIRPath today().  See comments in now().
 */
engine.today = function(){
  // Construct the string ourselves to preserve timezone
  var now = new Date();
  var year = now.getFullYear();
  var month = formatNum(now.getMonth() + 1);
  var day = formatNum(now.getDate());
  return new FP_DateTime(''+year+'-'+month+'-'+day);
};

module.exports = engine;
