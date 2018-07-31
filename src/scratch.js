const fp = require('./fhirpath');
const yaml = require('js-yaml');

function pp (x) {
   console.log(yaml.dump(x));
}

function isEmpty(x){
  return Array.isArray(x) && x.length == 0;
}

function isSome(x){
  return x !== null && x !== undefined && !isEmpty(x);
}

console.log(isSome(0))

// console.log(yaml.dump(fp.parse('Patient.name')));

// pp(fp.parse('Patient.a.b'));

// console.log(fp.evaluate({resourceType: 'Patient', a: {b: 1}}, 'Patient.a.b'))
// console.log(fp.evaluate({resourceType: 'Patient', a: {b: 1}}, 'a.b'))
// console.log(fp.evaluate({resourceType: 'Patient', a: {b: 1}}, 'a'))
// console.log(fp.evaluate({resourceType: 'Patient', a: {b: 1}}, 'id'))


// console.log('res', fp.evaluate({resourceType: 'Encounter', a: {b: 1}}, 'a.b'))

// pp(fp.parse('Patient.a.b.c.d.e'))
// pp('res', fp.evaluate({resourceType: 'Encounter', a: {b: 1}}, 'a'))

// pp('res', fp.evaluate({resourceType: 'Encounter', a: {b: 1}}, 'Encounter.a'))
// pp('res', fp.evaluate({resourceType: 'Encounter', a: [{b: 1}]}, 'Encounter.a[5]'))

// pp(fp.parse('name."given"'));

// console.log(fp.evaluate({resourceType: 'Patient', a: {b: 1}}, 'Patient."a"'))

// pp(fp.parse('Patient.name.exists(2)'));
// pp(fp.parse('Patient.name.exists()'));

// pp('res', fp.evaluate({resourceType: 'Patient', a: [{b: 1}]}, 'Patient.a.exists()'))

// pp(fp.parse("Patient.name.fn(1,2,3)"));
// console.log('res', fp.evaluate({resourceType: 'Patient', a: [{b: 1}]}, 'Patient.a.where( b = 1 )'))


// pp(fp.parse("Patient.name.where(use = 'home')exists()"));
// pp(fp.parse("Patient.name.where(use = 1)exists()"));
// var b = [1,3]; 
// var a = b.concat([2,4]);
// console.log(a, b);
