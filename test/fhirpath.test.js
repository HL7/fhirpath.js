const subj = require('../src/fhirpath');
const yaml = require('js-yaml');
const fs   = require('fs');

// Get document, or throw exception on error
// const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

var items = fs.readdirSync(__dirname + '/cases/');

// Set "focus" to true to turn on focus option
var focus = true;

for (var i=0; i<items.length; i++) {
  var fileName = items[i];

  // Only process yaml files
  if (fileName.indexOf('.yaml') == fileName.length-5) {
    const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/' + fileName, 'utf8'));

    if((focus && testcase.focus) || focus === false) {
      describe(fileName, ()=> {
        testcase.tests.forEach((t)=>{
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
        });
      });

    }
  }
}

