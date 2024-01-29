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
  const expression = '%items.intersect(%itemsCopy)';

  return [{
    name: 'intersect() of two collections with',
    filename: 'intersect',
    expression,
    bigItems,
    bigItemsCopy,
    smallItems,
    smallItemsCopy,
    options
  }, {
    name: 'intersect() of two small collections with',
    filename: 'intersect-for-small-collections',
    expression,
    bigItems: bigItems.slice(-smallCollectionLength),
    bigItemsCopy: bigItemsCopy.slice(-smallCollectionLength),
    smallItems: smallItems.slice(-smallCollectionLength),
    smallItemsCopy: smallItemsCopy.slice(-smallCollectionLength),
    options
  }].map(createSuiteForExpression);

}
