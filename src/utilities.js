// This file holds utility functions used in implementing the public functions.

var util =  {};
var types = require('./types');
let {ResourceNode} = types;

/**
 *  Reports and error to the calling environment and stops processing.
 * @param message the error message
 * @param fnName the name of the function raising the error (optional)
 */
util.raiseError = function(message, fnName) {
  fnName = fnName ? fnName + ": " : "";
  throw fnName + message;
};

/**
 *  Throws an exception if the collection contains more than one value.
 * @param collection the collection to be checked.
 * @param errorMsgPrefix An optional prefix for the error message to assist in
 *  debugging.
 */
util.assertAtMostOne = function (collection, errorMsgPrefix) {
  if (collection.length > 1) {
    util.raiseError("Was expecting no more than one element but got " +
      JSON.stringify(collection), errorMsgPrefix);
  }
};

/**
 *  Throws an exception if the data is not one of the expected types.
 * @param data the value to be checked.  This may be a ResourceNode.
 * @param types an array of the permitted types
 * @param errorMsgPrefix An optional prefix for the error message to assist in
 *  debugging.
 * @return the value that was checked.  If "data" was a ResourceNode, this will
 *  be the ReourceNode's data.
 */
util.assertType = function(data, types, errorMsgPrefix) {
  let val = this.valData(data);
  if (types.indexOf(typeof val) < 0) {
    let typeList = types.length > 1 ? "one of "+types.join(", ") : types[0];
    util.raiseError("Found type '"+(typeof data)+"' but was expecting " +
      typeList, errorMsgPrefix);
  }
  return val;
};

util.isEmpty = function(x){
  return Array.isArray(x) && x.length == 0;
};

util.isSome = function(x){
  return x !== null && x !== undefined && !util.isEmpty(x);
};

util.isTrue = function(x){
  return x !== null && x !== undefined && (x === true || (x.length == 1 && x[0] === true));
};

util.isFalse = function(x){
  return x !== null && x !== undefined && (x === false || (x.length == 1 && x[0] === false));
};

util.isCapitalized = function(x){
  return x && (x[0] === x[0].toUpperCase());
};

util.flatten = function(x){
  return x.reduce(function(acc, x) {
    if(Array.isArray(x)){
      // todo replace with array modification
      acc = acc.concat(x);
    } else {
      acc.push(x);
    }
    return acc;
  }, []);
};

util.arraify = function(x){
  if(Array.isArray(x)){ return x; }
  if(util.isSome(x)){ return [x]; }
  return [];
};

/**
 *  Returns the data value of the given parameter, which might be a ResourceNode.
 *  Otherwise, it returns the value that was passed in.
 */
util.valData = function(val) {
  return (val instanceof ResourceNode) ? val.data : val;
};

module.exports = util;
