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
  [{
    name: 'distinct() of a collection with',
    filename: 'distinct',
    bigItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item)', {},  current_r4_model),
    smallItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model)
  }, {
    name: 'distinct() of a small collection with',
    filename: 'distinct-for-small-collections',
    bigItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item)', {},  current_r4_model)
      .slice(-maxCollSizeForDeepEqual),
    smallItems: current_fhirpath
      .evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model)
      .slice(-maxCollSizeForDeepEqual)
  }].forEach(suite => {
    const bigItems = suite.bigItems;
    const numberOfBigItems = bigItems.length;

    const smallItems = suite.smallItems;
    const numberOfSmallItems = smallItems.length;

    const expression = '%items.distinct()';

    const cases = [
      {
        name: `${numberOfBigItems} big items using evaluate()`,
        testFunction: (fhirpath, model) => {
          fhirpath.evaluate({}, expression, { items: bigItems }, model);
        }
      },
      {
        name: `${numberOfBigItems} big items using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          compiledFn({}, { items: bigItems });
        }
      },
      {
        name: `${numberOfSmallItems} small items using evaluate()`,
        testFunction: (fhirpath, model) => {
          fhirpath.evaluate({}, expression, { items: smallItems }, model);
        }
      },
      {
        name: `${numberOfSmallItems} small items using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          compiledFn({}, { items: smallItems });
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
  })

}
