const _ = require('lodash');
const { maxCollSizeForDeepEqual } = require('../../src/deep-equal');
const { createSuiteForExpression } = require('./common-benchmark-utils');

module.exports = ({
                    bigItems,
                    bigItemsCopy,
                    smallItems,
                    smallItemsCopy,
                    options
                  }) => {
  const expression = '%items.subsetOf(%itemsCopy)';
  const smallCollectionLength = Math.floor(maxCollSizeForDeepEqual/2);

  return [{
    name: 'subsetOf() of all elements for a collection with',
    filename: 'subsetof',
    expression,
    bigItems,
    bigItemsCopy,
    smallItems,
    smallItemsCopy,
    options
  }, {
    name: 'subsetOf() of all elements for a small collection with',
    filename: 'subsetof-for-small-collections',
    expression,
    bigItems: bigItems.slice(-smallCollectionLength),
    bigItemsCopy: bigItemsCopy.slice(-smallCollectionLength),
    smallItems: smallItems.slice(-smallCollectionLength),
    smallItemsCopy: smallItemsCopy.slice(-smallCollectionLength),
    options
  }].map(createSuiteForExpression);

}
