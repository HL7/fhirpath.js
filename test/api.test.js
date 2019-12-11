const fhirpath = require('../src/fhirpath');

describe('compile', () => {
  it('should accept a model object', () => {
    let f = fhirpath.compile('Observation.value', require('../fhir-context/r4'));
    expect(f({resourceType: "Observation", valueString: "high"})).toStrictEqual(["high"]);
  });

  it('should return a function that accepts a context hash', () => {
    let f = fhirpath.compile('%a + 2');
    expect(f({num: 2}, {a: 1})).toStrictEqual([3]);
  });
});
