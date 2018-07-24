const subj = require('../src/fhirpath');

const yaml = require('js-yaml');
const fs   = require('fs');

// Get document, or throw exception on error
const testcase = yaml.safeLoad(fs.readFileSync( __dirname + '/cases/simple.yaml', 'utf8'));

testcase.tests.forEach((t)=>{
    test((t.desc || t.expression) , () => {
        expect(subj.evaluate(testcase.subject, t.expression)).toBe(t.result);
    });
});
