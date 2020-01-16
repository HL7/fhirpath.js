/**
 *  Exports the FHIR model data for STU3.  This is an internal structure that
 *  will likely evolve as more FHIR specific processing is added.
 */
module.exports = {
  /**
   *  A hash of resource element paths (e.g. Observation.value) that are known
   *  to point to fiels that are choice types.
   */
  choiceTypePaths: require('./choiceTypePaths'),

  /**
   *  A hash from paths to the path for which their content is defined, e.g.
   *  Questionnaire.item.item -> Questionnaire.item.
   */
  pathsDefinedElsewhere: require('./pathsDefinedElsewhere')
}
