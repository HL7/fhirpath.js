/**
 * This file contains code to run the performance test suites.
 *
 * To compare performance between the latest published version and the current
 * version use:
 *   `npm run compare-performance`
 *
 * You can also specify a specific version to compare with the current version,
 * for example:
 *   `npm run compare-performance -- 2.14.0`
 *
 * The results will be saved in the folder `./benchmark/results`
 */
const { spawn } = require('child_process');
const myArgs = process.argv.slice(2);
const prevVersion = myArgs.length === 1 ? '@' + myArgs[0] : '@latest';

const benny = require('benny');
const open = require('open');
const current_fhirpath = require('../src/fhirpath');
const current_r4_model = require('../fhir-context/r4');
const minimumDataset = require('./resources/Minimum-Data-Set---version-3.0.R4.json');
const currentVersion = require('../package.json').version;


const child = spawn('npm', ['i','--prefix', './test/benchmark/prev-fhirpath', 'fhirpath' + prevVersion], {
  stdio: 'inherit'
});

child.on('exit', code => {
  if (code === 0) {
    const previous_fhirpath = require('./benchmark/prev-fhirpath/node_modules/fhirpath');
    const previous_r4_model = require('./benchmark/prev-fhirpath/node_modules/fhirpath/fhir-context/r4');
    const previousVersion = require('./benchmark/prev-fhirpath/node_modules/fhirpath/package.json').version;
    // Insert performance test suites here:
    [
      'intersect',
      'member-invocation'
    ].forEach(filename => {
      require('./benchmark/'+ filename)({
        benny,
        open,
        previous_fhirpath,
        previous_r4_model,
        current_fhirpath,
        current_r4_model,
        minimumDataset,
        currentVersion,
        previousVersion
      })
    })
  }
});
