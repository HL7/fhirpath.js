const _ = require('lodash');

module.exports = ({
                    options,
                    fhirpathOptions
                  }) => {

  const observation = {
    resourceType: 'Observation',
    valueQuantity: {
      value: 1,
      unit: 'year',
      system: 'http://unitsofmeasure.org',
      code: 'a'
    }
  };

  const benchmarks = [
    {
      id: 'fhir-quantity-equal-calendar',
      name: "FHIR Quantity equals calendar duration",
      expression: "Observation.value = 1 year"
    },
    {
      id: 'fhir-quantity-plus-calendar',
      name: 'FHIR Quantity plus calendar duration',
      expression: "Observation.value + 1 year = 2 years"
    },
    {
      id: 'fhir-quantity-date-arithmetic-mul',
      name: 'FHIR Quantity in scaled date arithmetic',
      expression: "@2025 + Observation.value * 2 = @2027"
    }
  ];

  return benchmarks.flatMap((benchmark) => {
    return [
      ...(options.compileOnly
        ? []
        : [{
          name: `${benchmark.name} using evaluate()`,
          filename: `${benchmark.id}-evaluate`,
          expression: benchmark.expression,
          cases: [{
            name: '',
            testFunction: (fhirpath, model) => {
              const resource = _.cloneDeep(observation);
              return () => fhirpath.evaluate(resource, benchmark.expression, {},
                model, fhirpathOptions);
            }
          }]
        }]),
      {
        name: `${benchmark.name} using compile()`,
        filename: `${benchmark.id}-compile`,
        expression: benchmark.expression,
        cases: [{
          name: '',
          testFunction: (fhirpath, model, compiledFn) => {
            const resource = _.cloneDeep(observation);
            return () => compiledFn(resource, {});
          }
        }]
      }
    ];
  });
};
