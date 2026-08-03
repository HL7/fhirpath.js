const _ = require('lodash');

/**
 * Prepares up to 4 suites for a FHIRPath expression with 1 cases each:
 *  1. big items using evaluate()
 *  2. big items using compile()
 *  3. small items using evaluate()
 *  4. small items using compile()
 * When `desc.options.compileOnly` is set, the evaluate() suites (1 and 3) are
 * skipped and only the compile() suites (2 and 4) are returned.
 * @param {Object} desc - suite description.
 * @param {string} desc.name - display name for the suite.
 * @param {string} desc.filename - output filename.
 * @param {string} desc.expression - FHIRPath expression.
 * @param {Array} desc.bigItems - array of big items to use in expression as
 *  "%items" variable.
 * @param {Array} desc.bigItemsCopy - copy of desc.bigItems in case expression
 *  uses it as "%itemsCopy".
 * @param {Array} desc.smallItems - array of small items to use in expression as
 *  "%items" variable.
 * @param {Array} desc.smallItemsCopy - copy of desc.smallItems in case
 *  expression uses it as "%itemsCopy".
 * @param {Object} desc.options - command line options. See benchmark.js.
 * @param {boolean} desc.options.compileOnly - skip suites that use evaluate().
 * @return an array of objects describing suites with cases for use in benchmark.js.
 */
function createSuitesForExpression(desc) {
  const numberOfBigItems = desc.bigItems.length;
  const options = desc.options;
  const numberOfSmallItems = desc.smallItems.length;
  const skipEvaluate = options.compileOnly;

  const bigItemsEvaluateSuite = {
    name: desc.name,
    filename: desc.filename + '-big-items-evaluate',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfBigItems} big items using evaluate()`,
        testFunction: (fhirpath, model) => {
          const collectionOfBigItems = _.cloneDeep(desc.bigItems);
          const collectionOfBigItemsCopy =  _.cloneDeep(desc.bigItemsCopy);
          return () =>  fhirpath.evaluate({}, desc.expression, {
            items: collectionOfBigItems,
            itemsCopy: collectionOfBigItemsCopy
          }, model);
        }
      }
    ]
  };

  const bigItemsCompileSuite = {
    name: desc.name,
    filename: desc.filename + '-big-items-compile',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfBigItems} big items using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          const collectionOfBigItems = _.cloneDeep(desc.bigItems);
          const collectionOfBigItemsCopy =  _.cloneDeep(desc.bigItemsCopy);
          return () => compiledFn({}, {
            items: collectionOfBigItems,
            itemsCopy: collectionOfBigItemsCopy
          });
        }
      }
    ]
  };

  const smallItemsEvaluateSuite = {
    name: desc.name,
    filename: desc.filename + '-small-items-evaluate',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfSmallItems} small items using evaluate()`,
        testFunction: (fhirpath, model) => {
          const collectionOfSmallItems =  _.cloneDeep(desc.smallItems);
          const collectionOfSmallItemsCopy =  _.cloneDeep(desc.smallItemsCopy);
          return () => fhirpath.evaluate({}, desc.expression, {
            items: collectionOfSmallItems,
            itemsCopy: collectionOfSmallItemsCopy
          }, model);
        }
      }
    ]
  };

  const smallItemsCompileSuite = {
    name: desc.name,
    filename: desc.filename + '-small-items-compile',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfSmallItems} small items using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          const collectionOfSmallItems =  _.cloneDeep(desc.smallItems);
          const collectionOfSmallItemsCopy =  _.cloneDeep(desc.smallItemsCopy);
          return () => compiledFn({}, {
            items: collectionOfSmallItems,
            itemsCopy: collectionOfSmallItemsCopy
          });
        }
      }
    ]
  };

  // `compileOnly` skips only the evaluate() suites, keeping the compile() ones
  // for both big and small items. The original interleaved order is preserved.
  return [
    ...(skipEvaluate ? [] : [bigItemsEvaluateSuite]),
    bigItemsCompileSuite,
    ...(skipEvaluate ? [] : [smallItemsEvaluateSuite]),
    smallItemsCompileSuite
  ];

}

module.exports = {
  createSuitesForExpression: createSuitesForExpression
}
