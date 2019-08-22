// These are values that should not change during an evaluation of a FHIRPath
// expression (e.g. the return value of today(), per the spec.)  They are
// constant during at least one evaluation.

module.exports = {
  /**
   *  Resets the constants.  Should be called when before the engine starts its
   *  processing.
   */
  reset: function() {
    this.nowDate = new Date(); // a Date object representint "now"
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
  now: null
};
