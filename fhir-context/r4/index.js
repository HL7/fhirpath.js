/**
 *  Exports the FHIR model data for R4.  This is an internal structure that
 *  will likely evolve as more FHIR specific processing is added.
 */
const modelInfo = {
  /**
   *  A hash of resource element paths (e.g. Observation.value) that are known
   *  to point to fiels that are choice types.
   */
  choiceTypePaths: require('./choiceTypePaths.json'),

  /**
   *  A hash from paths to the path for which their content is defined, e.g.
   *  Questionnaire.item.item -> Questionnaire.item.
   */
  pathsDefinedElsewhere: require('./pathsDefinedElsewhere.json'),
  /**
   * Mapping data types to parent data types.
   */
  type2Parent: require('./type2Parent.json'),
  /**
   * Mapping paths to data types.
   */
  path2Type: require('./path2Type.json')
};

// Generate a set of available data types
// TODO: Check if IE11 supports `new Set(iterable)`
modelInfo.availableTypes = new Set([].concat(Object.keys(modelInfo.type2Parent), Object.values(modelInfo.type2Parent)));

module.exports = modelInfo;
