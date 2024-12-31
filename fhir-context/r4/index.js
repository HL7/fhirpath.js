const updateWithGeneratedData = require('../general-additions');

/**
 *  Exports the FHIR model data for R4.  This is an internal structure that
 *  will likely evolve as more FHIR specific processing is added.
 */
const modelInfo = {
  version: 'r4',
  score: {
    // See
    // https://www.hl7.org/fhir/R4/extension-ordinalvalue.html
    extension: {
      // Context of use:
      // - Coding
      coding: 'http://hl7.org/fhir/StructureDefinition/ordinalValue',
      // Context of use:
      // - Questionnaire.item.answerOption
      questionnaire: 'http://hl7.org/fhir/StructureDefinition/ordinalValue',
      // Context of use:
      // - ValueSet.compose.include.concept
      valueSetInclude: 'http://hl7.org/fhir/StructureDefinition/ordinalValue',
      // Context of use:
      // - CodeSystem.concept
      codeSystem: 'http://hl7.org/fhir/StructureDefinition/ordinalValue'
    }
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
  path2Type: require('./path2Type.json')
};

// Update with generated data
updateWithGeneratedData(modelInfo)

module.exports = modelInfo;
