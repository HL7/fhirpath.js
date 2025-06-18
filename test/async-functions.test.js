const fhirpath = require('../src/fhirpath');
const modelR4 = require('../fhir-context/r4');
const modelR5 = require('../fhir-context/r5');
const _ = require("lodash");
const emptyResource = {};
const observationResource = require('./resources/observation-example.json');
const administrativeGenderVS = require('./resources/administrative-gender-valueset.json');
const observationCategoryVS = require('./resources/observation-category-valuset.json');
const {mockRestore, mockFetchResults} = require('./mock-fetch-results');



describe('Async functions', () => {

  afterEach(() => {
    mockRestore();
  })


  describe('%terminologies.expand', () => {

    it('should work with a canonical URL reference to a value set passed as a string literal', (done) => {
      mockFetchResults([
        ['ValueSet/$expand?url=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fadministrative-gender', administrativeGenderVS]
      ]);

      let result = fhirpath.evaluate(
        emptyResource,
        "%terminologies.expand('http://hl7.org/fhir/ValueSet/administrative-gender') is ValueSet",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });


    it('should work with a canonical URL reference to a value set passed as a resource node', (done) => {
      mockFetchResults([
        ['ValueSet/$expand?url=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fadministrative-gender', administrativeGenderVS]
      ]);

      let result = fhirpath.evaluate(
        administrativeGenderVS,
        "%terminologies.expand(ValueSet.url) is ValueSet",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });


    it('should throw an error when the async function is not allowed', () => {
      let result = () => fhirpath.evaluate(
        emptyResource,
        "%terminologies.expand('http://hl7.org/fhir/ValueSet/observation-vitalsignresult') is ValueSet",
        {},
        modelR4,
        { async: false, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "expand" is not allowed.');
    });


    it('should work with an actual ValueSet', (done) => {
      mockFetchResults([
        [{url: 'ValueSet/$expand', body: bodyStr => {
          const bodyObj = JSON.parse(bodyStr);
          return bodyObj.resourceType === 'Parameters' &&
            bodyObj.parameter.find(
              p => p.name === 'valueSet'
            ).resource.resourceType === 'ValueSet' &&
            bodyObj.parameter.find(
              p => p.name === 'offset'
            ).valueInteger === 20 &&
            bodyObj.parameter.find(
              p => p.name === 'count'
            ).valueInteger === 10;
        }}, administrativeGenderVS]
      ]);

      let result = fhirpath.evaluate(
        emptyResource,
        "%terminologies.expand(%administrativeGenderVS, 'offset=20&count=10') is ValueSet",
        {
          administrativeGenderVS
        },
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });


    it('should return an empty value if an error occurs', (done) => {
      mockFetchResults([
        [{url: 'ValueSet/$expand', body: bodyStr => {
          const bodyObj = JSON.parse(bodyStr);
          return bodyObj.resourceType === 'Parameters' &&
            bodyObj.parameter.find(
              p => p.name === 'valueSet'
            ).resource.resourceType === 'ValueSet' &&
            bodyObj.parameter.find(
              p => p.name === 'offset'
            ).valueInteger === 20 &&
            bodyObj.parameter.find(
              p => p.name === 'count'
            ).valueInteger === 20;
        }}, null, {
          "resourceType": "OperationOutcome",
          "issue": [ {
            "severity": "error",
            "code": "processing",
            "diagnostics": "Additional diagnostic information about the issue."
          } ]
        }]
      ]);

      let result = fhirpath.evaluate(
        emptyResource,
        "%terminologies.expand(%administrativeGenderVS, 'offset=20&count=20') is ValueSet",
        {
          administrativeGenderVS
        },
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([]);
        done();
      })
    });

  });


  describe('%terminologies.lookup', () => {

    it('should work with a Coding', (done) => {
      mockFetchResults([
        [{
          url: 'CodeSystem/$lookup',
          body: bodyStr => {
            let result = false;
            const bodyObj = JSON.parse(bodyStr);
            if (bodyObj.resourceType === 'Parameters') {
              const valueCoding = bodyObj.parameter.find(p => p.name === 'coding')?.valueCoding;
              const date = bodyObj.parameter.find(p => p.name === 'date')?.valueDateTime;
              const displayLanguage = bodyObj.parameter.find(p => p.name === 'displayLanguage')?.valueCode;

              result = valueCoding &&
                valueCoding.system === 'http://loinc.org' &&
                valueCoding.code === '29463-7' &&
                valueCoding.display === 'Body Weight' &&
                date === '2011-03-04' &&
                displayLanguage === 'en';
            }
            return result;
          }
        }, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "someName",
              "valueString": "someValue"
            }
          ]
        }]
      ]);

      let result = fhirpath.evaluate(
        observationResource,
        "%terminologies.lookup(Observation.code.coding[0], 'date=2011-03-04&displayLanguage=en').parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual(['someValue']);
        done();
      });
    });


    it('should work with a code', (done) => {
      mockFetchResults([
        [{
          url: 'CodeSystem/$lookup',
          body: bodyStr => {
            let result = false;
            const bodyObj = JSON.parse(bodyStr);
            if (bodyObj.resourceType === 'Parameters') {
              const code = bodyObj.parameter.find(p => p.name === 'code')?.valueCode;
              const system = bodyObj.parameter.find(p => p.name === 'system')?.valueUri;
              const date = bodyObj.parameter.find(p => p.name === 'date')?.valueDateTime;
              const displayLanguage = bodyObj.parameter.find(p => p.name === 'displayLanguage')?.valueCode;

              result = system === 'http://loinc.org' &&
                code === '29463-7' &&
                date === '2011-03-04' &&
                displayLanguage === 'en';
            }
            return result;
          }
        }, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "someName",
              "valueString": "someValue"
            }
          ]
        }]
      ]);

      let result = fhirpath.evaluate(
        observationResource,
        "%terminologies.lookup(Observation.code.coding[0].code, 'system=http%3A%2F%2Floinc.org&date=2011-03-04&displayLanguage=en').parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual(['someValue']);
        done();
      });
    });


    it('should throw an error when the async function is not allowed', () => {
      let result = () => fhirpath.evaluate(
        observationResource,
        "%terminologies.lookup(Observation.code.coding[0], 'date=2011-03-04&displayLanguage=en').parameter.value",
        {},
        modelR4,
        { async: false, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "lookup" is not allowed.');
    });

  });


  describe('%terminologies.validateVS', () => {

    it('should work with a Coding and URL passed as a string literal', (done) => {
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
        observationResource,
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding[0]).parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });

    
    it('should work with a code and URL passed as a resource node', (done) => {
      mockFetchResults([
        ['ValueSet?url=http%3A%2F%2Fterminology.hl7.org%2FValueSet%2Fobservation-category', {
          "resourceType": "Bundle",
          "entry": [{
            "resource": observationCategoryVS
          }]
        }],
        [/code=laboratory/, {
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
        observationCategoryVS,
        "%terminologies.validateVS(ValueSet.url, 'laboratory').parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });


    it('should work with an actual ValueSet', (done) => {
      mockFetchResults([
        [{
          url: 'ValueSet/$validate-code',
          body: bodyStr => {
            const bodyObj = JSON.parse(bodyStr);
            return bodyObj.resourceType === 'Parameters' &&
              bodyObj.parameter.find(
                p => p.name === 'valueSet'
              ).resource.resourceType === 'ValueSet' &&
              bodyObj.parameter.find(
                p => p.name === 'code'
              ).valueCode === 'laboratory' &&
              bodyObj.parameter.find(
                p => p.name === 'system'
              ).valueUri === 'http://terminology.hl7.org/CodeSystem/observation-category';
          }
        }, {
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
        observationCategoryVS,
        "%terminologies.validateVS(ValueSet, 'laboratory').parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });


    it('should be cancelable ', (done) => {
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
      ], {timeout: 1000});

      const abortController = new AbortController();

      let result = fhirpath.evaluate(
        observationResource,
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding[0]).parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4",
          signal: abortController.signal }
      );
      expect(result instanceof Promise).toBe(true);
      setTimeout(() => {
        abortController.abort();
      }, 100);
      result.catch((e) => {
        expect(e.name).toEqual('AbortError');
        done();
      })
    });


    it('should return an empty result if the params parameter is not a valid URL encoded string', () => {
      let result = fhirpath.evaluate(
        observationResource,
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding[0], 'something=???').parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toEqual([]);
    });


    it('should throw an error when the async function is not allowed', () => {
      let result = () => fhirpath.evaluate(
        observationResource,
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding[0]).parameter.value",
        {},
        modelR4,
        { async: false, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "validateVS" is not allowed.');
    });

  });


  describe('%terminologies.validateCS', () => {

    it('should work with a \'code\' and a URL passed as a string literal', (done) => {
      mockFetchResults([
        [{
          url: 'CodeSystem/$validate-code',
          body: bodyStr => {
            let result = false;
            const bodyObj = JSON.parse(bodyStr);
            if (bodyObj.resourceType === 'Parameters') {
              const url = bodyObj.parameter.find(p => p.name === 'url')?.valueUri;
              const valueCode = bodyObj.parameter.find(p => p.name === 'code')?.valueCode;
              const date = bodyObj.parameter.find(p => p.name === 'date')?.valueDateTime;
              const displayLanguage = bodyObj.parameter.find(p => p.name === 'displayLanguage')?.valueCode;

              result = url === 'http://hl7.org/fhir/administrative-gender' &&
                valueCode === 'Male' &&
                date === '2011-03-04' &&
                displayLanguage === 'en';
            }
            return result;
          }
        }, {
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
        observationResource,
        "%terminologies.validateCS('http://hl7.org/fhir/administrative-gender', 'Male', 'date=2011-03-04&displayLanguage=en').parameter.value",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });


    it('should throw an error when the async function is not allowed', () => {
      let result = () => fhirpath.evaluate(
        observationResource,
        "%terminologies.validateCS('http://hl7.org/fhir/administrative-gender', 'Male', 'date=2011-03-04&displayLanguage=en').parameter.value",
        {},
        modelR4,
        { async: false, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "validateCS" is not allowed.');
    });

  });


  describe('%terminologies.subsumes', () => {

    it('should work with a \'code\' and URL passed as a string literal', (done) => {
      mockFetchResults([
        [{
          url: 'CodeSystem/$subsumes',
          body: bodyStr => {
            let result = false;
            const bodyObj = JSON.parse(bodyStr);
            if (bodyObj.resourceType === 'Parameters') {
              const url = bodyObj.parameter.find(p => p.name === 'url')?.valueUri;
              const valueCode1 = bodyObj.parameter.find(p => p.name === 'codeA')?.valueCode;
              const valueCode2 = bodyObj.parameter.find(p => p.name === 'codeB')?.valueCode;
              const version = bodyObj.parameter.find(p => p.name === 'version')?.valueString;

              result = url === 'http://snomed.info/sct' &&
                valueCode1 === '3738000' &&
                valueCode2 === '235856003' &&
                version === '2014-05-06';
            }
            return result;
          }
        }, {
          "resourceType": "Parameters",
          "parameter": [
            {
              "name": "outcome",
              "valueCode" : "subsumed-by"
            }
          ]
        }]
      ]);

      let result = fhirpath.evaluate(
        observationResource,
        "%terminologies.subsumes('http://snomed.info/sct', '3738000', '235856003', 'version=2014-05-06').where($this is FHIR.code) = 'subsumed-by'",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });


    it('should throw an error when the async function is not allowed', () => {
      let result = () => fhirpath.evaluate(
        observationResource,
        "%terminologies.subsumes('http://snomed.info/sct', '3738000', '235856003', 'version=2014-05-06').where($this is FHIR.code) = 'subsumed-by'",
        {},
        modelR4,
        { async: false, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "subsumes" is not allowed.');
    });

  });


  describe('%terminologies.translate', () => {

    ['R4', 'R5'].forEach((modelName) => {
      it(
        `should work with a \'code\' and URL passed as a string literal (${modelName})`,
        (done) => {
          const isR5 = modelName === 'R5';
          mockFetchResults([
            [{
              url: 'CodeSystem/$translate',
              body: bodyStr => {
                let result = false;
                const bodyObj = JSON.parse(bodyStr);
                if (bodyObj.resourceType === 'Parameters') {
                  const url = bodyObj.parameter.find(p => p.name === 'url')?.valueUri;
                  const valueCode = bodyObj.parameter.find(
                    p => p.name === (isR5 ? 'sourceCode' : 'code')
                  )?.valueCode;
                  const sourceScope = bodyObj.parameter.find(
                    p => p.name === (isR5 ? 'sourceScope' : 'source')
                  )?.valueUri;
                  const targetScope = bodyObj.parameter.find(
                    p => p.name === (isR5 ? 'targetScope' : 'target')
                  )?.valueUri;

                  result = url === 'http://hl7.org/fhir/composition-status' &&
                    valueCode === 'preliminary' &&
                    sourceScope === 'http://hl7.org/fhir/ValueSet/composition-status' &&
                    targetScope === 'http://hl7.org/fhir/ValueSet/v3-ActStatus';
                }
                return result;
              }
            }, {
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
            observationResource,
            "%terminologies.translate('http://hl7.org/fhir/composition-status'," +
            "'preliminary'," +
            (isR5 ?
              "'sourceScope=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fcomposition-status&targetScope=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fv3-ActStatus'"
              : "'source=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fcomposition-status&target=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fv3-ActStatus'") +
            ").parameter.where(name='result').value",
            {},
            isR5 ? modelR5 : modelR4,
            {
              async: true,
              terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4"
            }
          );
          expect(result instanceof Promise).toBe(true);
          result.then((r) => {
            expect(r).toEqual([true]);
            done();
          })
        });
    });


    it('should throw an error when the async function is not allowed', () => {
      let result = () => fhirpath.evaluate(
        observationResource,
        "%terminologies.translate('http://hl7.org/fhir/composition-status', 'preliminary', 'sourceScope=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fcomposition-status&targetScope=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fv3-ActStatus').parameter.where(name='result').value",
        {},
        modelR4,
        { async: false, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "translate" is not allowed.');
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
        observationResource,
        "Observation.code.coding.where(memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult'))",
        {},
        modelR4,
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
        observationResource,
        "Observation.code.memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult')",
        {},
        modelR4,
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
        observationResource,
        "Observation.code.coding.code[0].memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult')",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4-1" }
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
        observationResource,
        "Observation.code.coding.code[0].memberOf('http://unknown-valueset')",
        {},
        modelR4,
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
        observationResource,
        "Observation.code.coding.code[0].memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult')",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4-2" }
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
        observationResource,
        "Observation.code.coding.code[0].memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult')",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4-3" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([]);
        done();
      })
    });


    it('should throw an exception when async functions are disabled', () => {
      let result = () => fhirpath.evaluate(
        observationResource,
        "Observation.code.coding.where(memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult'))",
        {},
        modelR4,
        { terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toThrow('The asynchronous function "memberOf" is not allowed. To enable asynchronous functions, use the async=true or async="always" option.');
    });


    it('should correctly process an async result in a boolean expression (when it is a singleton parameter)', (done) => {
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
        observationResource,
        "Observation.code.memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult') or false",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
        done();
      })
    });

  });


  describe('resolve', () => {
    const medicationDispenseResource106 = require('./resources/medicationdispense-med-106-0.json');
    const medicationDispenseResource107 = _.cloneDeep(medicationDispenseResource106);
    medicationDispenseResource107.id = 'med-107-0';
    medicationDispenseResource107.subject = {
      "reference": "https://lforms-fhir.nlm.nih.gov/baseR4/Patient/pat-107",
      "display": "JIAN MCINTOSH"
    };
    const patientResource106 = require('./resources/patient-pat-106-0.json');
    const patientResource107 = _.cloneDeep(patientResource106);
    patientResource107.id = 'pat-107';
    patientResource107.deceasedDateTime = '2129';
    const valueSetResource = {
      "resourceType": "Bundle",
      "entry": [{
        "resource": {
          "resourceType": "ValueSet",
          "url": "http://some-canonical-value-set-url"
        }
      }]
    };
    const questionnaireWithContainedQ = {
      "resourceType": "Questionnaire",
      "url": "http://some-canonical-questionnaire-url",
      "version": "1.0",
      "derivedFrom": "#childQuestionnaire",
      "contained": [{
        "resourceType": "Questionnaire",
        "id": "childQuestionnaire",
        "derivedFrom": "#childOfChildQuestionnaire",
        "contained": [{
          "resourceType": "Questionnaire",
          "id": "childOfChildQuestionnaire"
        }]
      }]
    };


    beforeEach(() => {
      mockFetchResults([
        ['https://lforms-fhir.nlm.nih.gov/baseR4/MedicationDispense/med-106-0', medicationDispenseResource106],
        ['https://lforms-fhir.nlm.nih.gov/baseR4/MedicationDispense/med-107-0', medicationDispenseResource107],
        ['https://lforms-fhir.nlm.nih.gov/baseR4/Patient/pat-106', patientResource106],
        ['https://lforms-fhir.nlm.nih.gov/baseR4/Patient/pat-107', patientResource107],
        [/https:\/\/lforms-fhir.nlm.nih.gov\/baseR4\/ValueSet\?url=http%3A%2F%2Fsome-canonical-value-set-url$/, valueSetResource],
        [/https:\/\/lforms-fhir.nlm.nih.gov\/baseR4\/ValueSet\?url=http%3A%2F%2Fsome-canonical-value-set-url&version=1.0$/, valueSetResource],
        [/https:\/\/lforms-fhir.nlm.nih.gov\/baseR4\/Questionnaire\?url=http%3A%2F%2Fsome-canonical-questionnaire-url&version=2.0$/, {
          "resourceType": "Bundle",
          "entry": [{
            "resource": questionnaireWithContainedQ
          }]
        }],
        ['http://some-canonical-url', null, {
          "resourceType": "OperationOutcome",
          "issue": [{
            "severity": "error",
            "code": "processing",
            "diagnostics": "Additional diagnostic information about the issue."
          }]
        }]
      ]);
    });

    [
      [
        'String with relative URL',
        {},
        '\'MedicationDispense/med-106-0\'.resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        'String with absolute URL',
        {},
        '\'https://lforms-fhir.nlm.nih.gov/baseR4/MedicationDispense/med-107-0\'.resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        'Reference with relative URL',
        medicationDispenseResource106,
        'MedicationDispense.subject.resolve().deceased.where($this is dateTime)',
        ['2128']
      ],
      [
        'Reference with absolute URL',
        medicationDispenseResource107,
        'MedicationDispense.subject.resolve().deceased.where($this is dateTime)',
        ['2129']
      ],
      [
        'uri with relative URL',
        {},
        '%factory.uri(\'MedicationDispense/med-106-0\').resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        'uri with absolute URL',
        {},
        '%factory.uri(\'https://lforms-fhir.nlm.nih.gov/baseR4/MedicationDispense/med-107-0\').resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        'canonical for a synthetic node as an empty collection',
        {},
        '%factory.canonical(\'http://some-canonical-url\').resolve()',
        []
      ],
      [
        'canonical for a node that resolves to a resource',
        {
          "resourceType": "CodeSystem",
          "valueSet": "http://some-canonical-value-set-url",
        },
        'CodeSystem.valueSet.resolve() is ValueSet',
        [true]
      ],
      [
        'canonical with version and fragment',
        {
          "resourceType": "QuestionnaireResponse",
          "questionnaire": "http://some-canonical-questionnaire-url|2.0#childQuestionnaire",
        },
        'QuestionnaireResponse.questionnaire.resolve().where($this is Questionnaire).id=\'childQuestionnaire\'',
        [true]
      ],
      [
        'canonical URL with a fragment only',
        questionnaireWithContainedQ,
        'Questionnaire.derivedFrom.resolve().where($this is Questionnaire).id=\'childQuestionnaire\'',
        [true]
      ],
      [
        'canonical URL with a fragment only for a nested resource that contains another resource',
        questionnaireWithContainedQ,
        'Questionnaire.derivedFrom.resolve().derivedFrom.resolve().where($this is Questionnaire).id=\'childOfChildQuestionnaire\'',
        [true]
      ]
    ].forEach(([dataType, resource, expression, res]) => {

      it(`should resolve ${dataType}`, (done) => {
        let result = fhirpath.evaluate(
          resource,
          `${expression}`,
          {},
          modelR4,
          { async: true, fhirServerUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
        );
        expect(result instanceof Promise).toBe(true);
        result.then((r) => {
          expect(r).toEqual(res);
          done();
        });
      });

    });
  });


  it('should be a conversion of the result to a Promise when option async is set to "always"', (done) => {
    let result = fhirpath.evaluate(
      observationResource,
      "Observation.code.coding[0]",
      {},
      modelR4,
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
      observationResource,
      "Observation.code.coding[0]",
      {},
      modelR4,
      {}
    );
    expect(result instanceof Promise).toBe(false);
    expect(result).toEqual([{"code": "29463-7", "display": "Body Weight", "system": "http://loinc.org"}]);
  });


  it('throws error if signal is provided but async is not enabled', () => {
    const abortController = new AbortController();
    const options = { signal: abortController.signal, async: false };
    expect(() => fhirpath.evaluate(
      observationResource,
      "Observation.code.coding[0]",
      {},
      modelR4,
      options
    )).toThrow(
      'The "signal" option is only supported for asynchronous functions.'
    );
  });


  it('throws error if signal is already aborted before evaluation starts', () => {
    const abortController = new AbortController();
    abortController.abort();
    const options = { signal: abortController.signal, async: true };
    expect(() => fhirpath.evaluate(
      observationResource,
      "Observation.code.coding[0]",
      {},
      modelR4,
      options
    )).toThrow(
      'Evaluation of the expression was aborted before it started.'
    );
  });

});


