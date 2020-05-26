// Contains the FHIRPath Aggregate functions.
// (Section 7 of the FHIRPath 2.0.0 (N1) specification).

const util = require('./utilities');

let engine = {};

engine.aggregateMacro = function(data, expr, initialValue) {
  if (data !== false && !data) { return initialValue; }
  return util.flatten(util.arraify(data.reduce((total, x) => this.$total = expr(x), this.$total = initialValue)));
};

module.exports = engine;