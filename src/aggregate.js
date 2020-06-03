// Contains the FHIRPath Aggregate functions.
// (Section 7 of the FHIRPath 2.0.0 (N1) specification).

let engine = {};

engine.aggregateMacro = function(data, expr, initialValue) {
  return data.reduce((total, x, i) => {
    this.$index = i;
    return this.$total = expr(x);
  }, this.$total = initialValue);
};

module.exports = engine;