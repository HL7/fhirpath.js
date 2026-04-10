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
const { spawn, fork } = require('child_process');
const npmCacheDir = path.join(__dirname, 'benchmark/.npm-cache');

// Insert performance test suites here:
const availableTests = [
  'addition',
  'gln-validation-expression',
  'comparison',
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
    .default('native'))
  .parse(process.argv);

const options = program.opts();

// Process for running benchmarks. We need a separate process to run the tests
// to free the main process from synchronous code to listen for the SIGINT event.
let benchmarkingProcess;
let activeProcess;


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
 * Installs the baseline package into test/benchmark/prev-fhirpath.
 * The baseline can come from npm (--prevVersion) or from a local git ref
 * (--prevRef).
 * @param {Object} opts - parsed options from commander.
 * @returns {Promise<void>}
 */
async function installBaseline(opts) {
  if (!opts.prevRef) {
    await runCommand('npm', ['i', '--prefix', './test/benchmark/prev-fhirpath',
      'fhirpath@' + opts.prevVersion]);
    return;
  }

  const prevSrcPath = path.join(__dirname, 'benchmark/prev-src');
  try {
    await runCommand('git', ['worktree', 'remove', '--force', prevSrcPath], {
      stdio: 'ignore'
    });
  } catch {
    // Ignore: worktree may not exist yet.
  }

  await runCommand('git', ['worktree', 'add', '--detach', '--force', prevSrcPath,
    opts.prevRef]);
  await runCommand('npm', ['pack', '--silent'], {
    cwd: prevSrcPath
  });
  const tarballName = fs.readdirSync(prevSrcPath)
    .filter(name => name.endsWith('.tgz'))
    .map(name => ({
      name,
      mtime: fs.statSync(path.join(prevSrcPath, name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime)[0]?.name;
  if (!tarballName) {
    throw new Error('Could not locate npm pack tarball in ' + prevSrcPath);
  }
  const tarballPath = path.join(prevSrcPath, tarballName);
  await runCommand('npm', ['i', '--prefix', './test/benchmark/prev-fhirpath',
    tarballPath]);
}


/**
 * Starts the benchmark runner process.
 */
function startBenchmarkRunner() {
  benchmarkingProcess = fork(__dirname + '/benchmark/runner.js', {
    stdio: 'inherit'
  });
  // Pass options to the benchmarking process to run benchmarks
  benchmarkingProcess.send(options);
}


process.on('SIGINT', () => {
  // Kill the benchmarking process
  if (activeProcess) {
    activeProcess.kill('SIGKILL');
  }
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


installBaseline(options)
  .then(startBenchmarkRunner)
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
