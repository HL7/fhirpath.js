// These are values that should not change during an evaluation of a FHIRPath
// expression (e.g. the return value of today(), per the spec.)  They are
// constant during at least one evaluation.

var today, now, localTimezoneOffset;

module.exports = {
  /**
   *  Resets the constants.  Should be called when before the engine starts its
   *  processing.
   */
  reset: function() {
    this.today = null;
    this.now = null;
    this.localTimezoneOffset = null;
  },

  /**
   *  The cached value of today().
   */
  today: null,

  /**
   *  The cached value of now().
   */
  now: null,

  /**
   *  Returns the value of the local timezone offset in minutes.
   */
  getLocalTimezoneOffset: function () {
    if (!this.localTimezoneOffset)
      this.localTimezoneOffset = (new Date()).getTimezoneOffset();
    return  this.localTimezoneOffset;
  }
}
