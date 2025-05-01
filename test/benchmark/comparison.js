const _ = require('lodash');

module.exports = ({
                    options
                  }) => {

  const expression = "1 < 2";

  return [
    ...(options.compileOnly
      ? []
      : [{
        name: `Do simple comparison 1 < 2 using evaluate()`,
        filename: 'comparison-evaluate',
        expression,
        cases: [{
          name: '',
          testFunction: (fhirpath, model) => {
            return () => fhirpath.evaluate({}, expression, {}, model);
          }
        }
        ]
      }]),
    {
      name: `Do simple comparison 1 < 2 using compile()`,
      filename: 'comparison-compile',
      expression,
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
