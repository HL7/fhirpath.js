const _ = require('lodash');

module.exports = ({
                    current_fhirpath,
                    current_r4_model,
                    bigItems,
                    smallItems
                  }) => {

  const lastOfBigItemsCopy = _.cloneDeep(bigItems.slice(-1));
  const numberOfBigItems = current_fhirpath.evaluate({}, '%items.count()', { items: bigItems }, current_r4_model)[0];

  const lastOfSmallItemsCopy = _.cloneDeep(smallItems.slice(-1));
  const numberOfSmallItems = current_fhirpath.evaluate({}, '%items.count()', { items: smallItems }, current_r4_model)[0];

  const expression = '%items contains %lastOfItemsCopy';

  return [{
    name: `Checking if a list of items contains some item`,
    filename: 'contains',
    expression,
    cases: [
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
    ]
  }];

}
