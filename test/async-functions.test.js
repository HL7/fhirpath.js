const fhirpath = require('../src/fhirpath');
const model = require('../fhir-context/r4');
const resource = require('./resources/observation-example.json');

let fetchSpy;

/**
 * Mocks fetch requests.
 * @param {Array} results - an array of fetch response descriptions, each item
 *  of which is an array with the RegExp URL as the first item and the response
 *  JSON object as the second.
 */
function mockFetchResults(results) {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(
    (url) => new Promise((resolve, _) => {
      const mockedResult = results?.find(r => r[0].test(url))?.[1]
      if(mockedResult) {
        resolve({ json: () => mockedResult });
      } else {
        console.error(`"${url}" is not mocked.`)
      }
    })
  );
}

describe('Async functions', () => {

  describe('%terminologies.validateVS', () => {
    afterEach(() => {
      fetchSpy?.mockRestore();
    })

    it('should work ', (done) => {
      mockFetchResults([
        [/code=29463-7/, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "result",
              "valueBoolean": true
            }
          ]
        }]
      ]);

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

    it('should throw an error if the params parameter is not a valid URL encoded string', () => {
      let result = () => fhirpath.evaluate(
        resource,
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding[0], 'something=???').parameter.value",
        {},
        model,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrowError('should be a valid URL encoded string');
    });
  });

  describe('memberOf', () => {
    it('should work with Codings when async functions are enabled', (done) => {
      mockFetchResults([
        [/code=29463-7/, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "result",
              "valueBoolean": true
            }
          ]
        }],
        [/.*/, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "result",
              "valueBoolean": false
            },
            {
              "name": "message",
              "valueString": "Unknown code"
            }
          ]
        }]
      ]);

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

      mockFetchResults([
        [/ValueSet\/\$validate-code/, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "result",
              "valueBoolean": true
            }
          ]
        }]
      ]);
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

    it('should work with "code" when async functions are enabled', (done) => {
      mockFetchResults([
        [/ValueSet\?url=http%3A%2F%2Fhl7\.org%2Ffhir%2FValueSet%2Fobservation-vitalsignresult/, {
          "resourceType": "Bundle",
          "entry": [
            {
              "resource": {
                "resourceType": "ValueSet",
                "compose": {
                  "include": [
                    {
                      "system": "http://loinc.org",
                    }
                  ]
                }
              }
            }
          ]
        }],
        [/code=29463-7&system=http%3A%2F%2Floinc\.org/, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "result",
              "valueBoolean": true
            }
          ]
        }]
      ]);
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
      mockFetchResults([
        [/ValueSet\?url=http%3A%2F%2Funknown-valueset/, {
          "resourceType": "Bundle",
          "total": 0,
        }]
      ]);
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

    it('should work with "code" when there is more than one identical coding system in the ValueSet', (done) => {
      mockFetchResults([
        [/ValueSet\?url=http%3A%2F%2Fhl7\.org%2Ffhir%2FValueSet%2Fobservation-vitalsignresult/, {
          "resourceType": "Bundle",
          "entry": [
            {
              "resource": {
                "resourceType": "ValueSet",
                "compose": {
                  "include": [
                    {
                      "system": "http://loinc.org",
                    },
                    {
                      "system": "http://loinc.org",
                    }
                  ]
                },
                "expansion": {
                  "contains": [
                    {
                      "system": "http://loinc.org",
                    },
                    {
                      "system": "http://loinc.org",
                    }
                  ]
                }
              }
            }
          ]
        }],
        [/code=29463-7&system=http%3A%2F%2Floinc\.org/, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "result",
              "valueBoolean": true
            }
          ]
        }]
      ]);
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

    it('should return an empty result when there is more than one different coding system in the ValueSet', (done) => {
      mockFetchResults([
        [/ValueSet\?url=http%3A%2F%2Fhl7\.org%2Ffhir%2FValueSet%2Fobservation-vitalsignresult/, {
          "resourceType": "Bundle",
          "entry": [
            {
              "resource": {
                "resourceType": "ValueSet",
                "compose": {
                  "include": [
                    {
                      "system": "http://loinc.org",
                    },
                    {
                      "system": "http://loinc.org",
                    }
                  ]
                },
                "expansion": {
                  "contains": [
                    {
                      "system": "http://loinc.org",
                    },
                    {
                      "system": "http://something-else",
                    }
                  ]
                }
              }
            }
          ]
        }]
      ]);
      let result = fhirpath.evaluate(
        resource,
        "Observation.code.coding.code[0].memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult')",
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


