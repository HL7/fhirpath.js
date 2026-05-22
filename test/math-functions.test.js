// This file contains tests for math functions not covered in "5.7_math.yaml" or
// in the general FHIRPath tests.
const fhirpath = require('../src/fhirpath');
const r4 = require('../fhir-context/r4');


function makeObservationWithValueQuantity(value) {
  return {
    resourceType: 'Observation',
    status: 'final',
    valueQuantity: {
      value,
      system: 'http://unitsofmeasure.org',
      code: 'mg',
      unit: 'mg'
    }
  };
}


function evaluate(expression,
                  resource = makeObservationWithValueQuantity(-1.56)) {
  return fhirpath.evaluate(resource, expression, {}, r4);
}


describe('math functions', () => {

  it('converts FHIR resource quantities before calculating abs()', () => {
    expect(evaluate('Observation.valueQuantity.abs()'))
      .toEqual(["1.56 'mg'"]);
  });


  it('converts FHIR resource quantities before calculating ceiling()', () => {
    expect(evaluate('Observation.valueQuantity.ceiling()'))
      .toEqual(["-1 'mg'"]);
  });


  it('converts FHIR resource quantities before calculating floor()', () => {
    expect(evaluate('Observation.valueQuantity.floor()'))
      .toEqual(["-2 'mg'"]);
  });


  it('converts FHIR resource quantities before calculating round()', () => {
    expect(evaluate('Observation.valueQuantity.round(1)'))
      .toEqual(["-1.6 'mg'"]);
  });


  it('converts FHIR resource quantities before calculating truncate()', () => {
    expect(evaluate('Observation.valueQuantity.truncate()'))
      .toEqual(["-1 'mg'"]);
  });

});
