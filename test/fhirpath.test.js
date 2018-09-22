const subj = require('../src/fhirpath');
const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const _    = require('lodash');

// Get document, or throw exception on error
// const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

var items = fs.readdirSync(__dirname + '/cases/');

// Set "focus" to true to turn on focus option

function endWith(s, postfix){
  var idx = s.indexOf(postfix);
  return ( idx > 0 &&  idx == fileName.length - postfix.length);
}

var focus = false;
var focusFile = /.*.yaml/;

for (var i=0; i<items.length; i++) {
  var fileName = items[i];

  // Only process yaml files
  if (endWith(fileName, '.yaml')) {
    const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/' + fileName, 'utf8'));

    if((focus && focusFile.test(fileName)) || focus === false) {
      let focusedTest = false;
      for (let i=0, len=testcase.tests.length; i<len && !focusedTest; ++i) {
        focusedTest = testcase.tests[i].focus;
      }

      describe(fileName, ()=> {
        testcase.tests.forEach((t)=> {
          if (!focus || (focusedTest && t.focus)) {
            // console.log(yaml.dump(subj.parse(t.expression)));
            let exprs = Array.isArray(t.expression) ? t.expression : [t.expression];
            let console_log = console.log;
            exprs.forEach((e)=> {
              if (t.disable && t.disable === true) {
                it.skip(`Disabled test ${t.desc}`, () => {});
              } else {
              it(((t.desc || '') + ': ' + (e || '')) , () => {
                if (t.disableConsoleLog)
                  console.log = function() {};
                if (!t.error && t.expression) {
                  let res;
                  if (_.has(t, 'inputfile')) {
                    const filePath = __dirname + /resources/ + t.inputfile;
                    if (fs.existsSync(filePath)) {
                      const subjFromFile = JSON.parse(fs.readFileSync(filePath));
                      console_log(subjFromFile);
                      res = subj.evaluate(subjFromFile, e);
                    } else {
                      throw new Error('Resource file isnt exists');
                    }
                  } else {
                    res =  subj.evaluate(testcase.subject, e);
                  }
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
                  console.log = console.log;
              });
              }
            });
          }
        });
      });

    }
  }
}
