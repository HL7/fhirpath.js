const updateWithGeneratedData = require('../general-additions');
/**
 *  Exports the FHIR model data for R5.  This is an internal structure that
 *  will likely evolve as more FHIR specific processing is added.
 */
const modelInfo = {
  version: 'r5',
  score: {
    // See
    // - https://hl7.org/fhir/R5/codesystem.html#defined-props
    // - https://hl7.org/fhir/codesystem-concept-properties.html
    property: {
      uri: 'http://hl7.org/fhir/concept-properties#itemWeight',
    },
    // See
    // - https://www.hl7.org/fhir/extensions/StructureDefinition-itemWeight.html
    // - https://build.fhir.org/ig/HL7/fhir-extensions/branches/__default/StructureDefinition-itemWeight.html
    extension: {
      // Context of use:
      // - Coding
      coding: 'http://hl7.org/fhir/StructureDefinition/itemWeight',
      // Context of use:
      // - Questionnaire.item.answerOption
      questionnaire: 'http://hl7.org/fhir/StructureDefinition/itemWeight',
      // Context of use:
      // - QuestionnaireResponse.item.answer
      // - QuestionnaireResponse.item.answer.value (valueCoding covered by Coding)
      questionnaireResponse:'http://hl7.org/fhir/StructureDefinition/itemWeight',
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
