const util = require("./utilities");
const { ResourceNode } = require('./types');

var engine = {};

engine.children = function(coll){
  let model = this.model; // "this" is the context object
  return coll.reduce(function(acc, x){
    if (!(x instanceof ResourceNode)) {
      return acc;
    }
    if (typeof x.data === 'object' && x.data != null) {
      let keys = Object.keys(x.data).filter( k => k !== 'resourceType');
      for (let prop of keys) {
        if (!prop.startsWith('_') || !keys.includes(prop.slice(1))) {
          util.pushFn(acc, util.makeChildResNodes(x, prop, model));
        }
      }
    }
    else if (typeof x._data === 'object' && x._data != null) {
      // remove any resourceType keys
      let keys = Object.keys(x._data).filter( k => k !== 'resourceType');
      for (let prop of keys) {
        util.pushFn(acc, util.makeChildResNodes(x, prop, model));
      }
    }
    return acc;
  }, []);
};

engine.descendants = function(coll){
  let ch = engine.children.call(this, coll); // "this" is the context object
  let res = [];
  while(ch.length > 0){
    util.pushFn(res, ch);
    ch = engine.children.call(this, ch);
  }
  return res;
};

module.exports = engine;
