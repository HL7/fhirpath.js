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


const calcExpression = (expression, test, testResource) => {
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
        throw new Error("Resource file doesn't exists");
      }
    }
  } else {
    return fhirpath.evaluate(testResource, expression);
  }
};

const generateTest = (test, testResource) => {
  let expressions = Array.isArray(test.expression) ? test.expression : [test.expression];
  const console_log = console.log;
  expressions.forEach(expression => {
    if (test.disable === true) {
      it.skip(`Disabled test ${test.desc}`, () => {});
    } else {
      it(((test.desc || '') + ': ' + (expression || '')) , () => {
        if (test.disableConsoleLog) {
          console.log = function() {};
        }
        if (!test.error && test.expression) {
          const result = calcExpression(expression, test, testResource);
          expect(result).toEqual(test.result);
        }
        else if (test.error) {
          let exception = null;
          let result = null;
          try {
            result = fhirpath.evaluate(testResource, expression);
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
      });
    }
  });
};

const generateGroup = (group, testResource) => {
  const groupName = _.first(_.keys(_.omit(group, 'disable')));
  return (group.disable === true)
    ? describe.skip(groupName, () => group[groupName].map(test => generateTest(test, testResource)))
    : describe(groupName, () => group[groupName].map(test => generateTest(test, testResource)));
};


const generateSuite = (fileName, testcase) => {
  if((focus && focusFile.test(fileName)) || !focus) {
    return describe(fileName, () => testcase.tests.forEach(test => {
      if (!focus || test.focus) {
        const testResource = testcase.subject;
        (_.keys(test).some(key => key.startsWith('group')))
          ? generateGroup(test, testResource)
          : generateTest(test, testResource);
      }
    }));
  }
};

files.forEach(item => generateSuite(item.fileName, item.data));
