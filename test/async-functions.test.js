const fhirpath = require('../src/fhirpath');
const model = require('../fhir-context/r4');
const resource = require('./resources/observation-example.json');

describe('Async functions', () => {

  describe('%terminologies', () => {
    it('should support validateVS', (done) => {
      let result = fhirpath.evaluate(
        resource,
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding[0]).parameter.value",
        {},
        model,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });
  });

  describe('memberOf', () => {
    it('should work with Codings when async functions are enabled', (done) => {

      let result = fhirpath.evaluate(
        resource,
        "Observation.code.coding.where(memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult'))",
        {},
        model,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([{"code": "29463-7", "display": "Body Weight", "system": "http://loinc.org"}]);
        done();
      })
    });

    it('should work with CodeableConcept when async functions are enabled', (done) => {

      let result = fhirpath.evaluate(
        resource,
        "Observation.code.memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult')",
        {},
        model,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });

    it('should work with Code when async functions are enabled', (done) => {
      let result = fhirpath.evaluate(
        resource,
        "Observation.code.coding.code[0].memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult')",
        {},
        model,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });

    it('should return an empty result when the ValueSet cannot be resolved', (done) => {
      let result = fhirpath.evaluate(
        resource,
        "Observation.code.coding.code[0].memberOf('http://unknown-valueset')",
        {},
        model,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([]);
        done();
      })
    });

    it('should throw an exception when async functions are disabled', () => {

      let result = () => fhirpath.evaluate(
        resource,
        "Observation.code.coding.where(memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult'))",
        {},
        model,
        { terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "memberOf" is not allowed. To enable asynchronous functions, use the async=true or async="always" option.');
    });
  });

  it('should be a conversion of the result to a Promise when option async is set to "always"', (done) => {
    let result = fhirpath.evaluate(
      resource,
      "Observation.code.coding[0]",
      {},
      model,
      { async: 'always' }
    );
    expect(result instanceof Promise).toBe(true);
    result.then((r) => {
      expect(r).toEqual([{"code": "29463-7", "display": "Body Weight", "system": "http://loinc.org"}]);
      done();
    })
  });

  it('should not be a conversion of the result to a Promise by default', () => {
    let result = fhirpath.evaluate(
      resource,
      "Observation.code.coding[0]",
      {},
      model,
      {}
    );
    expect(result instanceof Promise).toBe(false);
    expect(result).toEqual([{"code": "29463-7", "display": "Body Weight", "system": "http://loinc.org"}]);
  });
});


