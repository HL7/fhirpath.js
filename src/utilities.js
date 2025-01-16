// This file holds utility functions used in implementing the public functions.

const util =  {};
const types = require('./types');
const {ResourceNode} = types;

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
 *  Throws an exception if the collection contains not one value.
 * @param collection the collection to be checked.
 * @param errorMsgPrefix An optional prefix for the error message to assist in
 *  debugging.
 */
util.assertOnlyOne = function (collection, errorMsgPrefix) {
  if (collection.length !== 1) {
    util.raiseError("Was expecting only one element but got " +
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
  return Array.isArray(x) && x.length === 0;
};

util.isSome = function(x){
  return x !== null && x !== undefined && !util.isEmpty(x);
};

util.isTrue = function(x){
  // We use util.valData because we can use a boolean node as a criterion
  return x !== null && x !== undefined && (x === true || (x.length === 1 && util.valData(x[0]) === true));
};

util.isCapitalized = function(x){
  return x && (x[0] === x[0].toUpperCase());
};

util.flatten = function(x){
  if (x.some(i => i instanceof Promise)) {
    return Promise.all(x).then(arr => flattenSync(arr));
  }
  return flattenSync(x);
};

/**
 * Creates a shallow copy of the source array and replaces those elements of the
 * source array that are arrays with their contents.
 * For example:
 * [1, [2, 3]] -> [1, 2, 3]
 * @param {Array} x - source array
 * @return {Array}
 */
function flattenSync(x) {
  return [].concat(...x);
}

util.arraify = function(x){
  if(Array.isArray(x)){ return x; }
  if(util.isSome(x)){ return [x]; }
  return [];
};

/**
 * If the input parameter is a promise, arraify the result of that promise,
 * otherwise arraify the input parameter.
 * @param {*|Promise<*>} x - input parameter
 * @return {*[]|Promise<*[]>}
 */
util.resolveAndArraify = function(x){
  return x instanceof Promise
    ? x.then(r => util.arraify(r))
    : util.arraify(x);
};

/**
 *  Returns the data value of the given parameter, which might be a ResourceNode.
 *  Otherwise, it returns the value that was passed in.
 */
util.valData = function(val) {
  return (val instanceof ResourceNode) ? val.data : val;
};

/**
 *  Returns the data value of the given parameter, which might be a ResourceNode.
 *  Otherwise, it returns the value that was passed in.  In the case of a
 *  ResourceNode that is a Quantity, the returned value will have been converted
 *  to an FP_Quantity.
 */
util.valDataConverted = function(val) {
  if (val instanceof ResourceNode) {
    val = val.convertData();
  }
  return val;
};

/**
 * Prepares a string for insertion into a regular expression
 * @param {string} str
 * @return {string}
 */
util.escapeStringForRegExp = function (str) {
  return str.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&');
};

/**
 * Binding to the Array.prototype.push.apply function to define a function to
 * push the contents of the source array to the destination array.
 * @name pushFn
 * @function
 * @param {Array} destArray - destination array
 * @param {Array} sourceArray - source array
 * @returns the new length property of destArray
 */
util.pushFn = Function.prototype.apply.bind(Array.prototype.push);

/**
 * Creates child resource nodes for the specified resource node property.
 * @param {ResourceNode} parentResNode - resource node
 * @param {string} childProperty - name of property
 * @param {object} [model] - "model" data object
 * @return {ResourceNode[]}
 */
util.makeChildResNodes = function(parentResNode, childProperty, model) {
  let childPath = parentResNode.path + '.' + childProperty;

  if (model) {
    let defPath = model.pathsDefinedElsewhere[childPath];
    if (defPath)
      childPath = defPath;
  }
  let toAdd, _toAdd;
  let actualTypes = model && model.choiceTypePaths[childPath];
  if (actualTypes) {
    // Use actualTypes to find the field's value
    for (let t of actualTypes) {
      let field = childProperty + t;
      toAdd = parentResNode.data?.[field];
      _toAdd = parentResNode.data?.['_' + field];
      if (toAdd !== undefined || _toAdd !== undefined) {
        childPath += t;
        break;
      }
    }
  }
  else {
    toAdd = parentResNode.data?.[childProperty];
    _toAdd = parentResNode.data?.['_' + childProperty];
    if (toAdd === undefined && _toAdd === undefined) {
      toAdd = parentResNode._data[childProperty];
    }
    if (childProperty === 'extension') {
      childPath = 'Extension';
    }
  }

  let fhirNodeDataType = null;
  if (model) {
    fhirNodeDataType = model.path2Type[childPath];
    childPath = model.path2TypeWithoutElements[childPath] || childPath;
  }

  let result;
  if (util.isSome(toAdd) || util.isSome(_toAdd)) {
    if(Array.isArray(toAdd)) {
      result = toAdd.map((x, i)=>
        ResourceNode.makeResNode(x, parentResNode, childPath, _toAdd && _toAdd[i], fhirNodeDataType));
      // Add items to the end of the ResourceNode list that have no value
      // but have associated data, such as extensions or ids.
      const _toAddLength = _toAdd?.length || 0;
      for (let i = toAdd.length; i < _toAddLength; ++i) {
        result.push(ResourceNode.makeResNode(null, parentResNode, childPath, _toAdd[i], fhirNodeDataType));
      }
    } else if (toAdd == null && Array.isArray(_toAdd)) {
      // Add items to the end of the ResourceNode list when there are no
      // values at all, but there is a list of associated data, such as
      // extensions or ids.
      result = _toAdd.map((x) => ResourceNode.makeResNode(null, parentResNode, childPath, x, fhirNodeDataType));
    } else {
      result = [ResourceNode.makeResNode(toAdd, parentResNode, childPath, _toAdd, fhirNodeDataType)];
    }
  } else {
    result = [];
  }
  return result;
};

module.exports = util;
