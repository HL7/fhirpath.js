const fhirpath = require('../src/fhirpath');
const yaml = require('js-yaml');
const fs   = require('fs');
const _    = require('lodash');

// Get document, or throw exception on error
// const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

const items = fs.readdirSync(__dirname + '/cases/');

// Set "focus" to true to turn on focus option

const endWith = (s, postfix) => {
  const idx = s.indexOf(postfix);
  return (idx > 0 && idx === s.length - postfix.length);
};

const focus = false;
const focusFile = /.*.yaml/;

const resources = {};

const files = items.filter(fileName => endWith(fileName, '.yaml'))
  .map(fileName =>({ fileName, data: yaml.safeLoad(fs.readFileSync(__dirname + '/cases/' + fileName, 'utf8')) }));


const calcExpression = (expression, test, testcase) => {
  if (_.has(test, 'inputfile')) {
    if(_.has(resources, test.inputfile)) {
      return  fhirpath.evaluate(resources[test.inputfile], expression);
    } else {
      const filePath = __dirname + /resources/ + test.inputfile;
      if (fs.existsSync(filePath)) {
        const subjFromFile = JSON.parse(fs.readFileSync(filePath));
        resources[test.inputfile] = subjFromFile;
        return fhirpath.evaluate(subjFromFile, expression);
      } else {
        throw new Error('Resource file isnt exists');
      }
    }
  } else {
    return fhirpath.evaluate(testcase.subject, expression);
  }
};

const generateCase = (expression, test, testcase) => {
  const console_log = console.log;
  if (test.disable === true) {
    it.skip(`Disabled test ${test.desc}`, () => {});
  } else {
    it(((test.desc || '') + ': ' + (expression || '')) , () => {
      if (test.disableConsoleLog) {
        console.log = function() {};
      }
      if (!test.error && test.expression) {
        const result = calcExpression(expression, test, testcase);
        expect(result).toEqual(test.result);
      }
      else {
        let exception = null;
        try {
          fhirpath.evaluate(testcase.subject, expression);
        }
        catch (error) {
          exception = error;
        }
        expect(exception).not.toBe(null);
      }
      if (test.disableConsoleLog)
        console.log = console_log;
    });
  }
};

const generateTest = (test, testcase) => {
  if (_.keys(test).some(key => key.startsWith('group'))) {
    const groupName = _.first(_.keys(_.omit(test, 'disable')));
    return (test.disable === true)
      ? describe.skip(groupName, () => test[groupName].map(tCase => generateTest(tCase)))
      : describe(groupName, () => test[groupName].map(tCase => generateTest(tCase)));
  } else {
    if (!focus || test.focus) {
      let expressions = Array.isArray(test.expression) ? test.expression : [test.expression];
      expressions.forEach((expression) => generateCase(expression, test, testcase));
    }}
};


const generateSuite = (fileName, testcase) => {
  if((focus && focusFile.test(fileName)) || focus === false) {
    return describe(fileName, () => testcase.tests.forEach(test => generateTest(test, testcase)));
  }
};

files.forEach(item => generateSuite(item.fileName, item.data));
