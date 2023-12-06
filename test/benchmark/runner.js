/**
 * This file contains child process code for running benchmark suites called
 * from ../benchmark.js.
 */
const current_fhirpath = require('../../src/fhirpath');
const minimumDataset = require('../resources/Minimum-Data-Set---version-3.0.R4.json');
const current_r4_model = require('../../fhir-context/r4');
const _ = require('lodash');
const benny = require('benny');
const open = require('open');
const currentVersion = 'current';
const previous_fhirpath = require('./prev-fhirpath/node_modules/fhirpath');
const previous_r4_model = require('./prev-fhirpath/node_modules/fhirpath/fhir-context/r4');
const previousVersion = require('./prev-fhirpath/node_modules/fhirpath/package.json').version;

// Prepare input data using both versions of fhirpath.js to warm up both versions and reduce impact on benchmarks.
const bigItems = current_fhirpath.evaluate(minimumDataset,'repeat(item)', {},  current_r4_model).slice(0,100);
const bigItemsCopy = previous_fhirpath.evaluate(minimumDataset,'repeat(item)', {},  previous_r4_model).slice(0,100);
const smallItems = current_fhirpath.evaluate(minimumDataset,'repeat(item).repeat(code)', {},  current_r4_model).slice(0,100);
const smallItemsCopy = previous_fhirpath.evaluate(minimumDataset,'repeat(item).repeat(code)', {},  previous_r4_model).slice(0,100);

// A list of result files to open in the browser
const filenamesToOpen = [];

/**
 * Run benchmarks from file.
 * @param {string} filename file name in the benchmark directory.
 * @param {Object} options - command line options. See benchmark.js.
 * @returns Promise<any>
 */
async function run(filename, options) {
  const suites = require('./'+ filename)({
    benny,
    open,
    previous_fhirpath,
    previous_r4_model,
    current_fhirpath,
    current_r4_model,
    minimumDataset,
    currentVersion,
    previousVersion,
    bigItems,
    bigItemsCopy,
    smallItems,
    smallItemsCopy,
    options
  });
  for (const suite of suites) {
    {
      const cases = suite.cases.reduce((arr, item) => {
        arr.push(
          benny.add(
            `${item.name} [${previousVersion}]`,
            item.testFunction.bind(
              this,
              previous_fhirpath,
              previous_r4_model,
              previous_fhirpath.compile(suite.expression, previous_r4_model)
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
              current_fhirpath.compile(suite.expression, current_r4_model)
            )
          )
        );
        return arr;
      }, []);

      await benny.suite(
        suite.name,
        ...cases,
        benny.cycle(),
        benny.complete(),
        benny.configure({
          minDisplayPrecision: 2
        }),
        benny.save({ file: suite.filename, folder: __dirname + '/results', version: currentVersion }),
        benny.save({ file: suite.filename, folder: __dirname + '/results', format: 'chart.html' }),
      );
      filenamesToOpen.push(__dirname + `/results/${suite.filename}.chart.html`)
    }
  }
}

// Retrieves options from the main process and runs benchmarks
process.on('message', async (options) => {
  const filenames = options.tests.split(',');
  for (const filename of filenames) {
    await run(filename, options);
  }
  for (const filename of filenamesToOpen) {
    await open(filename);
  }
  process.exit(0);
});
