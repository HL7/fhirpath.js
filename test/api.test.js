const fhirpath = require('../src/fhirpath');

describe('convert', () => {
  it('should accept a context hash', () => {
    let f = fhirpath.compile('%a + num', {a: 3});
    expect(f({num: 2})).toStrictEqual([5]);
  });

  it('should return a function that accepts a context hash', () => {
    let f = fhirpath.compile('%a + 2');
    expect(f({num: 2}, {a: 1})).toStrictEqual([3]);
  });

  it('should return a function that can override the context hash', () => {
    let f = fhirpath.compile('%a + 2', {a: 3});
    expect(f({num: 2}, {a: 1})).toStrictEqual([3]);
  });

});
