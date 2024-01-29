/**
 * This file contains code to run the performance test suites.
 *
 * To compare performance between the latest published version and the current
 * version use:
 *   `npm run compare-performance`
 *
 * You can also specify a specific version to compare with the current version,
 * for example:
 *   `npm run compare-performance -- -v 2.14.0`
 *
 * To see all available options:
 * npm run compare-performance -- -h
 *
 * The results will be saved in the folder `./benchmark/results`
 */
const { spawn, fork } = require('child_process');

// Insert performance test suites here:
const availableTests = [
  'intersect',
  'member-invocation',
  'union',
  'exclude',
  'subsetof',
  'distinct',
  'contains'
];

const options = require('commander');
options.description('Compare performance between the latest published version and the current version.');
options.option('-v, --prevVersion <version>', 'use a specific version instead of latest published version.', 'latest');
options.option('-t, --tests <list>', `list of comma-separated tests (e.g. "${availableTests.join(',')}")`, availableTests.join(','));
options.option('-c, --compileOnly', 'skip tests for evaluate().', 'latest');
options.parse(process.argv);

const npmInstallProcess = spawn('npm', ['i', '--prefix', './test/benchmark/prev-fhirpath', 'fhirpath@' + options.prevVersion], {
  stdio: 'inherit'
});

// Process for running benchmarks. We need a separate process to run the tests
// to free the main process from synchronous code to listen for the SIGINT event.
let benchmarkingProcess;

process.on('SIGINT', () => {
  // Kill the benchmarking process
  if (benchmarkingProcess) {
    benchmarkingProcess.kill('SIGKILL');
    // Displays the bash prompt on a new line.
    console.log('');
  }

  // The value of the SIGINT signal code is 2 (See https://man7.org/linux/man-pages/man7/signal.7.html).
  // If Node.js receives a fatal signal such as SIGKILL or SIGHUP, then its exit
  // code will be 128 plus the value of the signal code:
  // 128 + 2 = 130 (see https://nodejs.org/api/process.html#exit-codes)
  process.exit(130);
});

npmInstallProcess.on('exit', code => {
  if (code === 0) {
    benchmarkingProcess = fork(__dirname + '/benchmark/runner.js', { stdio: 'inherit'});
    // Pass options to the benchmarking process to run benchmarks
    benchmarkingProcess.send(options);
  }
});
