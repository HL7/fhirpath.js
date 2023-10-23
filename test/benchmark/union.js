const _ = require('lodash');
const { maxCollSizeForDeepEqual } = require('../../src/deep-equal');
const { createSuiteForExpression } = require('./common-benchmark-utils');

module.exports = ({
                    bigItems,
                    bigItemsCopy,
                    smallItems,
                    smallItemsCopy
                  }) => {
  const expression = '%items.union(%itemsCopy)';
  const smallCollectionLength = Math.floor(maxCollSizeForDeepEqual/2);

  return [{
    name: 'union() of two collections with',
    filename: 'union',
    expression,
    bigItems,
    bigItemsCopy,
    smallItems,
    smallItemsCopy
  }, {
    name: 'union() of two small collections with',
    filename: 'union-for-small-collections',
    expression,
    bigItems: bigItems.slice(-smallCollectionLength),
    bigItemsCopy: bigItemsCopy.slice(-smallCollectionLength),
    smallItems: smallItems.slice(-smallCollectionLength),
    smallItemsCopy: smallItemsCopy.slice(-smallCollectionLength)
  }].map(createSuiteForExpression);

}
