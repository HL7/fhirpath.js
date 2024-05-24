const _ = require('lodash');

module.exports = ({
                    current_fhirpath,
                    current_r4_model,
                    patientExample,
                    options
                  }) => {
  // We need copy of objects because the __path__ property is not configurable and may have different values in different versions
  const numberOfItems = current_fhirpath.evaluate(patientExample,'Patient.descendants().count()', {},  current_r4_model);
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
            const resource = _.cloneDeep(patientExample);
            return () => fhirpath.evaluate(resource, expression, {}, model);
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
          const resource = _.cloneDeep(patientExample);
          return () => compiledFn(resource, {});
        }
      }]
    }];

}
