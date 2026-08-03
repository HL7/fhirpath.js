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
 * To compare with a local pre-change commit, use:
 *   `npm run compare-performance -- -r <git-ref>`
 *
 * To see all available options:
 * npm run compare-performance -- -h
 *
 * The benchmark report will be saved as:
 *   `./test/benchmark/results/compare-performance-report.html`
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync, fork } = require('child_process');

let benchmarkRunDir = null;
let npmCacheDir = null;
let previousPackageDir = null;
let previousSourceDir = null;

// Insert performance test suites here:
const availableTests = [
  'addition',
  'gln-validation-expression',
  'comparison',
  'equivalence',
  'contains',
  'descendants',
  'distinct',
  'exclude',
  'fhir-quantity-context',
  'intersect',
  'member-invocation',
  'part-of-resource',
  'subsetof',
  'union'
];


const { Command, Option, InvalidArgumentError } = require('commander');
const program = new Command();

program
  .description('Compare performance between the latest published version ' +
    'and the current version.')
  .addOption(new Option(
    '-v, --prevVersion <version>',
    'use a specific version instead of latest published version'
    )
    .default('latest'))
  .addOption(new Option(
    '-r, --prevRef <gitRef>',
    'use a local git ref as the baseline instead of an npm version'
    ))
  .addOption(new Option('-t, --tests <list>', `list of comma-separated tests`)
    .argParser(
      (value) => {
        const tests = value.split(',').map(s => s.trim());
        const invalidTests =
          tests.filter(test => !availableTests.includes(test));
        if (invalidTests.length > 0) {
          throw new InvalidArgumentError('\nUnexpected tests: ' +
            invalidTests.join(',') + '.\nAvailable tests are: ' +
            availableTests.join(',') + '.');
        }
        return tests;
      })
    .default(availableTests, `"${availableTests.join(',')}"`))
  .addOption(new Option('-c, --compileOnly', 'skip tests for evaluate()'))
  .addOption(new Option('-M, --minTolerance <percent>',
    'minimum tolerance percentage for confidence interval comparisons ' +
    '(used to colorize results in the report). ' +
    'Setting it too low may lead to false positives ' +
    'in speed trend detection, ' +
    'while setting it too high may mask real performance changes. ' +
    'Adjust as needed based on the typical variability observed in benchmarks.')
    .argParser((value) => {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 50) {
        throw new InvalidArgumentError(
          'minTolerance must be an integer between 0 and 50.'
        );
      }
      return parsed;
    })
    .default(5))
  .addOption(new Option(`-o, --mathMode <mode>`,
    'mathematical operations mode')
    .choices(['native', 'precise'])
    .default('native'));

// Process for running benchmarks. We need a separate process to run the tests
// to free the main process from synchronous code to listen for the SIGINT event.
let benchmarkingProcess;
let activeProcess;


/**
 * Parses command-line arguments and returns benchmark options.
 * @returns {Object}
 */
function parseOptions() {
  program.parse(process.argv);
  return program.opts();
}


/**
 * Creates temporary directories for this benchmark run.
 */
function setupBenchmarkRunDirs() {
  benchmarkRunDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'fhirpath-benchmark-')
  );
  npmCacheDir = path.join(benchmarkRunDir, '.npm-cache');
  previousPackageDir = path.join(benchmarkRunDir, 'prev-fhirpath');
  previousSourceDir = path.join(benchmarkRunDir, 'prev-src');
}


/**
 * Runs a command and returns a promise.
 * @param {string} command - command to execute.
 * @param {string[]} args - command arguments.
 * @param {Object} [options] - spawn options.
 * @param {string} [options.cwd] - working directory.
 * @param {*} [options.stdio='inherit'] - stdio mode.
 * @param {boolean} [options.captureStdout=false] - whether to capture stdout.
 * @returns {Promise<string|undefined>}
 */
function runCommand(command, args, options = {}) {
  const stdio = options.captureStdout ? ['ignore', 'pipe', 'inherit'] :
    (options.stdio || 'inherit');
  const env = command === 'npm' ?
    {...process.env, NPM_CONFIG_CACHE: npmCacheDir} : process.env;
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd: options.cwd, stdio, env});
    activeProcess = child;
    let stdout = '';
    if (options.captureStdout) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
    }
    child.on('error', (error) => {
      if (activeProcess === child) {
        activeProcess = null;
      }
      reject(error);
    });
    child.on('exit', (code) => {
      if (activeProcess === child) {
        activeProcess = null;
      }
      if (code === 0) {
        resolve(options.captureStdout ? stdout : undefined);
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
  });
}


/**
 * Installs the baseline package in a temporary directory.
 * The baseline can come from npm (--prevVersion) or from a local git ref
 * (--prevRef).
 * @param {Object} opts - parsed options from commander.
 * @returns {Promise<void>}
 */
async function installBaseline(opts) {
  if (!opts.prevRef) {
    await runCommand('npm', ['i', '--prefix', previousPackageDir,
      'fhirpath@' + opts.prevVersion]);
    return;
  }

  await runCommand('git', ['worktree', 'add', '--detach', '--force',
    previousSourceDir, opts.prevRef]);
  await runCommand('npm', ['pack', '--silent'], {
    cwd: previousSourceDir
  });
  const tarballName = fs.readdirSync(previousSourceDir)
    .filter(name => name.endsWith('.tgz'))
    .map(name => ({
      name,
      mtime: fs.statSync(path.join(previousSourceDir, name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime)[0]?.name;
  if (!tarballName) {
    throw new Error(
      'Could not locate npm pack tarball in ' + previousSourceDir
    );
  }
  const tarballPath = path.join(previousSourceDir, tarballName);
  await runCommand('npm', ['i', '--prefix', previousPackageDir,
    tarballPath]);
}


/**
 * Removes temporary benchmark artifacts.
 */
function cleanupBenchmarkArtifacts() {
  if (!benchmarkRunDir) {
    return;
  }

  spawnSync('git', ['worktree', 'remove', '--force', previousSourceDir], {
    stdio: 'ignore'
  });
  fs.rmSync(benchmarkRunDir, { recursive: true, force: true });
  benchmarkRunDir = null;
  npmCacheDir = null;
  previousPackageDir = null;
  previousSourceDir = null;
}


/**
 * Starts the benchmark runner process.
 * @param {Object} options - parsed options from commander.
 * @returns {Promise<void>}
 */
function startBenchmarkRunner(options) {
  return new Promise((resolve, reject) => {
    benchmarkingProcess = fork(__dirname + '/benchmark/runner.js', {
      stdio: 'inherit',
      env: {
        ...process.env,
        FHIRPATH_BENCHMARK_PREV_DIR: previousPackageDir
      }
    });
    benchmarkingProcess.once('error', (error) => {
      if (benchmarkingProcess) {
        benchmarkingProcess = null;
      }
      reject(error);
    });
    benchmarkingProcess.once('exit', (code, signal) => {
      if (benchmarkingProcess) {
        benchmarkingProcess = null;
      }
      if (signal) {
        reject(new Error('Benchmark runner failed with signal ' + signal));
        return;
      }
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error('Benchmark runner failed with code ' + code));
    });
    // Pass options to the benchmarking process to run benchmarks
    benchmarkingProcess.send(options);
  });
}


async function main() {
  const options = parseOptions();
  let interrupted = false;

  const handleSigint = () => {
    interrupted = true;

    if (activeProcess) {
      activeProcess.kill('SIGKILL');
    }
    if (benchmarkingProcess) {
      benchmarkingProcess.kill('SIGKILL');
      // Displays the bash prompt on a new line.
      console.log('');
    }
  };

  try {
    setupBenchmarkRunDirs();
    process.once('SIGINT', handleSigint);
    await installBaseline(options);
    await startBenchmarkRunner(options);
    process.exitCode = 0;
  } catch (error) {
    if (!interrupted) {
      console.error(error.message || error);
    }
    // The value of the SIGINT signal code is 2
    // (See https://man7.org/linux/man-pages/man7/signal.7.html).
    // If Node.js receives a fatal signal such as SIGKILL or SIGHUP, then its
    // exit code will be 128 plus the value of the signal code:
    // 128 + 2 = 130 (see https://nodejs.org/api/process.html#exit-codes)
    process.exitCode = interrupted ? 130 : 1;
  } finally {
    process.removeListener('SIGINT', handleSigint);
    cleanupBenchmarkArtifacts();
  }
}


main();
