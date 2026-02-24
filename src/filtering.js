// Contains the FHIRPath Filtering and Projection functions.  (Section 5.2 of
// the FHIRPath 1.0.0 specification).

/**
 *  Adds the filtering and projection functions to the given FHIRPath engine.
 */
const util = require('./utilities');
const {TypeInfo, ResourceNode, FP_Type} = require('./types');
const hashObject = require('./hash-object');
const { deepEqual, maxCollSizeForDeepEqual } = require('./deep-equal');

var engine = {};
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

engine.extension = function(parentData, url) {
  const ctx = this;
  if(parentData !== false && ! parentData || !url) { return []; }

  return util.flatten(parentData.map((x, i) => {
    this.$index = i;
    const extensions = (x && (x.data && x.data.extension || x._data && x._data.extension));
    if (extensions) {
      return extensions.reduce((list, extension, index) => {
        if(extension.url === url) {
          list.push(ResourceNode.makeResNode(extension, x, 'Extension', null,
            'Extension', ctx.model, 'extension', index));
        }
        return list;
      }, []);
    }
    return [];
  }));
};

engine.selectMacro = function(data, expr) {
  if(data !== false && ! data) { return []; }
  return util.flatten(data.map((x, i) => {
    this.$index = i;
    return expr(x);
  }));
};

engine.coalesce = function(data, ...exprs) {
  if(data !== false && ! data) { return []; }
  
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

engine.sort = function(data, ...sortArgs) {
  if(data !== false && !data) { return []; }
  
  // If no sort arguments provided, use natural ordering
  if (sortArgs.length === 0) {
    return data.slice().sort((a, b) => {
      return compareValues(util.valData(a), util.valData(b));
    });
  }
  
  // Sort with expressions and directions
  return data.slice().sort((a, b) => {
    for (let i = 0; i < sortArgs.length; i++) {
      const sortArg = sortArgs[i];
      const direction = sortArg.direction || 'asc';
      
      // Evaluate the sort expression for both items
      const resultA = sortArg.expr([a]);
      const resultB = sortArg.expr([b]);
      
      // Enforce singleton requirement per specification
      let valA, valB;
      try {
        if (resultA.length > 0) {
          util.assertOnlyOne(resultA, 'Sort expression must return singleton value');
          valA = resultA[0]; // Get the actual value after validation
        } else {
          valA = null;
        }
        if (resultB.length > 0) {
          util.assertOnlyOne(resultB, 'Sort expression must return singleton value');
          valB = resultB[0]; // Get the actual value after validation
        } else {
          valB = null;
        }
      } catch (error) {
        // Re-throw with more context about sort expression requirements
        throw new Error('Sort expression evaluation error: ' + error.message);
      }
      
      // Extract values for comparison
      valA = valA !== null ? util.valData(valA) : null;
      valB = valB !== null ? util.valData(valB) : null;
      
      // Compare values using FHIRPath comparison semantics
      let comparison = compareValues(valA, valB);
      
      // Apply direction
      if (direction === 'desc') {
        comparison = -comparison;
      }
      
      // If this sort key produces a difference, return it
      if (comparison !== 0) {
        return comparison;
      }
      
      // Otherwise, continue to the next sort key
    }
    
    // All sort keys were equal
    return 0;
  });
};

/**
 * Compare two values using FHIRPath comparison semantics
 * Reuses existing equality.js comparison logic
 */
function compareValues(a, b) {
  // Handle empty values - per spec: "An empty value is considered lower than all other values"
  if (a == null && b == null) return 0;
  if (a == null) return -1;  // Empty values sort before non-empty values
  if (b == null) return 1;
  
  try {
    // Use existing FHIRPath comparison logic from equality.js
    // Convert to singleton arrays for typecheck
    const [a0, b0] = equality.typecheck([a], [b]);
    
    // Handle FP_Type objects (dates, times, quantities, etc.)
    if (a0 instanceof FP_Type) {
      const compareResult = a0.compare(b0);
      return compareResult === null ? 0 : compareResult;
    }
    
    // Standard JavaScript comparison for basic types
    if (a0 === b0) return 0;
    return a0 < b0 ? -1 : a0 > b0 ? 1 : 0;
    
  } catch (error) {
    // Fallback for incomparable types - use string comparison as last resort
    // Per spec: "Values that would result in comparison errors must be filtered prior to sorting"
    const strA = String(a);
    const strB = String(b);
    return strA.localeCompare(strB);
  }
}

engine.repeatMacro = function(parentData, expr, state = { res: [], unique: {}, hasPrimitive: false }) {
  if(parentData !== false && ! parentData) { return []; }

  let newItems = [].concat(...parentData.map(i => expr(i)));
  if (newItems.some(i => i instanceof Promise)) {
    return Promise.all(newItems).then(items => {
      items = [].concat(...items);
      if (items.length) {
        return engine.repeatMacro(getNewItems(items, state), expr, state);
      }
      return state.res;
    });
  } else if (newItems.length) {
    return engine.repeatMacro(getNewItems(newItems, state), expr, state);
  } else {
    return state.res;
  }
};

/**
 * Returns new items from the input array that are not in the hash of existing
 * unique items and adds them to the result array.
 * @param {Array<*>} items - inout array.
 * @param {Object} state - current state object.
 * @param {{[key: string]: *}} state.unique - hash of existing unique items.
 * @param {Array<*>} state.res - result array.
 * @param {boolean} state.hasPrimitive - flag indicating if the result array has
 *  primitives.
 * @return {Array<*>}
 */
function getNewItems(items, state) {
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
      const isUnique = !state.res.some(i => deepEqual(i, item));
      if (isUnique) {
        state.res.push(item);
      }
      return isUnique;
    });
  }
  return newItems;
}

//TODO: behavior on object?
engine.singleFn = function(x) {
  if(x.length === 1){
    return x;
  } else if (x.length === 0) {
    return [];
  } else {
    throw new Error("Expected single");
  }
};


engine.firstFn = function(x) {
  return x[0];
};

engine.lastFn = function(x) {
  return x[x.length - 1];
};

engine.tailFn = function(x) {
  return x.slice(1, x.length);
};

engine.takeFn = function(x, n) {
  return x.slice(0, n);
};

engine.skipFn = function(x, num) {
  return x.slice(num, x.length);
};

engine.ofTypeFn = function(coll, typeInfo) {
  const ctx = this;
  return coll.filter(value => {
    return TypeInfo.fromValue(value).isConvertibleTo(typeInfo, ctx.model);
  });
};

engine.distinctFn = function(x, hasPrimitive = undefined) {
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
        x = x.filter(o => !deepEqual(xObj, o));
      } while (x.length);
    }
  }
  return unique;
};

module.exports = engine;
