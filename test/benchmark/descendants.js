const _ = require('lodash');

module.exports = ({
                    current_fhirpath,
                    current_r4_model,
                    patientExample,
                    options
                  }) => {
  // We need copy of objects because the __path__ property is not configurable and may have different values in different versions
  const patientExampleCopy1 = _.cloneDeep(patientExample);
  const PatientExampleCopy2 = _.cloneDeep(patientExample);
  const numberOfItems = current_fhirpath.evaluate(patientExampleCopy1,'Patient.descendants().count()', {},  current_r4_model);
  const expression = 'Patient.descendants()';

  return [
    ...(options.compileOnly
      ? []
      : [{
        name: `Getting ${numberOfItems} descendants using evaluate()`,
        filename: 'descendants-evaluate',
        expression,
        cases: [{
          name: '',
          testFunction: (fhirpath, model) => {
            fhirpath.evaluate(fhirpath === current_fhirpath ? patientExampleCopy1 : PatientExampleCopy2, expression, {}, model);
          }
        }]
      }]),
    {
      name: `Getting ${numberOfItems} descendants using compile()`,
      filename: 'descendants-compile',
      expression,
      cases: [{
        name: '',
        testFunction: (fhirpath, model, compiledFn) => {
          compiledFn(fhirpath === current_fhirpath ? patientExampleCopy1 : PatientExampleCopy2, {});
        }
      }]
    }];

}
