// Binding the function Array.prototype.slice.call for convert Array-like objects/collections to a new Array.
const slice = Function.prototype.call.bind(Array.prototype.slice);

// isInteger (not in IE)
// From Mozilla docs
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
};


if (!String.prototype.startsWith) {
  // From Mozilla docs with little changes
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    }
  });
}

if (!Object.assign) {
  // From Mozilla docs with little changes
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    value: function(target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      return slice(arguments, 1).reduce(function (to, nextSource) {
        Object.keys(Object(nextSource)).forEach(function (nextKey) {
          to[nextKey] = nextSource[nextKey];
        });
        return to;
      },  Object(target));
    }
  });
}