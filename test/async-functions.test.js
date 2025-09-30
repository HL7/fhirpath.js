const fhirpath = require('../src/fhirpath');
const modelDSTU2 = require('../fhir-context/dstu2');
const modelSTU3 = require('../fhir-context/stu3');
const modelR4 = require('../fhir-context/r4');
const modelR5 = require('../fhir-context/r5');
const _ = require("lodash");
const emptyResource = {};
const observationResource = require('./resources/r4/observation-example.json');
const administrativeGenderVS = require('./resources/r4/administrative-gender-valueset.json');
const observationCategoryVS = require('./resources/r4/observation-category-valuset.json');
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


    it('should use custom headers ', (done) => {
      mockFetchResults([
        [{
          url: /code=29463-7/,
          headers: (h) => h?.get('Authorization') === 'some auth value'
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
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding[0]).parameter.value",
        {},
        modelR4,
        {
          async: true,
          terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4",
          httpHeaders: {
            "https://lforms-fhir.nlm.nih.gov/baseR4": {
              Authorization: 'some auth value'
            }
          }
        }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([true]);
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

    it('should return an empty collection when a code does not have a value', () => {
      mockFetchResults([
        ['ValueSet?url=http%3A%2F%2Fhl7.org%2Ffhir%2FValueSet%2Fobservation-vitalsignresult', {
          "resourceType": "Bundle",
          "entry": [{
            "resource": {
              "resourceType": "ValueSet",
              "url": "http://hl7.org/fhir/ValueSet/observation-vitalsignresult",
              "compose": {
                "include": [{
                  "system": "http://loinc.org",
                  "concept": [
                    {"code": "85353-1"}, {"code": "9279-1"}, {"code": "8867-4"},
                    {"code": "2708-6"}, {"code": "8310-5"}, {"code": "8302-2"},
                    {"code": "9843-4"}, {"code": "29463-7"},
                    {"code": "39156-5"}, {"code": "85354-9"},
                    {"code": "8480-6"}, {"code": "8462-4"}, {"code": "8478-0"}
                  ]
                }]
              }
            }
          }]
        }]
      ]);

      let result = fhirpath.evaluate(
        {
          "resourceType": "Observation",
          "code": {
            "coding":
              [{
                "_code": {
                  "id": "someCodeId"
                }
              }]
          }
        },
        "%terminologies.validateVS('http://hl7.org/fhir/ValueSet/observation-vitalsignresult', Observation.code.coding.code)",
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
        expect(r).toEqual([expect.objectContaining({
          "code": "29463-7",
          "display": "Body Weight",
          "system": "http://loinc.org"
        })]);
        done();
      })
    });


    it('should work with CodeableConcept when async functions are enabled', (done) => {
      mockFetchResults([
        [{
          url: '/ValueSet/$validate-code',
          body: '"system":"http://loinc.org"',
          method: 'POST'
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


    it('should use GET for CodeableConcept with a single Coding', (done) => {
      mockFetchResults([
        [{
          url: /ValueSet\/\$validate-code.*&system=system1/,
          method: 'GET'
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
        "%factory.CodeableConcept(%factory.Coding('system1', '1')).memberOf('http://some-valueset')",
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

    it('should work when Coding in a CodeableConcept has no system and code', () => {
      mockFetchResults([]);
      let result = fhirpath.evaluate(
        {},
        "%factory.CodeableConcept(%factory.Coding('', '', 'some display text')).memberOf('http://some-valueset')",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result).toEqual([]);
    });


    it('should work when no Coding in a CodeableConcept', (done) => {
      mockFetchResults([
        [{
          url: '/ValueSet/$validate-code',
          body: '"valueUri":"http://some-valueset"',
          method: 'POST'
        }, null, {
          "resourceType": "OperationOutcome",
          "issue": [ {
            "severity": "error",
            "code": "processing",
            "diagnostics": "HAPI-0899: No code, coding, or codeableConcept provided to validate"
          } ]
        }]
      ]);
      let result = fhirpath.evaluate(
        {},
        "%factory.CodeableConcept(Observation.code.coding).memberOf('http://some-valueset')",
        {},
        modelR4,
        { async: true, terminologyUrl: "https://lforms-fhir.nlm.nih.gov/baseR4" }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([]);
        done();
      });
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


  /**
   * Test suite for the 'resolve' functionality in FHIRPath evaluation.
   * This suite verifies that various forms of FHIR references (relative/absolute URLs, canonical, uri, etc.)
   * are correctly resolved to their corresponding resources using asynchronous evaluation.
   */
  describe('resolve', () => {
    // Load test resources and set up test data for MedicationDispense and Patient resources.
    const medicationDispenseResource106 = require('./resources/r4/medicationdispense-med-106-0.json');
    const medicationDispenseResource107 = _.cloneDeep(medicationDispenseResource106);
    medicationDispenseResource107.id = 'med-107-0';
    medicationDispenseResource107.subject = {
      "reference": "https://some-fhir-server/Patient/pat-107"
    };
    const medicationDispenseResource108 = _.cloneDeep(medicationDispenseResource106);
    medicationDispenseResource108.id = 'med-108-0';
    medicationDispenseResource108.subject = {
      "reference": "https://some-fhir-server/Patient/pat-108"
    };
    const patientResource106 = require('./resources/r4/patient-pat-106-0.json');
    const patientResource107 = _.cloneDeep(patientResource106);
    patientResource107.id = 'pat-107';
    patientResource107.deceasedDateTime = '2129';
    const patientResource108 = _.cloneDeep(patientResource106);
    patientResource108.id = 'pat-108';
    patientResource108.deceasedDateTime = '2130';

    // ValueSet bundle resource for canonical URL resolution tests.
    const valueSetResource = {
      "resourceType": "Bundle",
      "entry": [{
        "resource": {
          "resourceType": "ValueSet",
          "url": "http://some-canonical-value-set-url"
        }
      }]
    };

    // Questionnaire resource with contained/nested questionnaires for fragment resolution tests.
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

    /**
     * Sets up mock fetch results before each test to simulate FHIR server responses.
     */
    beforeEach(() => {
      mockFetchResults([
        ['https://some-fhir-server/MedicationDispense/med-106-0', medicationDispenseResource106],
        ['https://some-fhir-server/MedicationDispense/med-107-0', medicationDispenseResource107],
        ['https://some-fhir-server/Patient/pat-106', patientResource106],
        ['https://some-fhir-server/Patient/pat-107', patientResource107],
        ['https://some-fhir-server/Patient/pat-108', null, {
          "resourceType": "OperationOutcome",
          "issue": [ {
            "severity": "error",
            "code": "processing",
            "diagnostics": "Resource Patient/pat-108 is not known"
          } ]
        }],
        // This impossible request should not be called, but is included to
        // catch it in case it is called by mistake:
        ['https://some-fhir-server/Patient?url=https%3A%2F%2Fsome-fhir-server%2FPatient%2Fpat-108', {
          "resourceType": "Bundle",
          "entry": [{
            "resource": patientResource108
          }]
        }],
        [/https:\/\/some-fhir-server\/ValueSet\?url=http%3A%2F%2Fsome-canonical-value-set-url$/, valueSetResource],
        [/https:\/\/some-fhir-server\/ValueSet\?url=http%3A%2F%2Fsome-canonical-value-set-url&version=1.0$/, valueSetResource],
        [/https:\/\/some-fhir-server\/Questionnaire\?url=http%3A%2F%2Fsome-canonical-questionnaire-url&version=2.0$/, {
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

    /**
     * Parameterized tests for various resolve scenarios.
     * Each test case checks that the FHIRPath expression resolves the reference as expected.
     */
    [
      // [models, description, resource, expression, expectedResult]
      [
        [modelDSTU2, modelSTU3, modelR4],
        'String with relative URL',
        {},
        '\'MedicationDispense/med-106-0\'.resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        [modelDSTU2, modelSTU3, modelR4],
        'String with absolute URL',
        {},
        '\'https://some-fhir-server/MedicationDispense/med-107-0\'.resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        [modelSTU3, modelR4, modelR5],
        'Reference with relative URL',
        medicationDispenseResource106,
        'MedicationDispense.subject.resolve().deceased.where($this is dateTime)',
        ['2128']
      ],
      [
        [modelSTU3, modelR4, modelR5],
        'Reference with absolute URL',
        medicationDispenseResource107,
        'MedicationDispense.subject.resolve().deceased.where($this is dateTime)',
        ['2129']
      ],
      [
        [modelSTU3, modelR4, modelR5],
        'Reference with absolute URL',
        medicationDispenseResource108,
        'MedicationDispense.subject.resolve().deceased.where($this is dateTime)',
        []
      ],
      [
        [modelDSTU2, modelSTU3, modelR4],
        'uri with relative URL',
        {},
        '%factory.uri(\'MedicationDispense/med-106-0\').resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        [modelDSTU2, modelSTU3, modelR4],
        'uri with absolute URL',
        {},
        '%factory.uri(\'https://some-fhir-server/MedicationDispense/med-107-0\').resolve().medication.coding.where(system=\'357\').code',
        ['00168022138']
      ],
      [
        [modelR4, modelR5],
        'canonical for a synthetic node as an empty collection',
        {},
        '%factory.canonical(\'http://some-canonical-url\').resolve()',
        []
      ],
      [
        [modelR4, modelR5],
        'canonical for a node that resolves to a resource',
        {
          "resourceType": "CodeSystem",
          "valueSet": "http://some-canonical-value-set-url",
        },
        'CodeSystem.valueSet.resolve() is ValueSet',
        [true]
      ],
      [
        [modelR4, modelR5],
        'canonical with version and fragment',
        {
          "resourceType": "QuestionnaireResponse",
          "questionnaire": "http://some-canonical-questionnaire-url|2.0#childQuestionnaire",
        },
        'QuestionnaireResponse.questionnaire.resolve().where($this is Questionnaire).id=\'childQuestionnaire\'',
        [true]
      ],
      [
        [modelR4, modelR5],
        'canonical URL with a fragment only',
        questionnaireWithContainedQ,
        'Questionnaire.derivedFrom.resolve().where($this is Questionnaire).id=\'childQuestionnaire\'',
        [true]
      ],
      [
        [modelR4, modelR5],
        'canonical URL with a fragment only for a nested resource that contains another resource',
        questionnaireWithContainedQ,
        'Questionnaire.derivedFrom.resolve().derivedFrom.resolve().where($this is Questionnaire).id=\'childOfChildQuestionnaire\'',
        [true]
      ]
    ].forEach((testData) => {
      // Extract models and test parameters for each test case.
      const [models, dataType, resource, expression, res] = testData;

      // Run the test for each FHIR model version.
      models.forEach(model => {
        it(`should resolve ${dataType} (${model.version.toUpperCase()})`, (done) => {
          let result = fhirpath.evaluate(
            resource,
            `${expression}`,
            {},
            model,
            {
              async: true,
              fhirServerUrl: "https://some-fhir-server"
            }
          );
          expect(result instanceof Promise).toBe(true);
          result.then((r) => {
            expect(r).toEqual(res);
            done();
          });
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
      expect(r).toEqual([expect.objectContaining({
        "code": "29463-7",
        "display": "Body Weight",
        "system": "http://loinc.org"
      })]);
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
    expect(result).toEqual([expect.objectContaining({
      "code": "29463-7",
      "display": "Body Weight",
      "system": "http://loinc.org"
    })]);
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


