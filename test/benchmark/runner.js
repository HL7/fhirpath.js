/**
 * This file contains child process code for running benchmark suites called
 * from "../benchmark.js".
 */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const current_fhirpath = require('../../src/fhirpath');
const packageInfo = require('../../package.json');
const minimumDataset = require('../resources/r4/Minimum-Data-Set---version-3.0.R4.json');
const patientExample = require('../resources/r4/patient-example.json');
const current_r4_model = require('../../fhir-context/r4');
const open = require('open');
const currentVersion = packageInfo.version;
const previous_fhirpath = require('./prev-fhirpath/node_modules/fhirpath');
const previous_r4_model = require('./prev-fhirpath/node_modules/fhirpath/fhir-context/r4');
const previousVersion = require('./prev-fhirpath/node_modules/fhirpath/package.json').version;
const { withCodSpeed } = require('@codspeed/tinybench-plugin');
const resultsDir = path.join(__dirname, 'results');
const outputReportFilename = 'compare-performance-report.html';
const outputReportPath = path.join(resultsDir, outputReportFilename);


/**
 * ANSI color codes for terminal output
 * @type {{reset: string, red: string, yellow: string, green: string}}
 */
const ansiColors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m'
};


/**
 * Default Tinybench options. These can be adjusted if needed, but they provide
 * a good balance between accuracy and execution time for our benchmark suites.
 */
const tinybenchDefaults = {
  warmupIterations: 400,
  warmupTime: 2000,
  iterations: 1000,
  time: 5000,
  timestampProvider: 'auto'
};


// Prepare input data using both versions of fhirpath.js to warm up both
// versions and reduce impact on benchmarks.
const bigItems = _.cloneDeep(current_fhirpath.evaluate(
  _.cloneDeep(minimumDataset),'repeat(item)', {},  current_r4_model)
  .slice(0,100));
const bigItemsCopy = _.cloneDeep(previous_fhirpath.evaluate(
  _.cloneDeep(minimumDataset),'repeat(item)', {},  previous_r4_model)
  .slice(0,100));
const smallItems = _.cloneDeep(current_fhirpath.evaluate(
  _.cloneDeep(minimumDataset),'repeat(item).repeat(code)', {},
  current_r4_model)
  .slice(0,100));
const smallItemsCopy = _.cloneDeep(previous_fhirpath.evaluate(
  _.cloneDeep(minimumDataset),'repeat(item).repeat(code)', {},
  previous_r4_model)
  .slice(0,100));


/**
 * Checks whether a value is Promise-like.
 * @param {*} value
 * @returns {boolean}
 */
function isPromiseLike(value) {
  return value && typeof value.then === 'function';
}


/**
 * Checks whether Tinybench returned a result state with statistics.
 * @param {Object} taskResult
 * @returns {boolean}
 */
function hasStatistics(taskResult) {
  return taskResult && ['completed', 'aborted-with-statistics'].includes(taskResult.state);
}


/**
 * Builds a task name with benchmark version suffix.
 * @param {string} testCaseName
 * @param {string} version
 * @param {string} side - one of "prev" or "current".
 * @returns {string}
 */
function prepareTaskName(testCaseName, version, side) {
  const sideLabel = side ? `${side}:` : '';
  if (!testCaseName) {
    return `[${sideLabel}${version}]`;
  }
  return `${testCaseName} [${sideLabel}${version}]`;
}


/**
 * Keeps the same interpretation used by benny:
 * - if the case factory returns a function, benchmark that returned function
 * - if the returned function is async, benchmark awaiting it
 * - otherwise benchmark the factory itself
 * @param {function(): any} testCaseFactory
 * @returns {Promise<function(): any>}
 */
async function prepareBenchmarkTaskFn(testCaseFactory) {
  const firstResult = testCaseFactory();

  if (typeof firstResult === 'function') {
    const nestedResult = firstResult();
    if (isPromiseLike(nestedResult)) {
      return async () => {
        await firstResult();
      };
    }
    return firstResult;
  }

  if (isPromiseLike(firstResult)) {
    const resolved = await firstResult;
    if (typeof resolved === 'function') {
      const nestedResult = resolved();
      if (isPromiseLike(nestedResult)) {
        return async () => {
          await resolved();
        };
      }
      return resolved;
    }
    return async () => {
      await testCaseFactory();
    };
  }

  return testCaseFactory;
}


/**
 * Validates and normalizes Tinybench task metrics.
 * @param {Object} task
 * @returns {{throughputMean:number, throughputRme:number, latencyMeanNs:number, samples:number}}
 */
function getTaskMetrics(task) {
  const taskName = task && task.name ? task.name : '<unknown>';
  if (!task || !task.result) {
    throw new Error('Missing benchmark result for task "' + taskName + '".');
  }

  if (!hasStatistics(task.result)) {
    throw new Error(
      'Task "' + taskName + '" has no completed benchmark statistics (state: ' +
      String(task.result.state) + ').'
    );
  }

  const throughput = task.result.throughput;
  const latency = task.result.latency;
  const hasValidMetrics = throughput && latency &&
    Number.isFinite(throughput.mean) &&
    Number.isFinite(throughput.rme) &&
    Number.isFinite(latency.mean) &&
    Number.isFinite(latency.samplesCount);

  if (!hasValidMetrics) {
    throw new Error('Task "' + taskName + '" returned non-standard benchmark metrics.');
  }

  return {
    throughputMean: throughput.mean,
    throughputRme: throughput.rme,
    latencyMeanNs: latency.mean * 1e6,
    samples: latency.samplesCount
  };
}


/**
 * Formats expression for inclusion in report output.
 * @param {string|Object} expression
 * @returns {string}
 */
function formatExpression(expression) {
  return typeof expression === 'string'
    ? expression
    : JSON.stringify(expression);
}


/**
 * Escapes special HTML characters.
 * @param {*} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/**
 * Formats ops/sec value for display.
 * @param {number} value
 * @returns {string}
 */
function formatOps(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}


/**
 * Formats percentage values for display.
 * @param {number|null|undefined} value
 * @returns {string}
 */
function formatPercent(value) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  return value.toFixed(2) + '%';
}


/**
 * Formats the speedup ratio.
 * @param {number|null} value
 * @returns {string}
 */
function formatSpeedup(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 'n/a';
  }
  return value.toFixed(2) + 'x';
}


/**
 * Builds a confidence interval from mean throughput and relative margin of
 * error.
 * @param {number} throughputMean - mean throughput in ops/s
 * @param {number|null} throughputRme - relative margin of error in percentage
 *  (e.g. 5 for 5%)
 * @param {number} minTolerancePercent - minimum tolerance percentage
 * @returns {{lower:number, upper:number}|null}
 */
function getConfidenceInterval(throughputMean, throughputRme,
                               minTolerancePercent) {
  if (!Number.isFinite(throughputMean)) {
    return null;
  }
  const relativeMoE = Number.isFinite(throughputRme) ? throughputRme / 100 : 0;
  const tolerance = Math.max(minTolerancePercent / 100, relativeMoE);
  return {
    lower: throughputMean * (1 - tolerance),
    upper: throughputMean * (1 + tolerance)
  };
}


/**
 * Determines whether two confidence intervals overlap.
 * @param {{lower:number, upper:number}|null} intervalA - first confidence
 *  interval.
 * @param {{lower:number, upper:number}|null} intervalB - second confidence
 *  interval.
 * @returns {boolean}
 */
function doConfidenceIntervalsOverlap(intervalA, intervalB) {
  if (!intervalA || !intervalB) {
    return true;
  }
  return intervalA.lower <= intervalB.upper &&
    intervalB.lower <= intervalA.upper;
}


/**
 * Calculates trend based on confidence interval overlap.
 * @param {{lower:number, upper:number}|null} previousConfidenceInterval -
 *  previous confidence interval
 * @param {{lower:number, upper:number}|null} currentConfidenceInterval -
 *  current confidence interval
 * @returns {{label:string, color:string|null}} - label and color of the trend.
 */
function getSpeedTrend(previousConfidenceInterval, currentConfidenceInterval) {
  if (!previousConfidenceInterval || !currentConfidenceInterval) {
    return {
      label: 'UNKNOWN',
      color: ansiColors.yellow
    };
  }

  if (doConfidenceIntervalsOverlap(previousConfidenceInterval, currentConfidenceInterval)) {
    return {
      label: 'UNCHANGED',
      color: null
    };
  }

  if (currentConfidenceInterval.lower > previousConfidenceInterval.upper) {
    return {
      label: 'INCREASED',
      color: ansiColors.green
    };
  }

  if (currentConfidenceInterval.upper < previousConfidenceInterval.lower) {
    return {
      label: 'DECREASED',
      color: ansiColors.red
    };
  }

  return {
    label: 'UNKNOWN',
    color: ansiColors.yellow
  };
}


/**
 * Wraps text with ANSI color codes.
 * @param {string} text - text to colorize
 * @param {string|null|undefined} color - ANSI color code to apply
 * @returns {string}
 */
function colorize(text, color) {
  if (!color) {
    return text;
  }
  return color + text + ansiColors.reset;
}


/**
 * Maps speed trend to an HTML class name.
 * @param {{label:string, color:string}} speedTrend - speed trend object
 * @returns {string}
 */
function getCaseTrendClassName(speedTrend) {
  if (speedTrend.label === 'INCREASED') {
    return 'case-speed-increased';
  }
  if (speedTrend.label === 'DECREASED') {
    return 'case-speed-decreased';
  }
  if (speedTrend.label === 'UNKNOWN') {
    return 'case-speed-unknown';
  }
  return 'case-speed-unchanged';
}


/**
 * Builds one case section in the consolidated HTML report.
 * @param {Object} caseResult - case result object
 * @param {number} minTolerancePercent - minimum tolerance percentage
 * @returns {string}
 */
function buildCaseChartHtml(caseResult, minTolerancePercent) {
  const maxOps = Math.max(caseResult.previous.throughputMean,
    caseResult.current.throughputMean, 1);
  const previousWidth = (caseResult.previous.throughputMean / maxOps) * 100;
  const currentWidth = (caseResult.current.throughputMean / maxOps) * 100;
  const previousConfidenceInterval = getConfidenceInterval(
    caseResult.previous.throughputMean, caseResult.previous.throughputRme,
    minTolerancePercent);
  const currentConfidenceInterval = getConfidenceInterval(
    caseResult.current.throughputMean, caseResult.current.throughputRme,
    minTolerancePercent);
  const speedTrend = getSpeedTrend(
    previousConfidenceInterval, currentConfidenceInterval);
  const caseTrendClassName = getCaseTrendClassName(speedTrend);

  return `
    <article class="case ${caseTrendClassName}">
      ${caseResult.caseName ? `<h3>${escapeHtml(caseResult.caseName)}</h3>` : ''}
      <div class="bar-row">
        <div class="bar-label">Previous (${escapeHtml(previousVersion)})</div>
        <div class="bar-track"><div class="bar previous" style="width:${previousWidth.toFixed(2)}%"></div></div>
        <div class="bar-value">${escapeHtml(formatOps(caseResult.previous.throughputMean))} ops/s</div>
      </div>
      <div class="bar-row">
        <div class="bar-label">Current (${escapeHtml(currentVersion)})</div>
        <div class="bar-track"><div class="bar current" style="width:${currentWidth.toFixed(2)}%"></div></div>
        <div class="bar-value">${escapeHtml(formatOps(caseResult.current.throughputMean))} ops/s</div>
      </div>
      <p class="meta">
        <span class="speedup-label">Speedup (current vs previous): <strong>${escapeHtml(formatSpeedup(caseResult.speedup))}</strong></span> |
        Previous RME: ${escapeHtml(formatPercent(caseResult.previous.throughputRme))} |
        Current RME: ${escapeHtml(formatPercent(caseResult.current.throughputRme))}
      </p>
    </article>
  `;
}


/**
 * Builds the full benchmark HTML report.
 * @param {Array<Object>} allSuitesResults - array of suite results
 * @param {Object} options - command line options. See benchmark.js.
 * @param {number} minTolerancePercent - minimum tolerance percentage
 * @returns {string}
 */
function buildReportHtml(allSuitesResults, options, minTolerancePercent) {
  const suitesHtml = allSuitesResults.map((suiteResult) => `
    <section class="suite">
      <h2>${escapeHtml(suiteResult.name)}</h2>
      <p class="expression"><code>${escapeHtml(suiteResult.expression)}</code></p>
      ${suiteResult.cases
        .map((caseResult) =>
          buildCaseChartHtml(caseResult, minTolerancePercent))
        .join('\n')}
    </section>
  `).join('\n');

  const selectedMathMode = options.mathMode || 'native';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FHIRPath Benchmark Report</title>
  <style>
    :root {
      --bg: #f8fafc;
      --panel: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --border: #dbe3ee;
      --previous: #475569;
      --current: #0f766e;
      --speed-increased: #57bf1b;
      --speed-decreased: #b91c1c;
      --speed-unknown: #cd8316;
      --track: #e2e8f0;
    }
    body {
      margin: 0;
      padding: 24px;
      background: linear-gradient(180deg, #eef4ff 0%, var(--bg) 100%);
      color: var(--text);
      font: 14px/1.5 "Helvetica Neue", Arial, sans-serif;
    }
    main {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 4px;
      font-size: 26px;
    }
    .summary {
      color: var(--muted);
      margin-bottom: 18px;
    }
    .suite {
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--panel);
      padding: 16px;
      margin-bottom: 14px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
    }
    .suite h2 {
      margin: 0 0 8px;
      font-size: 18px;
    }
    .expression {
      margin: 0 0 12px;
      color: var(--muted);
      overflow-wrap: anywhere;
    }
    .case {
      border-top: 1px solid var(--border);
      padding-top: 12px;
      margin-top: 12px;
    }
    .case:first-of-type {
      border-top: 0;
      padding-top: 0;
      margin-top: 0;
    }
    .case h3 {
      margin: 0 0 8px;
      font-size: 15px;
      color: #1e293b;
    }
    .bar-row {
      display: grid;
      grid-template-columns: 220px 1fr 150px;
      gap: 10px;
      align-items: center;
      margin-bottom: 8px;
    }
    .bar-label {
      color: var(--muted);
      font-size: 13px;
    }
    .bar-track {
      height: 16px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--track);
    }
    .bar {
      height: 100%;
      border-radius: 999px;
    }
    .bar.previous {
      background: var(--previous);
    }
    .bar.current {
      background: var(--current);
    }
    .case.case-speed-increased .bar.current {
      background: var(--speed-increased);
    }
    .case.case-speed-decreased .bar.current {
      background: var(--speed-decreased);
    }
    .bar-value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-size: 13px;
    }
    .meta {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 12px;
    }
    .case.case-speed-increased .speedup-label {
      color: var(--speed-increased);
      font-weight: bold;
    }
    .case.case-speed-decreased .speedup-label {
      color: var(--speed-decreased);
      font-weight: bold;
    }
    .case.case-speed-unknown .speedup-label {
      color: var(--speed-unknown);
      font-weight: bold;
    }
    code {
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 4px;
    }
    @media (max-width: 780px) {
      .bar-row {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .bar-value {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <main>
    <h1>FHIRPath Version Comparison</h1>
    <p class="summary">
      Previous: ${escapeHtml(previousVersion)} | Current: ${escapeHtml(currentVersion)} |
      Generated: ${escapeHtml(new Date().toISOString())} |
      Math mode: ${escapeHtml(selectedMathMode)}
    </p>
    ${suitesHtml}
  </main>
</body>
</html>`;
}


/**
 * Run benchmarks from file.
 * @param {string} filename file name in the benchmark directory.
 * @param {Object} options - command line options. See benchmark.js.
 * @param {class} Bench tinybench Bench class.
 * @param {number} minTolerancePercent - minimum tolerance percentage
 * @returns Promise<Array<Object>>
 */
async function run(filename, options, Bench, minTolerancePercent) {
  const fhirpathOptions = {
    ...(options.mathMode ? {preciseMath : options.mathMode === 'precise'} : {} )
  };

  const suites = [].concat(...require('./'+ filename)({
    previous_fhirpath,
    previous_r4_model,
    current_fhirpath,
    current_r4_model,
    minimumDataset,
    patientExample,
    currentVersion,
    previousVersion,
    bigItems,
    bigItemsCopy,
    smallItems,
    smallItemsCopy,
    options,
    fhirpathOptions
  }));

  const allSuitesResults = [];
  for (const suite of suites) {
    const suiteResult = {
      name: suite.name,
      filename: suite.filename,
      expression: formatExpression(suite.expression),
      cases: []
    };

    for (const testCase of suite.cases) {
      const previousCompiledFn = previous_fhirpath.compile(
        suite.expression,
        previous_r4_model,
        fhirpathOptions
      );
      const currentCompiledFn = current_fhirpath.compile(
        suite.expression,
        current_r4_model,
        fhirpathOptions
      );

      const previousTaskFactory = testCase.testFunction.bind(
        null,
        previous_fhirpath,
        previous_r4_model,
        previousCompiledFn
      );
      const currentTaskFactory = testCase.testFunction.bind(
        null,
        current_fhirpath,
        current_r4_model,
        currentCompiledFn
      );

      const previousTaskFn = await prepareBenchmarkTaskFn(previousTaskFactory);
      const currentTaskFn = await prepareBenchmarkTaskFn(currentTaskFactory);
      const bench = withCodSpeed(new Bench(tinybenchDefaults));

      bench.add(prepareTaskName(testCase.name, previousVersion, 'prev'),
        previousTaskFn);
      bench.add(prepareTaskName(testCase.name, currentVersion, 'current'),
        currentTaskFn);
      await bench.run();

      // For debugging:
      // console.table(bench.table());

      const previousTask = bench.tasks[0];
      const currentTask = bench.tasks[1];
      const previousMetrics = getTaskMetrics(previousTask);
      const currentMetrics = getTaskMetrics(currentTask);
      const speedup = previousMetrics.throughputMean > 0
        ? currentMetrics.throughputMean / previousMetrics.throughputMean
        : null;

      suiteResult.cases.push({
        caseName: testCase.name/* || suite.name*/,
        previous: previousMetrics,
        current: currentMetrics,
        speedup
      });

      const previousConfidenceInterval = getConfidenceInterval(
        previousMetrics.throughputMean, previousMetrics.throughputRme,
        minTolerancePercent);
      const currentConfidenceInterval = getConfidenceInterval(
        currentMetrics.throughputMean, currentMetrics.throughputRme,
        minTolerancePercent);
      const speedTrend = getSpeedTrend(
        previousConfidenceInterval, currentConfidenceInterval);
      console.log(
        `[${suite.filename}] ${colorize(
          testCase.name || suite.name,
          speedTrend.color
        )}: ` +
        `${formatOps(previousMetrics.throughputMean)} ops/s ` +
        `[${previousVersion}] vs ` +
        `${formatOps(currentMetrics.throughputMean)} ops/s [current] ` +
        `(speedup ${colorize(formatSpeedup(speedup), speedTrend.color)}, ` +
        `previous RME ${formatPercent(previousMetrics.throughputRme)}, ` +
        `current RME ${formatPercent(currentMetrics.throughputRme)})`
      );
    }

    allSuitesResults.push(suiteResult);
  }

  return allSuitesResults;
}


// Retrieves options from the main process and runs benchmarks
process.on('message', async (options) => {
  try {
    const minTolerancePercent = Number.isInteger(options.minTolerance) ?
      options.minTolerance : 5;
    const { Bench } = await import('tinybench');
    fs.mkdirSync(resultsDir, { recursive: true });
    const filenames = options.tests;
    const reportData = [];

    for (const filename of filenames) {
      const suiteResults = await run(filename, options, Bench,
        minTolerancePercent);
      reportData.push(...suiteResults);
    }

    fs.writeFileSync(outputReportPath, buildReportHtml(reportData, options,
        minTolerancePercent), 'utf8');
    await open(outputReportPath);
    console.log('Benchmark report generated at: ' + outputReportPath);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
