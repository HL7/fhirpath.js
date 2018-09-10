const subj = require('../src/fhirpath');
const yaml = require('js-yaml');
const fs   = require('fs');

// Get document, or throw exception on error
// const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

var items = fs.readdirSync(__dirname + '/cases/');

// Set "focus" to true to turn on focus option

function endWith(s, postfix){
  var idx = s.indexOf(postfix);
  return ( idx > 0 &&  idx == fileName.length - postfix.length);
}

var focus = true;
var focusFile = /^5\.6_.*.yaml/;

for (var i=0; i<items.length; i++) {
  var fileName = items[i];

  // Only process yaml files
  if (endWith(fileName, '.yaml')) {
    const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/' + fileName, 'utf8'));

    if((focus && focusFile.test(fileName)) || focus === false) {
      console.log(fileName, focusFile.test(fileName));
      let focusedTest = false;
      // for (let i=0, len=testcase.tests.length; i<len && !focusedTest; ++i)
      //   focusedTest = testcase.tests[i].focus

      describe(fileName, ()=> {
        testcase.tests.forEach((t)=>{
          if (true || !focus || (focusedTest && t.focus)) {
            // console.log(yaml.dump(subj.parse(t.expression)));
            let exprs = Array.isArray(t.expression) ? t.expression : [t.expression];
            let console_log = console.log;
            exprs.forEach((e)=>{
              it(((t.desc || '') + ': ' + (e || '')) , () => {
                if (t.disableConsoleLog)
                  console.log = function() {};
                if (!t.error && t.expression) {
                  var res = subj.evaluate(testcase.subject, e);
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
            });
          }
        });
      });

    }
  }
}

