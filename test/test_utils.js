const fhirpath = require('../src/fhirpath');
const fs   = require('fs');
const _    = require('lodash');
const resources = {};

const models = {
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
    if (!rtn)
      throw new Error('No FHIR model available for version '+fhirVersion);
  }
  return rtn;
}

function loadResource(filename, filePath) {
  if (fs.existsSync(filePath)) {
    resources[filename] = JSON.parse(fs.readFileSync(filePath));
  } else {
    throw new Error("Resource file doesn't exist");
  }
}

const calcExpression = (expression, test, testResource) => {
  if (_.has(test, 'inputfile')) {
    if(!_.has(resources, test.inputfile)) {
      loadResource(test.inputfile, __dirname + '/resources/' + test.inputfile)
    }
    testResource = resources[test.inputfile];
  }
  let variables = {resource: testResource};
  if (test.context)
    variables.context = fhirpath.evaluate(testResource, test.context)[0];
  if (test.variables)
    Object.assign(variables, test.variables);
  return fhirpath.evaluate(testResource, expression, variables, getFHIRModel(test.model));
};

module.exports = {
  loadResource,
  getFHIRModel,
  calcExpression
}