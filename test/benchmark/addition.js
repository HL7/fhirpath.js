module.exports = ({
                    options,
                    fhirpathOptions
                  }) => {

  const expression = "Observation.value.value + 0.2";
  const observation = {
    "resourceType": "Observation",
    "valueQuantity": {
      "value": 0.1,
      "system": "http://unitsofmeasure.org",
      "code": "kg"
    }
  }

  return [
    ...(options.compileOnly
      ? []
      : [{
        name: `Do simple addition ${expression} using evaluate()`,
        filename: 'addition-evaluate',
        expression,
        cases: [{
          name: '',
          testFunction: (fhirpath, model) => {
            return () => fhirpath.evaluate(observation, expression, {}, model, fhirpathOptions);
          }
        }
        ]
      }]),
    {
      name: `Do simple addition ${expression} using compile()`,
      filename: 'addition-compile',
      expression,
      cases: [
        {
          name: '',
          testFunction: (fhirpath, model, compiledFn) => {
            return () => compiledFn(observation, {});
          }
        }
      ]
    }];

}
