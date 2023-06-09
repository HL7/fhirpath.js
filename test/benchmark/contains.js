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

  const bigItems = current_fhirpath.evaluate(minimumDataset,'repeat(item)', {},  current_r4_model);
  const lastOfBigItemsCopy = _.cloneDeep(bigItems.slice(-1));
  const numberOfBigItems = current_fhirpath.evaluate({}, '%items.count()', { items: bigItems }, current_r4_model)[0];

  const smallItems = current_fhirpath.evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model);
  const lastOfSmallItemsCopy = _.cloneDeep(smallItems.slice(-1));
  const numberOfSmallItems = current_fhirpath.evaluate({}, '%items.count()', { items: smallItems }, current_r4_model)[0];

  const expression = '%items contains %lastOfItemsCopy';

  const cases = [
    {
      name: `${numberOfBigItems} big items using evaluate()`,
      testFunction: (fhirpath, model) => {
        fhirpath.evaluate({}, expression, { items: bigItems, lastOfItemsCopy: lastOfBigItemsCopy }, model);
      }
    },
    {
      name: `${numberOfBigItems} big items using compile()`,
      testFunction: (fhirpath, model, compiledFn) => {
        compiledFn({}, { items: bigItems, lastOfItemsCopy: lastOfBigItemsCopy });
      }
    },
    {
      name: `${numberOfSmallItems} small items using evaluate()`,
      testFunction: (fhirpath, model) => {
        fhirpath.evaluate({}, expression, { items: smallItems, lastOfItemsCopy: lastOfSmallItemsCopy }, model);
      }
    },
    {
      name: `${numberOfSmallItems} small items using compile()`,
      testFunction: (fhirpath, model, compiledFn) => {
        compiledFn({}, { items: smallItems, lastOfItemsCopy: lastOfSmallItemsCopy });
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
    'Checking if a list of items contains some item',
    ...cases,
    benny.cycle(),
    benny.complete(),
    benny.configure({
      minDisplayPrecision: 2
    }),
    benny.save({ file: 'contains', folder: __dirname + '/results', version: currentVersion }),
    benny.save({ file: 'contains', folder: __dirname + '/results', format: 'chart.html' }),
  ).then(() => {
    open(__dirname + '/results/contains.chart.html');
  });
}
