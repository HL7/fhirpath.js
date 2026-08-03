module.exports = ({
                    options
                  }) => {

  const simpleExpression = "1 < 2";

  return [
    ...(options.compileOnly
      ? []
      : [{
        name: `Do simple comparison 1 < 2 using evaluate()`,
        filename: 'comparison-evaluate',
        expression: simpleExpression,
        cases: [{
          name: '',
          testFunction: (fhirpath, model) => {
            return () => fhirpath.evaluate({}, simpleExpression, {}, model);
          }
        }
        ]
      }]),
    {
      name: `Do simple comparison 1 < 2 using compile()`,
      filename: 'comparison-compile',
      expression: simpleExpression,
      cases: [
        {
          name: '',
          testFunction: (fhirpath, model, compiledFn) => {
            return () => compiledFn({}, {});
          }
        }
      ]
    }];

}
