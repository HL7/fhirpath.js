const _ = require('lodash');

module.exports = ({
                    benny,
                    open,
                    previous_fhirpath,
                    previous_r4_model,
                    current_fhirpath,
                    current_r4_model,
                    minimumDataset,
                    currentVersion,
                    previousVersion
                  }) => {

  const numberOfItems = current_fhirpath.evaluate(minimumDataset,'Questionnaire.item.count()', {},  current_r4_model);
  const expression = 'Questionnaire.item';

  const cases = [
    {
      name: `using evaluate()`,
      testFunction: (fhirpath, model) => {
        fhirpath.evaluate(minimumDataset, expression, {}, model);
      }
    },
    {
      name: `using compile()`,
      testFunction: (fhirpath, model, compiledFn) => {
        compiledFn(minimumDataset, {});
      }
    }
  ].reduce((arr, item) => {
    arr.push(
      benny.add(
        `${item.name} [${previousVersion}]`,
        item.testFunction.bind(
          this,
          previous_fhirpath,
          previous_r4_model,
          previous_fhirpath.compile(expression, previous_r4_model)
        )
      )
    );
    arr.push(
      benny.add(
        `${item.name} [${currentVersion}]`,
        item.testFunction.bind(
          this,
          current_fhirpath,
          current_r4_model,
          current_fhirpath.compile(expression, current_r4_model)
        )
      )
    );
    return arr;
  }, []);

  benny.suite(
    `Getting ${numberOfItems} items with engine.MemberInvocation`,
    ...cases,
    benny.cycle(),
    benny.complete(),
    benny.configure({
      minDisplayPrecision: 2
    }),
    benny.save({ file: 'member-invocation', folder: __dirname + '/results', version: currentVersion }),
    benny.save({ file: 'member-invocation', folder: __dirname + '/results', format: 'chart.html' }),
  ).then(() => {
    open(__dirname + '/results/member-invocation.chart.html');
  });
}
