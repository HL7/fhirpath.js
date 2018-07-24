const subj = require('../src/fhirpath');
const yaml = require('js-yaml');
const fs   = require('fs');

// Get document, or throw exception on error
const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

testcase.tests.forEach((t)=>{
    // console.log(yaml.dump(subj.parse(t.expression)));
    test((t.desc || t.expression) , () => {
        var res = subj.evaluate(testcase.subject, t.expression);
        // console.log(yaml.dump(res));
        expect(res).toEqual(t.result);
    });
});
