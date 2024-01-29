const { maxCollSizeForDeepEqual } = require('../../src/deep-equal');
const { createSuiteForExpression } = require('./common-benchmark-utils');

module.exports = ({
                    bigItems,
                    smallItems,
                    options
                  }) => {
  const expression = '%items.distinct()';

  return [{
    name: 'distinct() of a collection with',
    filename: 'distinct',
    expression,
    bigItems,
    smallItems,
    options
  }, {
    name: 'distinct() of a small collection with',
    filename: 'distinct-for-small-collections',
    expression,
    bigItems: bigItems.slice(-maxCollSizeForDeepEqual),
    smallItems: smallItems.slice(-maxCollSizeForDeepEqual),
    options
  }].map(createSuiteForExpression);

}
