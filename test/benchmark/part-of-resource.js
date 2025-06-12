const _ = require('lodash');
const questionnairePartExample = require('../resources/patient-example.json');

module.exports = ({
                    options
                  }) => {

  const expression = {
    base: 'QuestionnaireResponse.item[0].item[1].item[2].item[4]',
    expression: 'answer.value.toString()'
  };

  return [
    ...(options.compileOnly
      ? []
      : [{
        name: `Evaluating an expression on a part of a resource using evaluate()`,
        filename: 'part-of-resource-evaluate',
        expression,
        cases: [{
            name: '',
            testFunction: (fhirpath, model) => {
              const resource = _.cloneDeep(questionnairePartExample);
              return () => fhirpath.evaluate(resource, expression, {}, model);
            }
          }
        ]
      }]),
    {
      name: `Evaluating an expression on a part of a resource using compile()`,
      filename: 'part-of-resource-compile',
      expression,
      cases: [
        {
          name: '',
          testFunction: (fhirpath, model, compiledFn) => {
            const resource = _.cloneDeep(questionnairePartExample);
            return () => compiledFn(resource, {});
          }
        }
      ]
    }];

}
