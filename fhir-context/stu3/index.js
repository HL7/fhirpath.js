const updateWithGeneratedData = require('../general-additions');
/**
 *  Exports the FHIR model data for STU3.  This is an internal structure that
 *  will likely evolve as more FHIR specific processing is added.
 */
const modelInfo = {
  version: 'stu3',
  score: {
    // See:
    // - https://hl7.org/fhir/STU3/extension-iso21090-co-value.html
    // - https://www.hl7.org/fhir/stu3/extension-questionnaire-ordinalvalue.html
    // - https://hl7.org/fhir/STU3/extension-valueset-ordinalvalue.html
    extension: {
      // Context of use:
      // - Coding
      coding: 'http://hl7.org/fhir/StructureDefinition/iso21090-CO-value',
      // Context of use:
      // - Questionnaire.item.option.valueCoding
      questionnaire: 'http://hl7.org/fhir/StructureDefinition/questionnaire-ordinalValue',
      // Context of use:
      // - ValueSet.expansion.contains
      // - ValueSet.compose.include.concept
      valueSetExpansion: 'http://hl7.org/fhir/StructureDefinition/valueset-ordinalValue',
      valueSetInclude: 'http://hl7.org/fhir/StructureDefinition/valueset-ordinalValue'
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

