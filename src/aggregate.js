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
    let x = util.arraify($this).filter(i => util.valData(i) != null);
    let y = util.arraify(this.$total).filter(i => util.valData(i) != null);
    if (x.length === 0 || y.length === 0) {
      return [];
    }
    return math.plus(x, y);
  }, data[0]]);
};

// Shortcut for "value.aggregate(iif($total.empty(), $this, iif($this < $total, $this, $total)))"
engine.minFn = function (data) {
  return engine.aggregateMacro.apply(this, [data, (curr) => {
    const $this = util.arraify(curr);
    const $total = util.arraify(this.$total);
    return util.isEmpty($total)
      ? $this
      : equality.lt($this.filter(i => util.valData(i) != null), $total.filter(i => util.valData(i) != null))
        ? $this : $total;
  }]);
};

// Shortcut for "value.aggregate(iif($total.empty(), $this, iif($this > $total, $this, $total)))"
engine.maxFn = function (data) {
  return engine.aggregateMacro.apply(this, [data, (curr) => {
    const $this = util.arraify(curr);
    const $total = util.arraify(this.$total);
    return util.isEmpty($total)
      ? $this
      : equality.gt($this.filter(i => util.valData(i) != null), $total.filter(i => util.valData(i) != null))
        ? $this : $total;
  }]);
};

// Shortcut for "value.sum()/value.count()"
engine.avgFn = function (data) {
  const x = util.arraify(engine.sumFn(data));
  const y = util.arraify(engine.countFn(data));
  if (x.length === 0 || y.length === 0) {
    return [];
  }
  return math.div(x, y);
};

module.exports = engine;
