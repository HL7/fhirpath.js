// Update the model with generated data
module.exports = (modelInfo) => {
  // Generate a set of available data types
  modelInfo.availableTypes = new Set();
  // IE11 probably doesn't support `new Set(iterable)`
  Object.keys(modelInfo.type2Parent).forEach(i => modelInfo.availableTypes.add(i));
  Object.values(modelInfo.type2Parent).forEach(i => modelInfo.availableTypes.add(i));

  // Generate a hash map to map paths to data types excluding "BackboneElement" and "Element".
  modelInfo.path2TypeWithoutElements = {};
  for(let i in modelInfo.path2Type) {
    if (modelInfo.path2Type[i] === 'Element' || modelInfo.path2Type[i] === 'BackboneElement') {
      continue;
    }
    modelInfo.path2TypeWithoutElements[i] = modelInfo.path2Type[i];
  }
};
