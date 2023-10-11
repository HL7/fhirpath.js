const _ = require('lodash');
const { maxCollSizeForDeepEqual } = require('../../src/deep-equal');

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

  const smallCollectionLength = Math.floor(maxCollSizeForDeepEqual/2);
  [{
    name: 'exclude() all elements from a collection with',
    filename: 'exclude',
    bigItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item)', {},  current_r4_model),
    smallItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model)
  }, {
    name: 'exclude() all elements from a small collection with',
    filename: 'exclude-for-small-collections',
    bigItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item)', {},  current_r4_model)
      .slice(-smallCollectionLength),
    smallItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model)
      .slice(-smallCollectionLength)
  }].forEach(suite => {
    const bigItems = suite.bigItems;
    const bigItemsCopy = _.cloneDeep(bigItems);
    const numberOfBigItems = bigItems.length;

    const smallItems = suite.smallItems;
    const smallItemsCopy = _.cloneDeep(smallItems);
    const numberOfSmallItems = smallItems.length;

    const expression = '%items.exclude(%itemsCopy)';

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
      suite.name,
      ...cases,
      benny.cycle(),
      benny.complete(),
      benny.configure({
        minDisplayPrecision: 2
      }),
      benny.save({ file: suite.filename, folder: __dirname + '/results', version: currentVersion }),
      benny.save({ file: suite.filename, folder: __dirname + '/results', format: 'chart.html' }),
    ).then(() => {
      open(__dirname + `/results/${suite.filename}.chart.html`);
    });

  });

}
