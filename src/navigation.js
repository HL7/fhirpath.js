// This file holds code for the FHIRPath Navigation functions.

const util = require("./utilities");
// Cannot use util.hasOwnProperty directly because it triggers the error:
// "Do not access Object.prototype method 'hasOwnProperty' from target object"
const { hasOwnProperty } = util;
const { ResourceNode, FP_Type } = require('./types');

const engine = {};


/**
 * Implements the FHIRPath `children()` function.
 * Returns a collection containing all child nodes of each element in the input
 * collection. For object nodes, iterates over all properties (excluding
 * `resourceType`) and creates child ResourceNodes. Handles underscore-prefixed
 * FHIR JSON properties (e.g. `_name`) by mapping them to the corresponding
 * un-prefixed property name when the un-prefixed property is absent.
 * See https://hl7.org/fhirpath/#children-collection
 * @param {Array} coll - the input collection.
 * @returns {Array} a flat collection of all child ResourceNodes.
 */
engine.children = function(coll){
  let model = this.model; // "this" is the context object
  const ctx = this;
  return coll.reduce(function(acc, x){
    if (!(x instanceof ResourceNode)) {
      return acc;
    }
    if (typeof x.data === 'object' && x.data != null && !(x.data instanceof FP_Type)) {
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
            util.pushFn(acc, util.makeChildResNodes(ctx, x,
              propWithoutUnderscore, model));
          }
        } else if (prop !== 'resourceType') {
          util.pushFn(acc, util.makeChildResNodes(ctx, x, prop, model));
        }
      }
    }
    else if (typeof x._data === 'object' && x._data != null && !(x.data instanceof FP_Type)) {
      for (let prop in x._data) {
        util.pushFn(acc, util.makeChildResNodes(ctx, x, prop, model));
      }
    }
    return acc;
  }, []);
};


/**
 * Implements the FHIRPath `descendants()` function.
 * Returns a collection containing all descendant nodes of each element in the
 * input collection by recursively calling `children()` until no further child
 * nodes are found.
 * See https://hl7.org/fhirpath/#descendants-collection
 * @param {Array} coll - the input collection.
 * @returns {Array} a flat collection of all descendant ResourceNodes.
 */
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
