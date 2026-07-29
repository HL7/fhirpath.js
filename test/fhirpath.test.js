const yaml = require('js-yaml');
const util = require('../src/utilities');
const fs   = require('fs');
const _    = require('lodash');
const { calcExpression } = require("./test_utils");
const { FP_DateTime, ResourceNode } = require('../src/types');

// Get document, or throw exception on error
// const testcase = yaml.load(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

const items = fs.readdirSync(__dirname + '/cases/');

// Set "focus" to true to turn on focus option
const focus = false;
const focusFile = /.*.yaml/;

// Add custom matchers to check if an error is not thrown
expect.extend({

  /**
   * Custom matcher to check if a caught exception is null.
   * @param {Error|string|null} received - caught exception in
   *  the generateTest function or null. This should be `Error` or `string` if
   *  the `fhirpath.js` code threw an error, or null.
   * @returns {Object} - An object indicating whether the check passed and
   *  an optional message.
   */
  isNotError(received) {
    if (received === null) {
      return {
        pass: true
      };
    } else {
      return {
        message: () => received instanceof Error ? received.stack || received.message : received + '',
        pass: false
      };
    }
  },


  /**
   * Custom matcher to check if a caught exception is not null.
   * @param {Error|string|null} received - caught exception in
   *  the generateTest function or null. This should be `Error` or `string` if
   *  the `fhirpath.js` code threw an error, or null.
   * @param {*} unexpectedResult - The unexpected result to include in the error
   *  message if the check fails.
   * @returns {Object} - An object indicating whether the check passed and
   *  an optional message.
   */
  isError(received, unexpectedResult) {
    if (received !== null) {
      return {
        pass: true
      };
    } else {
      return {
        message: () => `Expected an error to be thrown, but the returned result is ${util.toJSON(unexpectedResult)}.`,
        pass: false
      };
    }
  }
  
});


const endWith = (s, postfix) => {
  return s.length >= postfix.length && s.substr(-postfix.length) === postfix;
};


/**
 * In the generated YAML tests, just as when generating the result in
 * `prepareEvalResult` with the `resolveInternalTypes=true` flag (the default),
 * ResourceNode entries with nullish (`null` or `undefined`) data are ignored.
 * The default path unwraps the node via `util.valData()` and drops it with a
 * loose `!= null` check, so metadata-only primitives (e.g. a `date` node whose
 * `data` is `undefined`, or an `integer64` node whose `data` is `null`) are
 * excluded here as well.
 * @param {Array<*>} result - raw result from fhirpath.evaluate().
 * @returns {Array<*>} result without nullish-valued ResourceNode entries.
 */
function filterNullishResourceNodes(result) {
  return result.filter(item =>
    !(item instanceof ResourceNode && item.data == null)
  );
}


const files = items.filter(fileName => endWith(fileName, '.yaml'))
  .map(fileName =>({ fileName, data: yaml.load(fs.readFileSync(__dirname + '/cases/' + fileName, 'utf8')) }));

const generateTest = (test, testResource) => {
  let expressions = Array.isArray(test.expression) ? test.expression : [test.expression];
  const console_log = console.log;

  const getTestData = (expression, preciseMath, done) => {
    if (test.disableConsoleLog) {
      console.log = function() {};
    }
    if (test.expression) { // Headings do not have expressions
      let exception = null;
      let result = null;
      try {
        result = calcExpression(expression, test, testResource, preciseMath);
      }
      catch (error) {
        exception = error;
      }
      if (result instanceof Promise) {
        result.then(
          (r) => processTestResult(test, r, null, done),
          (e) => processTestResult(test, null, e, done),
        );
      } else {
        processTestResult(test, result, exception, done);
      }
    } else {
      done();
    }
  };

  const processTestResult = (test, result, exception, done) => {
    if (!test.error) {
      expect(exception).isNotError();
      const comparableResult = filterNullishResourceNodes(result);
      // Run the result through JSON so the FP_Type quantities get converted to
      // strings.  Also, if the result is an FP_DateTime, use compare() so that
      // timezone differences and leap seconds are handled.
      if (
        comparableResult.length === 1 &&
        test.result.length === 1 &&
        comparableResult[0] instanceof FP_DateTime
      ) {
        expect(
          FP_DateTime.checkString(
            comparableResult[0].ctx,
            test.result[0]
          ).compare(comparableResult[0])
        ).toEqual(0);
      } else {
        expect(JSON.parse(util.toJSON(comparableResult))).toEqual(test.result);
      }
    }
    else if (test.error) {
      expect(exception).isError(result);
    }
    if (test.disableConsoleLog)
      console.log = console_log;
    done();
  };

  expressions.forEach(expression => {
    // Normalize `test.preciseMath` into an iterable list of execution modes.
    // Supported YAML forms:
    // - `undefined`  -> run once per default modes: `[false, true]`
    // - `boolean`    -> run once with the provided mode: `[true]` or `[false]`
    // - `boolean[]`  -> run once per listed mode (e.g. `[false, true]`)
    // TODO: At some point, we will be able to reduce the number of tests by
    //  changing the default value to `[false]`. But first, we need to set
    //  `preciseMath: [false, true]` for the tests that truly require
    //  double-checking.
    ( test.preciseMath === undefined ? [false, true] :
      (Array.isArray(test.preciseMath) ? test.preciseMath : [test.preciseMath]) )
      .forEach( preciseMath => {
        const expressionText = expression instanceof Object ? util.toJSON(expression) : expression;
        const testName = ((test.desc ? test.desc + ': ' : '') + (expressionText|| '')) + (preciseMath ? ' <--preciseMath': '');
        switch(test.type) {
          case 'skipped':
            return it.skip(`Disabled test ${testName}`, () => {});
          case 'focused':
            return it.only(testName, (done) => getTestData(expression, preciseMath, done));
          default:
            return it(testName, (done) => getTestData(expression, preciseMath, done));
        }
      });
  });
};

const generateGroup = (group, testResource) => {
  const groupKey = _.first(_.keys(_.omit(group, 'disable')));
  const groupName = groupKey.replace(/^group:*\s*/g, '');
  const getTestGroupData = () => group[groupKey].map(test => addType(test)).map(
    test => isGroup(test) ? generateGroup(test, testResource) : generateTest(test, testResource));
  switch (group.type) {
  case 'skipped':
    describe.skip(groupName, () => {getTestGroupData()});
    break;
  case 'focused':
    describe.only(groupName, () => {getTestGroupData()});
    break;
  default:
    describe(groupName, () => {getTestGroupData()});
  }
};

const addType = (entity) => {
  if (entity.focus === true && focus) {
    return {...entity, type: 'focused'};
  }
  if (entity.disable === true) {
    return {...entity, type: 'skipped'};
  }
  return {...entity, type: 'regular'};
};

// Tests whether the given test is a group.
function isGroup(test) {
  return (_.keys(test).some(key => key.startsWith('group:')));
}

const generateSuite = (fileName, testcase) => {
  if((focus && focusFile.test(fileName)) || !focus) {
    describe(fileName, () => testcase.tests.map(item => addType(item)).forEach(test => {
      const testResource = testcase.subject;
      isGroup(test)
        ? generateGroup(test, testResource)
        : generateTest(test, testResource);
    }));
  }
};

files.forEach(item => generateSuite(item.fileName, item.data));
