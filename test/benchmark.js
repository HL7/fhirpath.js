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

const child = spawn('npm', ['i','--prefix', './test/benchmark/prev-fhirpath', 'fhirpath' + prevVersion], {
  stdio: 'inherit'
});

child.on('exit', code => {
  if (code === 0) {
    // Insert performance test suites here:
    require('./benchmark/intersect');
  }
});
