const util = require("./utilities");
// Cannot use util.hasOwnProperty directly because it triggers the error:
// "Do not access Object.prototype method 'hasOwnProperty' from target object"
const { hasOwnProperty } = util;
const { ResourceNode } = require('./types');

var engine = {};

engine.children = function(coll){
  let model = this.model; // "this" is the context object
  return coll.reduce(function(acc, x){
    if (!(x instanceof ResourceNode)) {
      return acc;
    }
    if (typeof x.data === 'object' && x.data != null) {
      for (let prop in x.data) {
        if (prop.startsWith('_')) {
          const propWithoutUnderscore = prop.slice(1);
          if (!hasOwnProperty(x.data, propWithoutUnderscore)) {
            // If there is only a property that starts with an underscore
            // (e.g. _name = {id: 'someId'} is present but "name" is missing).
            // We have to create a node using the property name without
            // the underscore (e.g. "name") because accessing values doesn't use
            // the underscore anyway (e.g. name.id = 'someId').
            // ResourceNode has properties "data" and "_data" to store
            // un-underscored and underscored values.
            util.pushFn(acc, util.makeChildResNodes(x,
              propWithoutUnderscore, model));
          }
        } else if (prop !== 'resourceType') {
          util.pushFn(acc, util.makeChildResNodes(x, prop, model));
        }
      }
    }
    else if (typeof x._data === 'object' && x._data != null) {
      for (let prop in x._data) {
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
