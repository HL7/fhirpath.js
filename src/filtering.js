// Contains the FHIRPath Filtering and Projection functions.  (Section 5.2 of
// the FHIRPath 1.0.0 specification).

const util = require('./utilities');
const {TypeInfo, ResourceNode, FP_Type} = require('./types');
const hashObject = require('./hash-object');
const { deepEqual, maxCollSizeForDeepEqual } = require('./deep-equal');
const equality = require('./equality');

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
  if(!url) { return []; }

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
  return util.flatten(data.map((x, i) => {
    this.$index = i;
    return expr(x);
  }));
};


/**
 * Implements the FHIRPath `coalesce(...)` function.
 * Evaluates each expression in order and returns the first non-empty result.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#coalesce
 * @param {Array} data - the input collection.
 * @param {...Function} exprs - expressions to evaluate against the input.
 * Note: exprs are ExprAtCurrent thunks created by makeParam().
 * Each expr evaluates against `data` as parentData, but `$this` remains from
 * the outer context. coalesce is lazy/short-circuit, not `$this`-scoped.
 * @returns {Array|Promise<Array>} the first non-empty result, or an empty
 *   collection if all expressions are empty. Returns a Promise when expression
 *   evaluation is asynchronous.
 */
engine.coalesce = function(data, ...exprs) {
  // Evaluate each expression in sequence until we find a non-empty result
  for (let i = 0; i < exprs.length; i++) {
    const expr = exprs[i];
    const result = expr(data);

    // Handle Promise results
    if (result instanceof Promise) {
      return result.then(r => {
        if (util.isSome(r)) {
          return r;
        }
        // Continue with remaining expressions
        const remainingExprs = exprs.slice(i + 1);
        if (remainingExprs.length > 0) {
          return engine.coalesce(data, ...remainingExprs);
        }
        return [];
      });
    }

    // If we found a non-empty result, return it
    if (util.isSome(result)) {
      return result;
    }
  }

  // All expressions returned empty results
  return [];
};


/**
 * Implements the FHIRPath `sort(...)` function.
 * Sorts the input collection using one or more sort expressions and optional
 * sort directions.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#fn-sort
 * @param {Array} data - the input collection.
 * @param {...Object} sortArgs - sort argument descriptors with `expr` and
 *   optional `direction` (`asc` or `desc`).
 * @returns {Array|Promise<Array>} the sorted collection. Returns a Promise
 *   when any sort expression evaluates asynchronously.
 */
engine.sort = function(data, ...sortArgs) {
  const ctx = this;
  // If no sort arguments provided, use natural ordering
  if (sortArgs.length === 0) {
    return data.slice().sort((a, b) => {
      return compareValues(ctx, a, b);
    });
  }

  const decorated = data.map(item => ({
    item,
    keys: new Array(sortArgs.length),
    keyPromises: new Array(sortArgs.length),
    keyReady: new Array(sortArgs.length).fill(false)
  }));
  const sorted = sortDecoratedByArg(ctx, decorated, sortArgs, 0);
  return sorted instanceof Promise ?
    sorted.then(entries => entries.map(entry => entry.item)) :
    sorted.map(entry => entry.item);
};


/**
 * Sorts decorated entries by one sort argument and recurses only into tie
 * groups for later sort arguments.
 * @param {Object} ctx - current evaluation context.
 * @param {Array<Object>} decorated - items paired with lazily-evaluated sort
 *   keys.
 * @param {Array<Object>} sortArgs - sort argument descriptors.
 * @param {number} argIndex - index of the current sort argument.
 * @returns {Array<Object>|Promise<Array<Object>>} sorted decorated entries.
 */
function sortDecoratedByArg(ctx, decorated, sortArgs, argIndex) {
  if (decorated.length < 2 || argIndex >= sortArgs.length) {
    return decorated;
  }

  const sortArg = sortArgs[argIndex];
  const keyPrep = ensureKeysForArg(decorated, sortArg, argIndex);
  if (keyPrep instanceof Promise) {
    return keyPrep.then(() => {
      return sortDecoratedByPreparedArg(ctx, decorated, sortArgs, argIndex);
    });
  }
  return sortDecoratedByPreparedArg(ctx, decorated, sortArgs, argIndex);
}


/**
 * Ensures keys for one sort argument are evaluated for all entries.
 * @param {Array<Object>} decorated - entries being sorted.
 * @param {{expr: Function}} sortArg - current sort argument descriptor.
 * @param {number} argIndex - index of the current sort argument.
 * @returns {void|Promise<void>} Promise when any key is asynchronous.
 */
function ensureKeysForArg(decorated, sortArg, argIndex) {
  let pending;
  for (let i = 0; i < decorated.length; i++) {
    const key = getSortKey(decorated[i], sortArg, argIndex);
    if (key instanceof Promise) {
      pending ||= [];
      pending.push(key);
    }
  }
  return pending ? Promise.all(pending).then(() => {}) : undefined;
}


/**
 * Gets one cached sort key, evaluating it lazily if needed.
 * @param {Object} entry - decorated item entry.
 * @param {{expr: Function}} sortArg - current sort argument descriptor.
 * @param {number} argIndex - index of the current sort argument.
 * @returns {*|Promise<*>} the singleton sort key.
 */
function getSortKey(entry, sortArg, argIndex) {
  if (entry.keyReady[argIndex]) {
    return entry.keys[argIndex];
  }
  if (entry.keyPromises[argIndex]) {
    return entry.keyPromises[argIndex];
  }

  const key = evaluateSortExpression(sortArg, entry.item);
  if (key instanceof Promise) {
    entry.keyPromises[argIndex] = key.then(resolvedKey => {
      entry.keys[argIndex] = resolvedKey;
      entry.keyReady[argIndex] = true;
      return resolvedKey;
    });
    return entry.keyPromises[argIndex];
  }

  entry.keys[argIndex] = key;
  entry.keyReady[argIndex] = true;
  return key;
}


/**
 * Sorts by the already-prepared key for one argument and recurses into ties.
 * @param {Object} ctx - current evaluation context.
 * @param {Array<Object>} decorated - entries being sorted.
 * @param {Array<Object>} sortArgs - sort argument descriptors.
 * @param {number} argIndex - index of the current sort argument.
 * @returns {Array<Object>|Promise<Array<Object>>} sorted decorated entries.
 */
function sortDecoratedByPreparedArg(ctx, decorated, sortArgs, argIndex) {
  const direction = sortArgs[argIndex].direction || 'asc';
  decorated.sort((a, b) => {
    let comparison = compareValues(ctx, a.keys[argIndex], b.keys[argIndex]);
    if (direction === 'desc') {
      comparison = -comparison;
    }
    return comparison;
  });

  const nextArgIndex = argIndex + 1;
  if (nextArgIndex >= sortArgs.length || decorated.length < 2) {
    return decorated;
  }

  if (!hasEqualKeyNeighbors(ctx, decorated, argIndex)) {
    return decorated;
  }

  const groups = splitEqualKeyGroups(ctx, decorated, argIndex);
  let hasAsync = false;
  const sortedGroups = groups.map(group => {
    if (group.length < 2) {
      return group;
    }
    const sortedGroup = sortDecoratedByArg(ctx, group, sortArgs, nextArgIndex);
    if (sortedGroup instanceof Promise) {
      hasAsync = true;
    }
    return sortedGroup;
  });

  if (!hasAsync) {
    return flattenGroups(sortedGroups);
  }
  return Promise.all(sortedGroups).then(flattenGroups);
}


/**
 * Checks if a sorted array has at least one adjacent pair with equal keys.
 * @param {Object} ctx - current evaluation context.
 * @param {Array<Object>} decorated - entries sorted by current key.
 * @param {number} argIndex - current sort argument index.
 * @returns {boolean} true when there is at least one tie group.
 */
function hasEqualKeyNeighbors(ctx, decorated, argIndex) {
  for (let i = 1; i < decorated.length; i++) {
    if (compareValues(ctx, decorated[i - 1].keys[argIndex],
      decorated[i].keys[argIndex]) === 0) {
      return true;
    }
  }
  return false;
}


/**
 * Splits sorted entries into contiguous groups with equal key values.
 * @param {Object} ctx - current evaluation context.
 * @param {Array<Object>} decorated - entries sorted by current key.
 * @param {number} argIndex - current sort argument index.
 * @returns {Array<Array<Object>>} groups of equal-key entries.
 */
function splitEqualKeyGroups(ctx, decorated, argIndex) {
  const groups = [];
  let groupStart = 0;
  for (let i = 1; i <= decorated.length; i++) {
    if (i === decorated.length ||
      compareValues(ctx, decorated[i - 1].keys[argIndex],
        decorated[i].keys[argIndex]) !== 0) {
      groups.push(decorated.slice(groupStart, i));
      groupStart = i;
    }
  }
  return groups;
}


/**
 * Flattens grouped decorated entries into a single array.
 * @param {Array<Array<Object>>} groups - grouped decorated entries.
 * @returns {Array<Object>} flattened entries.
 */
function flattenGroups(groups) {
  const flattened = [];
  for (let i = 0; i < groups.length; i++) {
    flattened.push.apply(flattened, groups[i]);
  }
  return flattened;
}


/**
 * Evaluates one sort expression for one collection item.
 * @param {{expr: Function, direction?: string}} sortArg - sort argument
 *   descriptor.
 * @param {*} item - the item being sorted.
 * @throws {SortExpressionError} if the expression throws an error.
 * @returns {*|Promise<*>} the extracted singleton sort key, or a Promise when
 *   expression evaluation is asynchronous.
 */
function evaluateSortExpression(sortArg, item) {
  let result;
  try {
    result = sortArg.expr([item]);
  } catch (error) {
    throw wrapSortExpressionError(error);
  }

  return result instanceof Promise
    ? result.then(extractSortValue).catch(error => {
      throw wrapSortExpressionError(error);
    })
    : extractSortValue(result);
}


/**
 * Extracts a single sort key from a sort expression result collection.
 * @param {Array} result - sort expression result.
 * @throws {SortExpressionError} if the result is not singleton.
 * @returns {*} the singleton sort key, or null for an empty result.
 */
function extractSortValue(result) {
  const len = result.length;
  if (len === 0) {
    return null;
  } else if (len !== 1) {
    throw new SortExpressionError(
      'expected a singleton value, but got ' + util.toJSON(result)
    );
  }
  return result[0];
}


/**
 * Represents a normalized error thrown when evaluating a `sort(...)`
 * expression. This wraps any underlying exception so callers receive
 * a consistent error type and message format.
 */
class SortExpressionError extends Error {
  /**
   * Creates a sort-expression error from any thrown value.
   * @param {*} error - The original thrown value (Error instance or arbitrary
   *  value).
   */
  constructor(error) {
    super('Sort expression evaluation error: ' + getErrorMessage(error));
    this.name = 'SortExpressionError';
  }
}


/**
 * Ensures an error is a `SortExpressionError`.
 * If the input is already a `SortExpressionError`, it is returned unchanged;
 * otherwise, it is wrapped in a new `SortExpressionError`.
 * @param {*} error - The original thrown value to normalize.
 * @returns {SortExpressionError} A normalized sort-expression error.
 */
function wrapSortExpressionError(error) {
  return error instanceof SortExpressionError ? error :
    new SortExpressionError(error);
}


/**
 * Normalizes an unknown thrown value to a message string.
 * @param {*} error - caught error value.
 * @returns {string} the error message.
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}


/**
 * Compare two values using FHIRPath comparison semantics
 * Reuses existing equality.js comparison logic
 * @param {Object} ctx - current evaluation context.
 * @param {*} a - left-hand value.
 * @param {*} b - right-hand value.
 * @returns {number} comparison result (-1, 0, or 1).
 */
function compareValues(ctx, a, b) {
  // Handle empty values - per spec: "An empty value is considered lower than all other values"
  if (a == null && b == null) return 0;
  if (a == null) return -1;  // Empty values sort before non-empty values
  if (b == null) return 1;

  // Use existing FHIRPath comparison logic from equality.js.
  // The scalar helper avoids per-compare singleton array allocations.
  const [a0, b0, exchanged] = equality.typecheckScalars(ctx, a, b);

  // Handle FP_Type objects (dates, times, quantities, etc.)
  if (a0 instanceof FP_Type) {
    const compareResult = a0.compare(b0);
    if (compareResult === null) {
      throw new Error('Cannot sort incomparable values');
    }
    return exchanged ? -compareResult : compareResult;
  }

  // Reject non-primitive types that can't be meaningfully compared
  // Per spec: "Values that would result in comparison errors must be filtered
  //  prior to sorting"
  let type = typeof a0;
  if (type === 'object' || type === 'function') {
    throw new Error('Cannot sort by non-primitive type: ' +
      (a0.constructor?.name || type));
  }
  type = typeof b0;
  if (type === 'object' || type === 'function') {
    throw new Error('Cannot sort by non-primitive type: ' +
      (b0.constructor?.name || type));
  }

  // Standard JavaScript comparison for basic types
  if (a0 === b0) return 0;
  return a0 < b0 ? -1 : a0 > b0 ? 1 : 0;
}


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
 * @returns {Array<*>} items that were not already present in the state.
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
