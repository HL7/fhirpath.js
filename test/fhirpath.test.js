const fhirpath = require('../src/fhirpath');
const yaml = require('js-yaml');
const fs   = require('fs');
const _    = require('lodash');
const { getFHIRModel, calcExpression } = require("./test_utils");
const FP_DateTime = require('../src/types').FP_DateTime;

// Get document, or throw exception on error
// const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

const items = fs.readdirSync(__dirname + '/cases/');

// Set "focus" to true to turn on focus option
const focus = false;
const focusFile = /.*.yaml/;


const endWith = (s, postfix) => {
  return s.length >= postfix.length && s.substr(-postfix.length) === postfix;
};

const files = items.filter(fileName => endWith(fileName, '.yaml'))
  .map(fileName =>({ fileName, data: yaml.safeLoad(fs.readFileSync(__dirname + '/cases/' + fileName, 'utf8')) }));

const generateTest = (test, testResource) => {
  let expressions = Array.isArray(test.expression) ? test.expression : [test.expression];
  const console_log = console.log;

  const getTestData = (expression) => {
    if (test.disableConsoleLog) {
      console.log = function() {};
    }
    if (!test.error && test.expression) {
      const result = calcExpression(expression, test, testResource);
      // Run the result through JSON so the FP_Type quantities get converted to
      // strings.  Also , if the result is an FP_DateTime, convert to a Date
      // object so that timezone differences are handled.
      if (result.length == 1 && result[0] instanceof FP_DateTime)
        expect(new Date(result[0])).toEqual(new Date(test.result[0]))
      else
        expect(JSON.parse(JSON.stringify(result))).toEqual(test.result);
    }
    else if (test.error) {
      let exception = null;
      let result = null;
      try {
        result = fhirpath.evaluate(testResource, expression, null,
          getFHIRModel(test.model));
      }
      catch (error) {
        exception = error;
      }
      if (result != null)
        console.log(result);
      expect(exception).not.toBe(null);
    }
    if (test.disableConsoleLog)
      console.log = console_log;
  };

  expressions.forEach(expression => {
    switch(test.type) {
    case 'skipped':
      return it.skip(`Disabled test ${test.desc}`, () => {});
    case 'focused':
      return it.only(((test.desc || '') + ': ' + (expression || '')), () => getTestData(expression));
    default:
      return it(((test.desc || '') + ': ' + (expression || '')), () => getTestData(expression));
    }
  });
};

const generateGroup = (group, testResource) => {
  const groupName = _.first(_.keys(_.omit(group, 'disable')));
  const getTestGroupData = () => group[groupName].map(test => addType(test)).map(
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
  return (_.keys(test).some(key => key.startsWith('group')));
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
