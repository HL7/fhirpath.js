const subj = require('../src/fhirpath');
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


const calcExpression = (e, t, testcase) => {
  if (_.has(t, 'inputfile')) {
    if(_.has(resources, t.inputfile)) {
      return  subj.evaluate(resources[t.inputfile], e);
    } else {
      const filePath = __dirname + /resources/ + t.inputfile;
      if (fs.existsSync(filePath)) {
        const subjFromFile = JSON.parse(fs.readFileSync(filePath));
        resources[t.inputfile] = subjFromFile;
        return subj.evaluate(subjFromFile, e);
      } else {
        throw new Error('Resource file isnt exists');
      }
    }
  } else {
    return subj.evaluate(testcase.subject, e);
  }
};

const generateCase = (e, t, testcase) => {
  const console_log = console.log;
  if (t.disable === true) {
    it.skip(`Disabled test ${t.desc}`, () => {});
  } else {
    it(((t.desc || '') + ': ' + (e || '')) , () => {
      if (t.disableConsoleLog) {
        console.log = function() {};
      }
      if (!t.error && t.expression) {
        const res = calcExpression(e, t, testcase);
        expect(res).toEqual(t.result);
      }
      else {
        let exceptn = null;
        try {
          subj.evaluate(testcase.subject, e);
        }
        catch (e) {
          exceptn = e;
        }
        expect(e).not.toBe(null);
      }
      if (t.disableConsoleLog)
        console.log = console_log;
    });
  }
};

const generateTest = (t, testcase) => {
  if (_.keys(t).some(key => key.startsWith('group'))) {
    const groupName = _.first(_.keys(_.omit(t, 'disable')));
    return (t.disable === true)
      ? describe.skip(groupName, () => t[groupName].map(c => generateTest(c)))
      : describe(groupName, () => t[groupName].map(c => generateTest(c)));
  } else {
    if (!focus || t.focus) {
      let exprs = Array.isArray(t.expression) ? t.expression : [t.expression];
      exprs.forEach((e) => generateCase(e, t, testcase));
    }}
};


const generateSuite= (fileName, testcase) => {
  if((focus && focusFile.test(fileName)) || focus === false) {
    return describe(fileName, () => testcase.tests.forEach(test => generateTest(test, testcase)));
  }
};

files.forEach(item => generateSuite(item.fileName, item.data));
