/**
 * Prepares 4 suites for a FHIRPath expression with 1 cases each:
 *  1. big items using evaluate()
 *  2. big items using compile()
 *  3. small items using evaluate()
 *  4. small items using compile()
 * @param {Object} desc - suite description.
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
 * @param {Object} desc.options.compileOnly - skip test suites that uses evaluate().
 * @return an array of objects describing suites with cases for use in benchmark.js.
 */
function createSuitesForExpression(desc) {
  const collectionOfBigItems = desc.bigItems;
  const collectionOfBigItemsCopy = desc.bigItemsCopy;
  const numberOfBigItems = collectionOfBigItems.length;
  const options = desc.options;

  const collectionOfSmallItems = desc.smallItems;
  const collectionOfSmallItemsCopy = desc.smallItemsCopy;
  const numberOfSmallItems = collectionOfSmallItems.length;

  return [...(options.compileOnly ? [] : [{
    name: desc.name,
    filename: desc.filename + '-big-items-evaluate',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfBigItems} big items using evaluate()`,
        testFunction: (fhirpath, model) => {
          fhirpath.evaluate({}, desc.expression, {
            items: collectionOfBigItems,
            itemsCopy: collectionOfBigItemsCopy
          }, model);
        }
      }
    ]
  },{
    name: desc.name,
    filename: desc.filename + '-big-items-evaluate',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfBigItems} big items using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          compiledFn({}, { items: collectionOfBigItems, itemsCopy: collectionOfBigItemsCopy });
        }
      }
    ]
  }]),{
    name: desc.name,
    filename: desc.filename + '-small-items-evaluate',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfSmallItems} small items using evaluate()`,
        testFunction: (fhirpath, model) => {
          fhirpath.evaluate({}, desc.expression, { items: collectionOfSmallItems, itemsCopy: collectionOfSmallItemsCopy }, model);
        }
      }
    ]
  },{
    name: desc.name,
    filename: desc.filename + '-small-items-compile',
    expression: desc.expression,
    cases: [
      {
        name: `${numberOfSmallItems} small items using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          compiledFn({}, { items: collectionOfSmallItems, itemsCopy: collectionOfSmallItemsCopy });
        }
      }
    ]
  }];

}

module.exports = {
  createSuitesForExpression: createSuitesForExpression
}
