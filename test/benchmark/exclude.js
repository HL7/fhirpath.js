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
  const smallCollectionLength = Math.floor(maxCollSizeForDeepEqual/2);
  const expression = '%items.exclude(%itemsCopy)';

  return [{
    name: 'exclude() all elements from a collection with',
    filename: 'exclude',
    expression,
    bigItems,
    bigItemsCopy,
    smallItems,
    smallItemsCopy,
    options
  }, {
    name: 'exclude() all elements from a small collection with',
    filename: 'exclude-for-small-collections',
    expression,
    bigItems: bigItems.slice(-smallCollectionLength),
    bigItemsCopy: bigItemsCopy.slice(-smallCollectionLength),
    smallItems: smallItems.slice(-smallCollectionLength),
    smallItemsCopy: smallItemsCopy.slice(-smallCollectionLength),
    options
  }].map(createSuiteForExpression);

}
