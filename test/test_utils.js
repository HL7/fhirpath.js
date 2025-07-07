const fhirpath = require('../src/fhirpath');
const fs   = require('fs');
const _    = require('lodash');
const cacheOfResources = {};

const models = {
  'r5': require('../fhir-context/r5'),
  'r4': require('../fhir-context/r4'),
  'stu3': require('../fhir-context/stu3'),
  'dstu2': require('../fhir-context/dstu2')
}

/**
 *  Returns the FHIR model for the given fhir version.
 * @param fhirVersion If not undefined, must be one of the supported release
 *  versions, or an exception will be thrown.  If it is undefined, undefined will
 *  be returned.
 */
function getFHIRModel(fhirVersion) {
  let rtn;
  if (fhirVersion) {
    rtn = models[fhirVersion];
    if (!rtn) {
      console.error('No FHIR model available for version ' + fhirVersion);
      throw new Error('No FHIR model available for version ' + fhirVersion);
    }
  }
  return rtn;
}

function loadResource(filePath) {
  if (!_.has(cacheOfResources, filePath)) {
    if (fs.existsSync(filePath)) {
      cacheOfResources[filePath] = JSON.parse(fs.readFileSync(filePath));
    } else {
      console.error('Resource file doesn\'t exist: ' + filePath);
      throw new Error('Resource file doesn\'t exist: ' + filePath);
    }
  }

  // Clone input file contents to avoid one test affecting another
  return _.cloneDeep(cacheOfResources[filePath]);
}

const calcExpression = (expression, test, testResource) => {
  if (_.has(test, 'inputfile')) {
    testResource = loadResource(__dirname + `/resources/${test.model || 'r4'}/` + test.inputfile);
  }
  let variables = {resource: testResource};
  if (test.context)
    variables.context = fhirpath.evaluate(testResource, test.context)[0];
  if (test.variables)
    Object.assign(variables, test.variables);
  return fhirpath.evaluate(
    testResource, expression, variables,
    getFHIRModel(test.model), {resolveInternalTypes: false}
  );
};

module.exports = {
  loadResource,
  getFHIRModel,
  calcExpression
}
