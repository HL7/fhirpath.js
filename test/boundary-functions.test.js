const fhirpath = require('../src/fhirpath');
const r4 = require('../fhir-context/r4');


function evaluate(expression, options = {}, resource = {}) {
  return fhirpath.evaluate(resource, expression, {}, null, options);
}


function evaluateWithModel(expression, resource, model, options = {}) {
  return fhirpath.evaluate(resource, expression, {}, model, options);
}


function expectDecimalBoundary(expression, expected) {
  [false, true].forEach(preciseMath => {
    const result = evaluate(expression, { keepDecimalTypes: true, preciseMath });
    expect(result.map(value => value.toString())).toEqual([expected]);
  });
}


function expectBoundary(expression, expected) {
  expect(evaluate(expression)).toEqual([expected]);
}


describe('lowBoundary() and highBoundary()', () => {

  it('returns empty for empty inputs', () => {
    expect(evaluate('{}.lowBoundary()')).toEqual([]);
    expect(evaluate('{}.highBoundary()')).toEqual([]);
  });


  it('throws for multiple input items', () => {
    expect(() => evaluate('(1 | 2).lowBoundary()')).toThrow(
      /expected a Decimal, Date, DateTime, or Time/
    );
    expect(() => evaluate('(1 | 2).highBoundary()')).toThrow(
      /expected a Decimal, Date, DateTime, or Time/
    );
  });


  it('throws for unsupported input types', () => {
    expect(() => evaluate('true.lowBoundary()')).toThrow(
      /Decimal, Date, DateTime, or Time/
    );
    expect(() => evaluate("'abc'.highBoundary()")).toThrow(
      /Decimal, Date, DateTime, or Time/
    );
    expect(() => evaluate("1 'cm'.lowBoundary()")).toThrow(
      /Decimal, Date, DateTime, or Time/
    );
  });


  it('returns empty for invalid or unsupported precisions', () => {
    expect(evaluate('1.587.lowBoundary(-1)')).toEqual([]);
    expect(evaluate('1.587.highBoundary(9)')).toEqual([]);
    expect(evaluate('@2014.lowBoundary(5)')).toEqual([]);
    expect(evaluate('@2014-01-01T08.highBoundary(16)')).toEqual([]);
    expect(evaluate('@T10:30.lowBoundary(8)')).toEqual([]);
  });


  it('calculates decimal boundaries and preserves requested scale', () => {
    expectDecimalBoundary('1.587.lowBoundary()', '1.58650000');
    expectDecimalBoundary('1.587.highBoundary()', '1.58750000');
    expectDecimalBoundary('1.587.lowBoundary(2)', '1.58');
    expectDecimalBoundary('1.587.highBoundary(2)', '1.59');
    expectDecimalBoundary('(-1.587).lowBoundary(2)', '-1.59');
    expectDecimalBoundary('(-1.587).highBoundary(2)', '-1.58');
    expectDecimalBoundary('1.lowBoundary(5)', '0.50000');
    expectDecimalBoundary('1.highBoundary(5)', '1.50000');
    expectDecimalBoundary('120.lowBoundary(2)', '119.50');
    expectDecimalBoundary('(-120).highBoundary(2)', '-119.50');
    expectDecimalBoundary('0.0034.highBoundary(1)', '0.1');
  });


  it('calculates date boundaries with month lengths and leap years', () => {
    expectBoundary('@2014.lowBoundary()', '2014-01-01');
    expectBoundary('@2014.highBoundary()', '2014-12-31');
    expectBoundary('@2014.lowBoundary(6)', '2014-01');
    expectBoundary('@2014.highBoundary(6)', '2014-12');
    expectBoundary('@2019-02.highBoundary(8)', '2019-02-28');
    expectBoundary('@2020-02.highBoundary(8)', '2020-02-29');
    expectBoundary('@2014-05-06.lowBoundary(6)', '2014-05');
    expectBoundary('@2014-05-06.highBoundary(6)', '2014-05');
  });


  it('calculates DateTime boundaries without changing timezone rendering', () => {
    expectBoundary(
      '@2014-01-01T08.lowBoundary(17)',
      '2014-01-01T08:00:00.000'
    );
    expectBoundary(
      '@2014-01-01T08.highBoundary(17)',
      '2014-01-01T08:59:59.999'
    );
    expectBoundary(
      '@2014-01-01T08Z.highBoundary(17)',
      '2014-01-01T08:59:59.999Z'
    );
    expectBoundary(
      '@2014-01-01T08:05+08:00.lowBoundary(17)',
      '2014-01-01T08:05:00.000+08:00'
    );
    expectBoundary(
      '@2014-01-01T08:05-05:00.highBoundary(17)',
      '2014-01-01T08:05:59.999-05:00'
    );
    expectBoundary('@2014-01-01T08.highBoundary(8)', '2014-01-01');
  });


  it('calculates time boundaries', () => {
    expectBoundary('@T10.lowBoundary(4)', '10:00');
    expectBoundary('@T10.highBoundary(4)', '10:59');
    expectBoundary('@T10.highBoundary(9)', '10:59:59.999');
    expectBoundary('@T10:30.lowBoundary(9)', '10:30:00.000');
    expectBoundary('@T10:30.highBoundary(9)', '10:30:59.999');
    expectBoundary('@T10:30:15.123.lowBoundary(9)', '10:30:15.123');
    expectBoundary('@T10:30:15.123.highBoundary(9)', '10:30:15.123');
  });


  it('converts FHIR resource dates before calculating boundaries', () => {
    const patient = { resourceType: 'Patient', birthDate: '2014' };

    expect(evaluateWithModel(
      'Patient.birthDate.highBoundary()', patient, r4
    )).toEqual(['2014-12-31']);
  });

});
