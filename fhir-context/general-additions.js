/**
 * Updates the provided modelInfo object with generated data structures.
 *
 * - Populates `modelInfo.availableTypes` as a Set containing all unique type names
 *   from both the keys and values of `modelInfo.type2Parent`.
 * - Builds `modelInfo.path2TypeWithoutElements`, a hash map of paths to data types,
 *   excluding entries where the type is "Element" or "BackboneElement".
 * - Builds `modelInfo.path2RefType`, a hash map of paths to their reference types
 *   if available, and updates the type to its code if a reference type exists.
 *
 * @param {Object} modelInfo - The model information object to update. Must contain
 *   `type2Parent` (a hash map of data types to parent data types) and
 *   `path2Type` (a hash map of paths to data types).
 */
function updateWithGeneratedData(modelInfo) {
  // Generate a set of available data types
  modelInfo.availableTypes = new Set();
  // IE11 probably doesn't support `new Set(iterable)`
  Object.keys(modelInfo.type2Parent).forEach(i => modelInfo.availableTypes.add(i));
  Object.values(modelInfo.type2Parent).forEach(i => modelInfo.availableTypes.add(i));

  // Generate a hash map to map paths to data types excluding "BackboneElement" and "Element".
  modelInfo.path2TypeWithoutElements = {};
  modelInfo.path2RefType = {};
  for(let i in modelInfo.path2Type) {
    if (modelInfo.path2Type[i].refType) {
      modelInfo.path2RefType[i] = modelInfo.path2Type[i].refType;
      modelInfo.path2Type[i] = modelInfo.path2Type[i].code;
    } else if (modelInfo.path2Type[i] === 'Element' || modelInfo.path2Type[i] === 'BackboneElement') {
      continue;
    }
    modelInfo.path2TypeWithoutElements[i] = modelInfo.path2Type[i];
  }
}


/**
 * Converts an array of strings into an object where each key is an array
 * element and the value is `true`.
 *
 * @param {string[]} arr - The array of strings to convert.
 * @returns {Object} An object with keys from the array and `true` as the value
 *  for each key.
 */
function arrToHash(arr) {
  const hash = {};
  for (const item of arr) {
    hash[item] = true;
  }
  return hash;
}


module.exports = {
  updateWithGeneratedData,
  arrToHash
};
