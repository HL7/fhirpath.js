// This file holds utility functions used in implementing the public functions.

var util =  {};

/**
 *  Reports and error to the calling environment and stops processing.
 * @param message the error message
 * @param fnName the name of the function raising the error (optional)
 */
util.raiseError = function(message, fnName) {
  fnName = fnName ? fnName + ": " : "";
  throw fnName + message;
}

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
}

/**
 *  Throws an exception if the data is not one of the expected types.
 * @param data the value to be checked
 * @param types an array of the permitted types
 * @param errorMsgPrefix An optional prefix for the error message to assist in
 *  debugging.
 */
util.assertType = function(data, types, errorMsgPrefix) {
  if (types.indexOf(typeof data) < 0) {
    let typeList = types.length > 1 ? "one of "+types.join(", ") : types[0];
    util.raiseError("Found type '"+(typeof data)+"' but was expecting " +
      typeList, errorMsgPrefix);
  }
}

module.exports = util;
