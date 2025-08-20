const { updateWithGeneratedData, arrToHash } = require('../general-additions');

/**
 *  Exports the FHIR model data for R4.  This is an internal structure that
 *  will likely evolve as more FHIR specific processing is added.
 */
const modelInfo = {
  version: 'r4',
  score: {
    // See
    // - https://www.hl7.org/fhir/R4/extension-ordinalvalue.html
    // - https://www.hl7.org/fhir/extensions/StructureDefinition-itemWeight.html
    // - https://build.fhir.org/ig/HL7/fhir-extensions/StructureDefinition-itemWeight.html
    extensionURI: [
      'http://hl7.org/fhir/StructureDefinition/ordinalValue',
      'http://hl7.org/fhir/StructureDefinition/itemWeight'
    ]
  },
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
  path2Type: require('./path2Type.json'),
  /**
   * A hash with FHIR resource types that support the 'url' search parameter.
   * The data is loaded from the resourcesWithUrlParam.json file.
   */
  resourcesWithUrlParam: arrToHash(require('./resourcesWithUrlParam.json'))
};

// Update with generated data
updateWithGeneratedData(modelInfo);

module.exports = modelInfo;
