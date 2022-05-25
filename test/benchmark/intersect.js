const b = require('benny');
const open = require('open');

const previous_fhirpath = require('./prev-fhirpath/node_modules/fhirpath');
const previous_r4_model = require('./prev-fhirpath/node_modules/fhirpath/fhir-context/r4');
const current_fhirpath = require('../../src/fhirpath');
const current_r4_model = require('../../fhir-context/r4');
const _ = require('lodash');

const minimumDataset = require('../resources/Minimum-Data-Set---version-3.0.R4.json');

const bigItems = current_fhirpath.evaluate(minimumDataset,'repeat(item)', {},  current_r4_model);
const bigItemsCopy = _.cloneDeep(bigItems);
const numberOfBigItems = current_fhirpath.evaluate({}, '%items.count()', { items: bigItems }, current_r4_model)[0];

const smallItems = current_fhirpath.evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model);
const smallItemsCopy = _.cloneDeep(smallItems);
const numberOfSmallItems = current_fhirpath.evaluate({}, '%items.count()', { items: smallItems }, current_r4_model)[0];

const previousVersion = require('./prev-fhirpath/node_modules/fhirpath/package.json').version;
const currentVersion = require('../../package.json').version;

const expression = '%items.intersect(%itemsCopy)';

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
    b.add(
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
    b.add(
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

b.suite(
  'intersect() of two collections with',
  ...cases,
  b.cycle(),
  b.complete(),
  b.configure({
    minDisplayPrecision: 2
  }),
  b.save({ file: 'intersect', folder: __dirname + '/results', version: currentVersion }),
  b.save({ file: 'intersect', folder: __dirname + '/results', format: 'chart.html' }),
).then(() => {
  open(__dirname + '/results/intersect.chart.html');
});
