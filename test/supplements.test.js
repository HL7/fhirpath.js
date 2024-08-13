const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");
const _ = require("lodash");
const {mockRestore, mockFetchResults} = require('./mock-fetch-results');

// Clone input file contents to avoid one test affecting another
const input = {
  get observationExample1() {
    return _.cloneDeep(require("../test/resources/observation-example.json"));
  },
  get observationExample2() {
    return _.cloneDeep(require("../test/resources/observation-example-2.json"));
  },
  get questionnaire() {
    return _.cloneDeep(require("../test/resources/phq9.json"));
  },
  get questionnaireResponse() {
    return _.cloneDeep(require("../test/resources/phq9-response.json"));
  },
  get questionnaireResponseWithEmbeddedScores() {
    return _.cloneDeep(require("./resources/phq9-response-with-embedded-scores.json"));
  },
  get questionnaireResponseWithUnlinkedAnswers() {
    return _.cloneDeep(require("./resources/phq9-response-with-unlinked-answers.json"));
  },
};

describe("supplements", () => {

  ['weight', 'ordinal'].forEach(fnName => {
    describe(fnName+'()', () => {
      it("should return the correct result when getting scores from the Questionnaire resource", () => {
        const res = fhirpath.evaluate(
          input.questionnaireResponse,
          `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: input.questionnaire
          }, r4_model);
        expect(res).toStrictEqual([15]);
      });

      it("should return the correct result when getting some scores from the QuestionnaireResponse resource", () => {
        const res = fhirpath.evaluate(
          input.questionnaireResponseWithEmbeddedScores,
          `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: input.questionnaire
          }, r4_model);
        expect(res).toStrictEqual([17]);
      });

      it("should throw an error when getting scores for answers that doesn't exists in the Questionnaire", () => {
        const res = () => fhirpath.evaluate(
          input.questionnaireResponseWithUnlinkedAnswers,
          `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: input.questionnaire
          }, r4_model);
        expect(res).toThrow('Questionnaire answerOption/answerValueSet with this linkId was not found: /44250-9-unlinked-item.');
      });

      it("should return an empty array when the Observation resource doesn't have a score", () => {
        const res = fhirpath.evaluate(
          input.observationExample1, `%context.${fnName}()`,
          { scoreExt: 'http://someScoreExtension'}, r4_model
        );
        expect(res).toStrictEqual([]);
      });

      it("should return the correct result when getting a score from the Observation resource", () => {
        const res = fhirpath.evaluate(
          input.observationExample2, `%context.${fnName}()`,
          { scoreExt: 'http://someScoreExtension'}, r4_model
        );
        expect(res).toStrictEqual([3]);
      });

      it("should return the correct result when the source item has a score", () => {
        const res = fhirpath.evaluate(
          input.observationExample2, `%context.value.${fnName}()`,
          {}, r4_model
        );
        expect(res).toStrictEqual([4]);
      });

    });
  });

  ['weight', 'ordinal'].forEach(fnName => {
    describe(fnName + '()', () => {

      afterEach(() => {
        mockRestore();
      });

      it("should return the correct result when getting a score from a code system", (done) => {
        mockFetchResults([
          ['/CodeSystem?code=some-code-2&system=some-system',
            {
              "resourceType": "Bundle",
              "type": "searchset",
              "total": 1,
              "entry": [ {
                "resource": {
                  "resourceType": "CodeSystem",
                  "concept": [ {
                    "code": "some-code-1"
                  }, {
                    "code": "some-code-2",
                    "extension": [
                      {
                        "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                        "valueDecimal": 4
                      }
                    ]
                  }]
                }
              }]
            }]
        ]);

        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR4';
        const res = fhirpath.evaluate(
          {
            "resourceType": "Observation",
            "id": "example",
            "valueCodeableConcept": {
              "coding": [{
                "code": "some-code-2",
                "system": "some-system"
              }]
            }
          }, `%context.value.coding.${fnName}()`,
          {}, r4_model, {async: true, terminologyUrl}
        );
        res.then(r => {
          expect(r).toStrictEqual([4]);
          done();
        }, (err) => {
          done(err)
        })
      });

      it("should return the correct result when getting scores from a value set", (done) => {
        mockFetchResults([
          ['ValueSet?url=some-value-set',
            {
              "resourceType": "Bundle",
              "type": "searchset",
              "total": 1,
              "entry": [{
                "resource": {
                  "resourceType": "ValueSet",
                  "compose": {
                    "include": [{
                      "system": "some-system-1",
                      "concept": [{
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 1
                          }
                        ]
                      }, {
                        "code": "some-code-2",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 2
                          }
                        ]
                      }]
                    }]
                  },
                  "expansion": {
                    "contains": [{
                      "code": "some-code-1",
                      "system": "some-system-2",
                      "extension": [
                        {
                          "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                          "valueDecimal": 10
                        }
                      ]
                    }, {
                      "code": "some-code-2",
                      "system": "some-system-2",
                      "extension": [
                        {
                          "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                          "valueDecimal": 20
                        }
                      ]
                    }]
                  }
                }
              }]
            }
          ]
        ]);
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR4';
        const res = fhirpath.evaluate(
          {
            "resourceType": "QuestionnaireResponse",
            "item": [
              {
                "linkId": "link-1",
                "item": [
                  {
                    "linkId": "link-1.1",
                    "item": [
                      {
                        "linkId": "link-1.1.1",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-1",
                              "system": "some-system-1"
                            }
                          }
                        ]
                      },{
                        "linkId": "link-1.1.2",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-2",
                              "system": "some-system-2"
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }, `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: {
              "resourceType": "Questionnaire",
              "item": [
                {
                  "linkId": "link-1",
                  "type": "group",
                  "item": [
                    {
                      "linkId": "link-1.1",
                      "type": "group",
                      "item": [{
                        "linkId": "link-1.1.1",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r4_model, { async: true, terminologyUrl }
        );
        res.then(r => {
          expect(r).toStrictEqual([21]);
          done();
        }, (err) => {
          done(err)
        })
      });

      it("should return the correct result when getting scores from a value set and a code system", (done) => {
        mockFetchResults([
          ['ValueSet?url=some-value-set',
            {
              "resourceType": "Bundle",
              "type": "searchset",
              "total": 1,
              "entry": [{
                "resource": {
                  "resourceType": "ValueSet",
                  "compose": {
                    "include": [{
                      "system": "some-system-1",
                      "concept": [{
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 1
                          }
                        ]
                      }, {
                        "code": "some-code-2",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 2
                          }
                        ]
                      }]
                    },{
                      "system": "some-system-2",
                      "concept": [{
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 10
                          }
                        ]
                      }, {
                        "code": "some-code-2"
                      }]
                    }]
                  }
                }
              } ]
            }],
          ['/CodeSystem?code=some-code-2&system=some-system-2',
            {
              "resourceType": "Bundle",
              "type": "searchset",
              "total": 1,
              "entry": [ {
                "resource": {
                  "resourceType": "CodeSystem",
                  "concept": [ {
                    "code": "some-code-1"
                  }, {
                    "code": "some-code-2",
                    "extension": [
                      {
                        "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                        "valueDecimal": 30
                      }
                    ]
                  }]
                }
              }]
            }]
        ]);
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR4';
        const res = fhirpath.evaluate(
          {
            "resourceType": "QuestionnaireResponse",
            "item": [
              {
                "linkId": "link-1",
                "item": [
                  {
                    "linkId": "link-1.1",
                    "item": [
                      {
                        "linkId": "link-1.1.1",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-1",
                              "system": "some-system-1"
                            }
                          }
                        ]
                      },{
                        "linkId": "link-1.1.2",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-2",
                              "system": "some-system-2"
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }, `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: {
              "resourceType": "Questionnaire",
              "item": [
                {
                  "linkId": "link-1",
                  "type": "group",
                  "item": [
                    {
                      "linkId": "link-1.1",
                      "type": "group",
                      "item": [{
                        "linkId": "link-1.1.1",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r4_model, { async: true, terminologyUrl }
        );
        res.then(r => {
          expect(r).toStrictEqual([31]);
          done();
        }, (err) => {
          done(err)
        })
      });

      it("should cause an expression to fail if a corresponding value set cannot be resolved", (done) => {
        mockFetchResults([
          ['ValueSet?url=some-value-set',
            {
              "resourceType": "Bundle",
              "type": "searchset",
              "total": 0,
              "entry": []
            }]
        ]);
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR4';
        const res = fhirpath.evaluate(
          {
            "resourceType": "QuestionnaireResponse",
            "item": [
              {
                "linkId": "link-1",
                "item": [
                  {
                    "linkId": "link-1.1",
                    "item": [
                      {
                        "linkId": "link-1.1.1",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-1",
                              "system": "some-system-1"
                            }
                          }
                        ]
                      },{
                        "linkId": "link-1.1.2",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-2",
                              "system": "some-system-2"
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }, `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: {
              "resourceType": "Questionnaire",
              "item": [
                {
                  "linkId": "link-1",
                  "type": "group",
                  "item": [
                    {
                      "linkId": "link-1.1",
                      "type": "group",
                      "item": [{
                        "linkId": "link-1.1.1",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r4_model, { async: true, terminologyUrl }
        );
        res.then(() => {
          done('The expression must fail if the corresponding value set cannot be resolved.');
        }, (err) => {
          if (err === 'Cannot resolve the corresponding value set: some-value-set') {
            done();
          } else {
            done(err);
          }
        })
      });

      it("should cause an expression to fail if a corresponding code system cannot be resolved", (done) => {
        mockFetchResults([
          ['ValueSet?url=some-value-set',
            {
              "resourceType": "Bundle",
              "type": "searchset",
              "total": 1,
              "entry": [{
                "resource": {
                  "resourceType": "ValueSet",
                  "compose": {
                    "include": [{
                      "system": "some-system-1",
                      "concept": [{
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 1
                          }
                        ]
                      }, {
                        "code": "some-code-2",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 2
                          }
                        ]
                      }]
                    },{
                      "system": "some-system-2",
                      "concept": [{
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 10
                          }
                        ]
                      }, {
                        "code": "some-code-2"
                      }]
                    }]
                  }
                }
              } ]
            }],
          ['/CodeSystem?code=some-code-2&system=some-system-2',
            {
              "resourceType": "Bundle",
              "type": "searchset",
              "total": 0,
              "entry": []
            }]
        ]);
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR4';
        const res = fhirpath.evaluate(
          {
            "resourceType": "QuestionnaireResponse",
            "item": [
              {
                "linkId": "link-1",
                "item": [
                  {
                    "linkId": "link-1.1",
                    "item": [
                      {
                        "linkId": "link-1.1.1",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-1",
                              "system": "some-system-1"
                            }
                          }
                        ]
                      },{
                        "linkId": "link-1.1.2",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-2",
                              "system": "some-system-2"
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }, `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: {
              "resourceType": "Questionnaire",
              "item": [
                {
                  "linkId": "link-1",
                  "type": "group",
                  "item": [
                    {
                      "linkId": "link-1.1",
                      "type": "group",
                      "item": [{
                        "linkId": "link-1.1.1",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r4_model, { async: true, terminologyUrl }
        );
        res.then(() => {
          done('The expression must fail if the corresponding value set cannot be resolved.');
        }, (err) => {
          if (err === 'Cannot resolve the corresponding code system: some-system-2') {
            done();
          } else {
            done(err);
          }
        })
      });

    });
  });

});
