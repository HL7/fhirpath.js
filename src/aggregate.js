// Contains the FHIRPath Aggregate functions.
// (Section 7 of the FHIRPath 2.0.0 (N1) specification).

let engine = {};
const math = require("./math");
const equality  = require("./equality");
const util = require('./utilities');

engine.aggregateMacro = function(data, expr, initialValue) {
  return data.reduce((total, x, i) => {
    this.$index = i;
    return this.$total = expr(x);
  }, this.$total = initialValue);
};

engine.countFn = function(x) {
  if (x && x.length) {
    return x.length;
  } else {
    return 0;
  }
};

// Shortcut for "value.tail().aggregate($this+$total, value.first())" `
engine.sumFn = function(data) {
  return engine.aggregateMacro.apply(this, [data.slice(1), ($this) => {
    return math.plus(util.arraify($this), util.arraify(this.$total));
  }, data[0]]);
};

// Shortcut for "value.aggregate(iif($total.empty(), $this, iif($this < $total, $this, $total)))"
engine.minFn = function (data) {
  return engine.aggregateMacro.apply(this, [data, (curr) => {
    const $this = util.arraify(curr);
    const $total = util.arraify(this.$total);
    return util.isEmpty($total)
      ? $this
      : equality.lt($this, $total) ? $this : $total;
  }]);
};

// Shortcut for "value.aggregate(iif($total.empty(), $this, iif($this > $total, $this, $total)))"
engine.maxFn = function (data) {
  return engine.aggregateMacro.apply(this, [data, (curr) => {
    const $this = util.arraify(curr);
    const $total = util.arraify(this.$total);
    return util.isEmpty($total)
      ? $this
      : equality.gt($this, $total) ? $this : $total;
  }]);
};

// Shortcut for "value.sum()/value.count()"
engine.avgFn = function (data) {
  return math.div(
    util.arraify(engine.sumFn(data)),
    util.arraify(engine.countFn(data))
  );
};

module.exports = engine;
