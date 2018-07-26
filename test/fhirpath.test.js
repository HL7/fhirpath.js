const subj = require('../src/fhirpath');
const yaml = require('js-yaml');
const fs   = require('fs');

// Get document, or throw exception on error
const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

testcase.tests.forEach((t)=>{
  // console.log(yaml.dump(subj.parse(t.expression)));
  if(Array.isArray(t.expression)) {
    t.expression.forEach((e)=>{
      test(((t.desc || '') + ' ' + e) , () => {
        var res = subj.evaluate(testcase.subject, e);
        expect(res).toEqual(t.result);
      });
    });
  } else {
    test((t.desc + ' ' +  t.expression) , () => {
      var res = subj.evaluate(testcase.subject, t.expression);
      expect(res).toEqual(t.result);
    });
  }
});
