const _ = require('lodash');

module.exports = ({
                    current_fhirpath,
                    current_r4_model,
                    minimumDataset,
                    options
                  }) => {

  const numberOfItems = current_fhirpath.evaluate(minimumDataset,'Questionnaire.item.count()', {},  current_r4_model);
  const expression = 'Questionnaire.item';

  return [{
    name: `Getting ${numberOfItems} items with engine.MemberInvocation`,
    filename: 'member-invocation',
    expression,
    cases: [
      ...(options.compileOnly
      ? []
      : [{
        name: `using evaluate()`,
        testFunction: (fhirpath, model) => {
          fhirpath.evaluate(minimumDataset, expression, {}, model);
        }
      }]),
      {
        name: `using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          compiledFn(minimumDataset, {});
        }
      }
    ]
  }];

}
