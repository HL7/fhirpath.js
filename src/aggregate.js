// Contains the FHIRPath Aggregate functions.
// (Section 7 of the FHIRPath 2.0.0 (N1) specification).

let engine = {};
const math = require("./math");
const equality  = require("./equality");
const util = require('./utilities');

engine.aggregateMacro = function(data, expr, initialValue) {
  return data.reduce((total, x, i) => {
    if (total instanceof Promise) {
      return total.then((t) => {
        this.$index = i;
        this.$total = t;
        return this.$total = expr(x);
      });
    } else {
      this.$index = i;
      return this.$total = expr(x);
    }
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

/**
 * Shortcut for "[source collection].aggregate(iif($total.empty(), $this, iif($this [operator] $total, $this, $total)))"
 * Used for functions min() and max().
 * @param {Array} data - source collection
 * @param {Function} fn - operator function
 * @return {Array}
 */
function minMaxShortcutTemplate(data, fn) {
  let $total;
  if (data.length === 0 || util.valData(data[0]) == null) {
    $total = [];
  } else {
    $total = [data[0]];
    for (let i = 1; i < data.length; i++) {
      if (util.valData(data[i]) == null) {
        $total = [];
        break;
      }
      const $this = [data[i]];
      $total = util.isTrue(fn($this, $total)) ? $this : $total;
    }
  }
  return $total;
}

// Shortcut for "value.aggregate(iif($total.empty(), $this, iif($this < $total, $this, $total)))"
engine.minFn = function (data) {
  return minMaxShortcutTemplate(data, equality.lt);
};

// Shortcut for "value.aggregate(iif($total.empty(), $this, iif($this > $total, $this, $total)))"
engine.maxFn = function (data) {
  return minMaxShortcutTemplate(data, equality.gt);
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
