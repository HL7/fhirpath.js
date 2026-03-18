// Contains the FHIRPath Filtering and Projection functions.  (Section 5.2 of
// the FHIRPath 1.0.0 specification).

const util = require('./utilities');
const {TypeInfo, ResourceNode} = require('./types');
const hashObject = require('./hash-object');
const { deepEqual, maxCollSizeForDeepEqual } = require('./deep-equal');

const engine = {};


/**
 * Implements the FHIRPath `where(criteria)` function.
 * Filters the input collection to only those elements that satisfy the given
 * criteria expression.
 * See https://hl7.org/fhirpath/#wherecriteria-expression-collection
 * @param {Array} parentData - the input collection.
 * @param {Function} expr - the criteria expression to evaluate for each element.
 * @returns {Array|Promise<Array>} the filtered collection. Returns a Promise
 *   if any expression evaluation is asynchronous.
 */
engine.whereMacro = function(parentData, expr) {
  if(parentData !== false && ! parentData) { return []; }

  return util.flatten(parentData.map((x, i) => {
    this.$index = i;
    const condition = expr(x);
    if (condition instanceof Promise) {
      return condition.then(c => c[0] ? x : []);
    }
    return condition[0] ? x : [];
  }));
};


/**
 * Implements the FHIR `extension(url)` function.
 * Returns all extensions on each element in the input collection that match
 * the given URL.
 * See https://hl7.org/fhir/fhirpath.html#functions
 * @param {Array} parentData - the input collection.
 * @param {string} url - the extension URL to filter by.
 * @returns {Array} a flat collection of matching Extension ResourceNodes.
 */
engine.extension = function(parentData, url) {
  const ctx = this;
  if(parentData !== false && ! parentData || !url) { return []; }

  return util.flatten(parentData.map((x, i) => {
    this.$index = i;
    const extensions = (x && (x.data && x.data.extension || x._data && x._data.extension));
    if (extensions) {
      return extensions.reduce((list, extension, index) => {
        if(extension.url === url) {
          list.push(ResourceNode.makeResNode(ctx, extension, x, 'Extension', null,
            'Extension', 'extension', index));
        }
        return list;
      }, []);
    }
    return [];
  }));
};


/**
 * Implements the FHIRPath `select(projection)` function.
 * Evaluates the projection expression for each element in the input collection
 * and returns a flattened collection of the results.
 * See https://hl7.org/fhirpath/#selectprojection-expression-collection
 * @param {Array} data - the input collection.
 * @param {Function} expr - the projection expression to evaluate for each
 *   element.
 * @returns {Array} a flattened collection of projected values.
 */
engine.selectMacro = function(data, expr) {
  if(data !== false && ! data) { return []; }
  return util.flatten(data.map((x, i) => {
    this.$index = i;
    return expr(x);
  }));
};


/**
 * Implements the FHIRPath `repeat(expression)` function.
 * Repeatedly evaluates the given expression on each element, collecting unique
 * results until no new items are produced. Duplicates are excluded using deep
 * equality or hash-based comparison depending on collection size.
 * See https://hl7.org/fhirpath/#repeatexpression-expression-collection
 * @param {Array} parentData - the input collection.
 * @param {Function} expr - the expression to evaluate repeatedly.
 * @param {Object} [state] - internal state for tracking results across
 *   recursive calls.
 * @param {Array} [state.res] - accumulated unique results.
 * @param {Object} [state.unique] - hash map of already-seen items.
 * @param {boolean} [state.hasPrimitive] - whether any primitive values have
 *   been encountered.
 * @returns {Array|Promise<Array>} the collection of all unique results.
 *   Returns a Promise if any expression evaluation is asynchronous.
 */
engine.repeatMacro = function(parentData, expr, state = { res: [], unique: {}, hasPrimitive: false }) {
  const ctx = this;
  if(parentData !== false && ! parentData) { return []; }

  let newItems = [].concat(...parentData.map(i => expr(i)));
  if (newItems.some(i => i instanceof Promise)) {
    return Promise.all(newItems).then(items => {
      items = [].concat(...items);
      if (items.length) {
        return engine.repeatMacro.call(ctx, getNewItems(ctx, items, state), expr, state);
      }
      return state.res;
    });
  } else if (newItems.length) {
    return engine.repeatMacro.call(ctx, getNewItems(ctx, newItems, state), expr, state);
  } else {
    return state.res;
  }
};


/**
 * Returns new items from the input array that are not in the hash of existing
 * unique items and adds them to the result array.
 * @param {Object} ctx - current evaluation context.
 * @param {Array<*>} items - input array.
 * @param {Object} state - current state object.
 * @param {{[key: string]: *}} state.unique - hash of existing unique items.
 * @param {Array<*>} state.res - result array.
 * @param {boolean} state.hasPrimitive - flag indicating if the result array has
 *  primitives.
 * @return {Array<*>}
 */
function getNewItems(ctx, items, state) {
  let newItems;
  state.hasPrimitive = state.hasPrimitive || items.some(i => TypeInfo.isPrimitiveValue(i));
  if (!state.hasPrimitive && items.length + state.res.length > maxCollSizeForDeepEqual) {
    newItems = items.filter(item => {
      const key = hashObject(item);
      const isUnique = !state.unique[key];
      if (isUnique) {
        state.unique[key] = true;
      }
      return isUnique;
    });
    state.res.push.apply(state.res, newItems);
  } else {
    newItems = items.filter(item => {
      const isUnique = !state.res.some(i => deepEqual(ctx, i, item));
      if (isUnique) {
        state.res.push(item);
      }
      return isUnique;
    });
  }
  return newItems;
}


/**
 * Implements the FHIRPath `single()` function.
 * Returns the input collection if it contains exactly one element, an empty
 * collection if it is empty, or throws an error if it contains more than one.
 * See https://hl7.org/fhirpath/#single-collection
 * @param {Array} x - the input collection.
 * @returns {Array} the input collection (0 or 1 element).
 * @throws {Error} if the collection contains more than one element.
 */
engine.singleFn = function(x) {
  if(x.length === 1){
    return x;
  } else if (x.length === 0) {
    return [];
  } else {
    throw new Error("Expected single");
  }
};


/**
 * Implements the FHIRPath `first()` function.
 * Returns the first element of the input collection, or an empty collection
 * if the input is empty.
 * See https://hl7.org/fhirpath/#first-collection
 * @param {Array} x - the input collection.
 * @returns {*} the first element, or undefined if empty.
 */
engine.firstFn = function(x) {
  return x[0];
};


/**
 * Implements the FHIRPath `last()` function.
 * Returns the last element of the input collection, or an empty collection
 * if the input is empty.
 * See https://hl7.org/fhirpath/#last-collection
 * @param {Array} x - the input collection.
 * @returns {*} the last element, or undefined if empty.
 */
engine.lastFn = function(x) {
  return x[x.length - 1];
};


/**
 * Implements the FHIRPath `tail()` function.
 * Returns all elements except the first from the input collection.
 * See https://hl7.org/fhirpath/#tail-collection
 * @param {Array} x - the input collection.
 * @returns {Array} the collection without the first element.
 */
engine.tailFn = function(x) {
  return x.slice(1, x.length);
};


/**
 * Implements the FHIRPath `take(num)` function.
 * Returns the first `n` elements from the input collection.
 * See https://hl7.org/fhirpath/#takenum-integer-collection
 * @param {Array} x - the input collection.
 * @param {number} n - the number of elements to take.
 * @returns {Array} the first `n` elements.
 */
engine.takeFn = function(x, n) {
  return x.slice(0, n);
};


/**
 * Implements the FHIRPath `skip(num)` function.
 * Returns all elements after skipping the first `num` elements.
 * See https://hl7.org/fhirpath/#skipnum-integer-collection
 * @param {Array} x - the input collection.
 * @param {number} num - the number of elements to skip.
 * @returns {Array} the remaining elements after skipping.
 */
engine.skipFn = function(x, num) {
  return x.slice(num, x.length);
};


/**
 * Implements the FHIRPath `ofType(type)` function.
 * Filters the input collection to only those elements that are of the
 * specified type (or convertible to it).
 * See https://hl7.org/fhirpath/#oftypetype-type-specifier-collection
 * @param {Array} coll - the input collection.
 * @param {TypeInfo} typeInfo - the type to filter by.
 * @returns {Array} elements whose type matches or is convertible to the
 *   specified type.
 */
engine.ofTypeFn = function(coll, typeInfo) {
  const ctx = this;
  return coll.filter(value => {
    return TypeInfo.fromValue(value).isConvertibleTo(typeInfo, ctx.model);
  });
};


/**
 * Implements the FHIRPath `distinct()` function.
 * Returns a collection containing only the unique elements from the input.
 * For large collections without primitive values, a hash-based approach is
 * used for efficiency; otherwise, deep equality comparison is used.
 * See https://hl7.org/fhirpath/#distinct-collection
 * @param {Array} x - the input collection.
 * @param {boolean} [hasPrimitive] - optional flag indicating whether the
 *   collection contains primitive values. If not provided, it is determined
 *   automatically.
 * @returns {Array} a collection of distinct elements.
 */
engine.distinctFn = function(x, hasPrimitive = undefined) {
  const ctx = this;
  let unique = [];
  if (x.length > 0) {
    hasPrimitive = hasPrimitive ?? x.some(i => TypeInfo.isPrimitiveValue(i));
    if (!hasPrimitive && x.length > maxCollSizeForDeepEqual) {
      // When we have more than maxCollSizeForDeepEqual items in input collection,
      // we use a hash table (on JSON strings) for efficiency.
      let uniqueHash = {};
      for (let i = 0, len = x.length; i < len; ++i) {
        let xObj = x[i];
        let xStr = hashObject(xObj);
        if (!uniqueHash[xStr]) {
          unique.push(xObj);
          uniqueHash[xStr] = true;
        }
      }
    } else {
      // Otherwise, it is more efficient to perform a deep comparison.
      // Use reverse() + pop() instead of shift() to improve performance and
      // maintain order.
      x = x.concat().reverse();
      do {
        let xObj = x.pop();
        unique.push(xObj);
        x = x.filter(o => !deepEqual(ctx, xObj, o));
      } while (x.length);
    }
  }
  return unique;
};


module.exports = engine;
