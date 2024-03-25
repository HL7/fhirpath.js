const util = require("./utilities");

var engine = {};

engine.children = function(coll){
  let model = this.model; // "this" is the context object
  return coll.reduce(function(acc, x){
    let d = util.valData(x);
    if (d == null) {
      return acc;
    } else if (typeof d === 'object') {
      for (var prop of Object.keys(d)) {
        util.pushFn(acc, util.makeChildResNodes(x, prop, model));
      }
      return acc;
    } else {
      return acc;
    }
  }, []);
};

engine.descendants = function(coll){
  var ch = engine.children.call(this, coll); // "this" is the context object
  var res = [];
  while(ch.length > 0){
    util.pushFn(res, ch);
    ch = engine.children.call(this, ch);
  }
  return res;
};

module.exports = engine;
