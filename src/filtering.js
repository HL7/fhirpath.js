// Contains the FHIRPath Filtering and Projection functions.  (Section 5.2 of
// the FHIRPath 1.0.0 specification).

/**
 *  Adds the filtering and projection functions to the given FHIRPath engine.
 */
const util = require('./utilities');
const {TypeInfo, ResourceNode} = require('./types');
const hashObject = require('./hash-object');

var engine = {};
engine.whereMacro = function(parentData, expr) {
  if(parentData !== false && ! parentData) { return []; }

  return util.flatten(parentData.filter((x, i) => {
    this.$index = i;
    return expr(x)[0];
  }));
};

engine.extension = function(parentData, url) {
  if(parentData !== false && ! parentData || !url) { return []; }

  return util.flatten(parentData.map((x, i) => {
    this.$index = i;
    const extensions = (x && (x.data && x.data.extension || x._data && x._data.extension));
    if (extensions) {
      return extensions
        .filter(extension => extension.url === url)
        .map(x => ResourceNode.makeResNode(x, 'Extension'));
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

engine.repeatMacro = function(parentData, expr) {
  if(parentData !== false && ! parentData) { return []; }

  let res = [];
  const unique = {};
  const length = parentData.length;
  for(let i = 0; i < length; ++i) {
    let newItems = parentData[i];
    do {
      newItems = expr(newItems)
        .filter(item => {
          const key = hashObject(item);
          const isUnique = !unique[key];
          if (isUnique) {
            unique[key] = true;
          }
          return isUnique;
        });
    } while (res.length < res.push.apply(res, newItems));
  }
  return res;
};

//TODO: behavior on object?
engine.singleFn = function(x) {
  if(x.length == 1){
    return x;
  } else if (x.length == 0) {
    return [];
  } else {
    //TODO: should throw error?
    return {$status: "error", $error: "Expected single"};
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
  return coll.filter(value => {
    return TypeInfo.fromValue(value).is(typeInfo);
  });
};

engine.distinctFn = function(x) {
  let unique = [];
  // Since this requires a deep equals, use a hash table (on JSON strings) for
  // efficiency.
  if (x.length > 0) {
    let uniqueHash = {};
    for (let i=0, len=x.length; i<len; ++i) {
      let xObj = x[i];
      let xStr = hashObject(xObj);
      if (uniqueHash[xStr] === undefined) {
        unique.push(xObj);
        uniqueHash[xStr] = xObj;
      }
    }
  }
  return unique;
};

module.exports = engine;
