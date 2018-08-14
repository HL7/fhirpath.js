// This file holds utility functions used in implementing the public functions.

var util =  {};

/**
 *  Throws an exception if the collection contains more than one value.
 * @param collection the collection to be checked.
 * @param errorMsgPrefix An optional prefix for the error message to assist in
 *  debugging.
 */
util.assertAtMostOne = function (collection, errorMsgPrefix) {
  errorMsgPrefix = errorMsgPrefix ? errorMsgPrefix + ": " : "";
  if (collection.length > 1) {
    throw errorMsgPrefix + "Was expecting no more than one element but got " +
      JSON.stringify(collection);
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
  errorMsgPrefix = errorMsgPrefix ? errorMsgPrefix + ": " : "";
  if (types.indexOf(typeof data) < 0) {
    let typeList = types.length > 1 ? "one of "+types.join(", ") : types[0];
    throw errorMsgPrefix + "Found type '"+(typeof data)+"' but was expecting " +
      typeList;
  }
}

module.exports = util;
