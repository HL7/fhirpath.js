const _ = require('lodash');

module.exports = ({
                    current_fhirpath,
                    current_r4_model,
                    minimumDataset,
                    options
                  }) => {

  const numberOfItems = current_fhirpath.evaluate(_.cloneDeep(minimumDataset),'Questionnaire.item.count()', {},  current_r4_model);
  const expression = 'Questionnaire.item';

  return [
    ...(options.compileOnly
      ? []
      : [{
        name: `Getting ${numberOfItems} items with engine.MemberInvocation using evaluate()`,
        filename: 'member-invocation-evaluate',
        expression,
        cases: [{
            name: '',
            testFunction: (fhirpath, model) => {
              const resource = _.cloneDeep(minimumDataset);
              return () => fhirpath.evaluate(resource, expression, {}, model);
            }
          }
        ]
      }]),
    {
      name: `Getting ${numberOfItems} items with engine.MemberInvocation using compile()`,
      filename: 'member-invocation-compile',
      expression,
      cases: [
        {
          name: '',
          testFunction: (fhirpath, model, compiledFn) => {
            const resource = _.cloneDeep(minimumDataset);
            return () => compiledFn(resource, {});
          }
        }
      ]
    }];

}
