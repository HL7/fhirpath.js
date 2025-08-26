// This file holds utility functions used in implementing the public functions.

const util =  {};
const { ResourceNode, toJSON } = require('./types');


/**
 * Converts a value to a JSON string, handling BigInt values.
 * This function is useful for serializing objects that may contain BigInt values,
 * which are not natively supported by JSON.stringify.
 *
 * @param {*} obj - The object to be converted to a JSON string.
 * @returns {string} - The JSON string representation of the object.
 */
util.toJSON = toJSON;


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
      util.toJSON(collection), errorMsgPrefix);
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

util.capitalize = function(x){
  return x[0].toUpperCase() + x.substring(1);
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
        ResourceNode.makeResNode(x, parentResNode, childPath,
          _toAdd && _toAdd[i], fhirNodeDataType, model, childProperty, i));
      // Add items to the end of the ResourceNode list that have no value
      // but have associated data, such as extensions or ids.
      const _toAddLength = _toAdd?.length || 0;
      for (let i = toAdd.length; i < _toAddLength; ++i) {
        result.push(ResourceNode.makeResNode(null, parentResNode, childPath,
          _toAdd[i], fhirNodeDataType, model, childProperty, i));
      }
    } else if (toAdd == null && Array.isArray(_toAdd)) {
      // Add items to the end of the ResourceNode list when there are no
      // values at all, but there is a list of associated data, such as
      // extensions or ids.
      result = _toAdd.map((x) => ResourceNode.makeResNode(null, parentResNode,
        childPath, x, fhirNodeDataType, model, childProperty));
    } else {
      result = [ResourceNode.makeResNode(toAdd, parentResNode, childPath,
        _toAdd, fhirNodeDataType, model, childProperty)];
    }
  } else {
    result = [];
  }
  return result;
};


// Object for storing fetch promises.
const requestCache = {};
// Duration of data storage in cache.
const requestCacheStorageTime = 3600000; // 1 hour = 60 * 60 * 1000

const defaultPostHeaders = {
  'Accept': 'application/fhir+json; charset=utf-8',
  'Content-Type': 'application/fhir+json; charset=utf-8'
};
const defaultGetHeaders = {
  'Accept': 'application/fhir+json; charset=utf-8'
};

/**
 * Fetches a resource from the given URL with caching and context-based options.
 * Applies context-specific HTTP headers and signal passed to evaluation
 * function (e.g., fhirpath.evaluate() or function that is the result of
 * fhirpath.compile()), merged with the parameters provided in a particular
 * call of the fetchWithCache() function, performs the fetch request, and caches
 * the response for a set duration to avoid redundant network requests.
 * Automatically applies default FHIR headers based on the request method.
 * Cleans up expired cache entries before making a new request.
 * Handles JSON and text responses, rejecting on error or non-OK status.
 *
 * @param {string} url - The URL of the resource to fetch.
 * @param {Object} ctx - Context object, may contain httpHeaders and signal.
 * @param {Object} [options] - Optional fetch options (method, headers, etc.).
 * @returns {Promise<Object|string>} - A promise resolving to the fetched
 *  resource or rejecting with error/text.
 */
util.fetchWithCache = function(url, ctx, options) {
  // Apply the context's HTTP headers if they are provided.
  // The context may have a property "httpHeaders" that is an object
  // with keys as FHIR server URLs and values as objects with HTTP headers.
  // If the URL starts with one of the keys, the corresponding headers will be
  // applied to the request.
  if (ctx.httpHeaders) {
    const urlWithHeaders = Object.keys(ctx.httpHeaders)
      .find(i => url.startsWith(i));

    if (urlWithHeaders) {
      const commonHeaders = ctx.httpHeaders[urlWithHeaders];
      if (commonHeaders) {
        if (options) {
          // If options already has headers, merge them with the common headers.
          options.headers = {
            ...commonHeaders,
            ...options.headers,
          };
        } else {
          // If options is not provided, create a new object with common headers.
          options = {
            headers: commonHeaders
          };
        }
      }
    }
  }

  if (ctx.signal) {
    if (options) {
      options.signal = ctx.signal;
    } else {
      options = { signal: ctx.signal };
    }
  }

  const requestKey = [
    url, options ? util.toJSON(options) : ''
  ].join('|');

  // Apply default headers based on the request method.
  const defaultHeaders = options?.method === 'POST' ?
    defaultPostHeaders : defaultGetHeaders;
  options = {
    ...options,
    headers: new Headers({
      ...defaultHeaders,
      ...(options?.headers || {})
    })
  };

  const timestamp = Date.now();
  for (const key in requestCache) {
    if (timestamp - requestCache[key].timestamp > requestCacheStorageTime) {
      // Remove responses older than an hour
      delete requestCache[key];
    }
  }

  if (!requestCache[requestKey]) {
    requestCache[requestKey] = {
      timestamp,
      // In Jest unit tests, a promise returned by 'fetch' is not an instance of
      // Promise that we have in our application context, so we use Promise.resolve
      // to do the conversion.
      promise: Promise.resolve(fetch(url, options))
        .then(r => {
          const contentType = r.headers.get('Content-Type');
          const isJson = contentType.includes('application/json') ||
            contentType.includes('application/fhir+json');
          try {
            if (isJson) {
              return r.json().then((json) => r.ok ? json : Promise.reject(json));
            } else {
              return r.text().then((text) => Promise.reject(text));
            }
          } catch (e) {
            return Promise.reject(new Error(e));
          }
        })
    };
  }

  return requestCache[requestKey].promise;
};


/**
 * Checks if the given context allows asynchronous functions.
 * Throws an error if asynchronous functions are not allowed.
 *
 * @param {Object} ctx - An object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {string} fnName - The name of the function being checked, used in
 *  the error message.
 * @throws {Error} - Throws an error if the context does not allow asynchronous
 *  functions.
 */
util.checkAllowAsync = function(ctx, fnName) {
  if(!ctx.async) {
    throw new Error(`The asynchronous function "${fnName}" is not allowed. ` +
      'To enable asynchronous functions, use the async=true or async="always"' +
      ' option.');
  }
};


/**
 * Reference to the native Object.prototype.hasOwnProperty method, bound to
 * Function.prototype.call. This can be used to safely check if an object has
 * a property as its own (not inherited), avoiding issues if the object has
 * a custom hasOwnProperty property.
 *
 * Example usage:
 * // Cannot use util.hasOwnProperty directly because it triggers the error:
 * // "Do not access Object.prototype method 'hasOwnProperty' from target object"
 * const { hasOwnProperty } = require("./utilities");
 * ...
 * hasOwnProperty(obj, 'propertyName')
 *
 * @type {Function}
 */
util.hasOwnProperty = Function.prototype.call.bind(Object.prototype.hasOwnProperty);


module.exports = util;
