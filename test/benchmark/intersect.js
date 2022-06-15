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
  const bigItemsCopy = _.cloneDeep(bigItems);
  const numberOfBigItems = current_fhirpath.evaluate({}, '%items.count()', { items: bigItems }, current_r4_model)[0];

  const smallItems = current_fhirpath.evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model);
  const smallItemsCopy = _.cloneDeep(smallItems);
  const numberOfSmallItems = current_fhirpath.evaluate({}, '%items.count()', { items: smallItems }, current_r4_model)[0];

  const expression = '%items.intersect(%itemsCopy)';

  const cases = [
    {
      name: `${numberOfBigItems} big items using evaluate()`,
      testFunction: (fhirpath, model) => {
        fhirpath.evaluate({}, expression, { items: bigItems, itemsCopy: bigItemsCopy }, model);
      }
    },
    {
      name: `${numberOfBigItems} big items using compile()`,
      testFunction: (fhirpath, model, compiledFn) => {
        compiledFn({}, { items: bigItems, itemsCopy: bigItemsCopy });
      }
    },
    {
      name: `${numberOfSmallItems} small items using evaluate()`,
      testFunction: (fhirpath, model) => {
        fhirpath.evaluate({}, expression, { items: smallItems, itemsCopy: smallItemsCopy }, model);
      }
    },
    {
      name: `${numberOfSmallItems} small items using compile()`,
      testFunction: (fhirpath, model, compiledFn) => {
        compiledFn({}, { items: smallItems, itemsCopy: smallItemsCopy });
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
    'intersect() of two collections with',
    ...cases,
    benny.cycle(),
    benny.complete(),
    benny.configure({
      minDisplayPrecision: 2
    }),
    benny.save({ file: 'intersect', folder: __dirname + '/results', version: currentVersion }),
    benny.save({ file: 'intersect', folder: __dirname + '/results', format: 'chart.html' }),
  ).then(() => {
    open(__dirname + '/results/intersect.chart.html');
  });
}
