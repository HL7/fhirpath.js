const fhirpath = require("../src/fhirpath");
const dstu2_model = require("../fhir-context/dstu2");
const stu3_model = require("../fhir-context/stu3");
const r4_model = require("../fhir-context/r4");
const r5_model = require("../fhir-context/r5");
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
      it("should return the correct result when getting scores from the R4 Questionnaire resource", () => {
        const res = fhirpath.evaluate(
          input.questionnaireResponse,
          `%context.repeat(item).answer.${fnName}().sum()`,
          {
            questionnaire: input.questionnaire
          }, r4_model);
        expect(res).toStrictEqual([15]);
      });

      it("should return the correct result when getting scores from the STU3 Questionnaire resource", () => {
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
          },
          `%context.repeat(item).answer.${fnName}().sum()`,
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
                        "option": [{
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 1
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-1",
                            "system": "some-system-1"
                          }
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 2
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-2",
                            "system": "some-system-1"
                          }
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 10
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-1",
                            "system": "some-system-2"
                          }
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 20
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-2",
                            "system": "some-system-2"
                          }
                        }]
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "option": [{
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 1
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-1",
                            "system": "some-system-1"
                          }
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 2
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-2",
                            "system": "some-system-1"
                          }
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 10
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-1",
                            "system": "some-system-2"
                          }
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 20
                            }
                          ],
                          "valueCoding": {
                            "code": "some-code-2",
                            "system": "some-system-2"
                          }
                        }]
                      }]
                    }
                  ]
                }
              ]
            }
          }, stu3_model);
        expect(res).toStrictEqual([21]);
      });

      it("should return the correct result when getting scores from the DSTU2 Questionnaire resource", () => {
        const res = fhirpath.evaluate(
          {
            "resourceType": "QuestionnaireResponse",
            "group": [
              {
                "linkId": "link-1",
                "group": [
                  {
                    "linkId": "link-1.1",
                    "question": [
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
          },
          `%context.repeat(group).question.answer.${fnName}().sum()`,
          {
            questionnaire: {
              "resourceType": "Questionnaire",
              "group": [
                {
                  "linkId": "link-1",
                  "group": [
                    {
                      "linkId": "link-1.1",
                      "question": [{
                        "linkId": "link-1.1.1",
                        "type": "choice",
                        "option": [{
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 1
                            }
                          ],
                          "code": "some-code-1",
                          "system": "some-system-1"
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 2
                            }
                          ],
                          "code": "some-code-2",
                          "system": "some-system-1"
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 10
                            }
                          ],
                          "code": "some-code-1",
                          "system": "some-system-2"
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 20
                            }
                          ],
                          "code": "some-code-2",
                          "system": "some-system-2"
                        }]
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "option": [{
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 1
                            }
                          ],
                          "code": "some-code-1",
                          "system": "some-system-1"
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 2
                            }
                          ],
                          "code": "some-code-2",
                          "system": "some-system-1"
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 10
                            }
                          ],
                          "code": "some-code-1",
                          "system": "some-system-2"
                        }, {
                          "extension": [
                            {
                              "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                              "valueDecimal": 20
                            }
                          ],
                          "code": "some-code-2",
                          "system": "some-system-2"
                        }]
                      }]
                    }
                  ]
                }
              ]
            }
          }, dstu2_model);
        expect(res).toStrictEqual([21]);
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
        expect(res).toThrow('Questionnaire answer options (or value set) with this linkId were not found: /44250-9-unlinked-item.');
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
          ['/CodeSystem?url=some-system&_elements=property',
            {
              "resourceType": "Bundle",
              "entry": [{
                "resource": {
                  "property": [{
                    "code" : "itemWeight",
                    "uri": "http://hl7.org/fhir/concept-properties"
                  }],
                }
              }]
            }],
          ['/CodeSystem/$lookup?code=some-code-2&system=some-system&property=itemWeight',
            {
              "resourceType": "Parameters",
              "parameter": [ {
                "name": "property",
                "part": [ {
                  "name": "code",
                  "valueCode": "itemWeight"
                }, {
                  "name": "value",
                  "valueDecimal": 4
                } ]
              } ]
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

      it("should return the correct result when getting scores using the itemWeight property from a value set retrieved from the terminology server", (done) => {
        mockFetchResults([
          ['ValueSet/$expand?url=some-value-set-1',
            {
              "resourceType": "ValueSet",
              "expansion": {
                "property": [{
                  "code" : "itemWeight",
                  "uri": "http://hl7.org/fhir/concept-properties"
                }],
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-1",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 1
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-1",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 2
                  }]
                }, {
                  "code": "some-code-1",
                  "system": "some-system-2",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 10
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-2",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 20
                  }]
                }]
              }
            }
          ]
        ]);
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR5';
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
                        "answerValueSet": "some-value-set-1",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-1",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true, terminologyUrl }
        );
        res.then(r => {
          expect(r).toStrictEqual([21]);
          done();
        }, (err) => {
          done(err)
        })
      });

      it("should return the correct result when getting scores using the ordinal extension from a value set retrieved from the terminology server", (done) => {
        mockFetchResults([
          ['ValueSet/$expand?url=some-value-set-1',
            {
              "resourceType": "ValueSet",
              "expansion": {
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-1",
                  "extension": [
                    {
                      "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                      "valueDecimal": 1
                    }
                  ]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-1",
                  "extension": [
                    {
                      "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                      "valueDecimal": 2
                    }
                  ]
                }, {
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
          ]
        ]);
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR5';
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
                        "answerValueSet": "some-value-set-1",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-1",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true, terminologyUrl }
        );
        res.then(r => {
          expect(r).toStrictEqual([21]);
          done();
        }, (err) => {
          done(err)
        })
      });

      it("should return the correct result when getting scores from a value set and a code system retrieved from terminology server", (done) => {
        mockFetchResults([
          ['ValueSet/$expand?url=some-value-set-2',
            {
              "resourceType": "ValueSet",
              "expansion": {
                "property": [{
                  "code" : "itemWeight",
                  "uri": "http://hl7.org/fhir/concept-properties"
                }],
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-1",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 1
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-1",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 2
                  }]
                }, {
                  "code": "some-code-1",
                  "system": "some-system-2",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 10
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-2"
                }]
              }
            }],
          ['/CodeSystem?url=some-system-2&_elements=property',
            {
              "resourceType": "Bundle",
              "entry": [{
                "resource": {
                  "property": [{
                    "code" : "itemWeight",
                    "uri": "http://hl7.org/fhir/concept-properties"
                  }],
                }
              }]
            }],
          ['/CodeSystem/$lookup?code=some-code-2&system=some-system-2&property=itemWeight',
            {
              "resourceType": "Parameters",
              "parameter": [ {
                "name": "property",
                "part": [ {
                  "name": "code",
                  "valueCode": "itemWeight"
                }, {
                  "name": "value",
                  "valueDecimal": 30
                } ]
              } ]
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
                        "answerValueSet": "some-value-set-2",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-2",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true, terminologyUrl }
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
          ['ValueSet/$expand?url=some-value-set-3',
            null,
            {
              "resourceType": "OperationOutcome",
              "issue": [{
                "severity": "error",
                "code": "processing",
                "diagnostics": "Unable to expand ValueSet"
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
                        "answerValueSet": "some-value-set-3",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-3",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true, terminologyUrl }
        );
        res.then(() => {
          done('The expression must fail if the corresponding value set cannot be resolved.');
        }, (err) => {
          if (err?.issue?.[0]?.diagnostics === 'Unable to expand ValueSet') {
            done();
          } else {
            done(err);
          }
        })
      });

      it("should cause an expression to fail if a corresponding code system cannot be resolved", (done) => {
        mockFetchResults([
          ['ValueSet/$expand?url=some-value-set-4',
            {
              "resourceType": "ValueSet",
              "expansion": {
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-1",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 1
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-1",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 2
                  }]
                }, {
                  "code": "some-code-1",
                  "system": "some-system-2",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 10
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-10"
                }]
              }
            }],
          ['/CodeSystem?url=some-system-1&_elements=property',
            {
              "resourceType": "Bundle",
              "entry": [{
                "resource": {
                  "property": [{
                    "code" : "itemWeight",
                    "uri": "http://hl7.org/fhir/concept-properties"
                  }],
                }
              }]
            }],
          ['/CodeSystem/$lookup?code=some-code-1&system=some-system-1&property=itemWeight',
            null,
            {
              "resourceType": "OperationOutcome",
              "issue": [{
                "severity": "error",
                "code": "processing",
                "diagnostics": "Unable to find some-code-1 in system[some-system-1]"
              }]
            }],
          ['/CodeSystem?url=some-system-10&_elements=property',
            {
              "resourceType": "Bundle",
              "entry": [{
                "resource": {
                  "property": [{
                    "code" : "itemWeight",
                    "uri": "http://hl7.org/fhir/concept-properties"
                  }],
                }
              }]
            }],
          ['/CodeSystem/$lookup?code=some-code-2&system=some-system-10&property=itemWeight',
            null,
            {
              "resourceType": "OperationOutcome",
              "issue": [{
                "severity": "error",
                "code": "processing",
                "diagnostics": "Unable to find some-code-2 in system[some-system-10]"
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
                              "system": "some-system-10"
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
                        "answerValueSet": "some-value-set-4",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-4",
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
          if (err.issue?.[0]?.diagnostics === 'Unable to find some-code-1 in system[some-system-1]') {
            done();
          } else {
            done(err);
          }
        })
      });

      it("should return the correct result when getting scores from a value set contained in the questionnaire using the itemWeight property", () => {
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
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-5",
                  "url": "some-value-set-url-5",
                  "expansion": {
                    "property": [{
                      "code" : "itemWeight",
                      "uri": "http://hl7.org/fhir/concept-properties"
                    }],
                    "contains": [{
                      "code": "some-code-1",
                      "system": "some-system-2",
                      "property": [{
                        "code" : "itemWeight",
                        "valueDecimal": 10
                      }],
                      "contains": [{
                        "code": "some-code-1",
                        "system": "some-system-1",
                        "property": [{
                          "code" : "itemWeight",
                          "valueDecimal": 1
                        }]
                      }]
                    }, {
                      "code": "some-code-2",
                      "system": "some-system-2",
                      "property": [{
                        "code" : "itemWeight",
                        "valueDecimal": 20
                      }],
                      "contains": [{
                        "code": "some-code-2",
                        "system": "some-system-1",
                        "property": [{
                          "code" : "itemWeight",
                          "valueDecimal": 2
                        }]
                      }]
                    }]
                  }
                }
              ],
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
                        "answerValueSet": "#some-value-set-id-5",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-url-5",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true }
        );
        expect(res).toStrictEqual([21]);
      });

      it("should return the correct result when getting scores from a value set contained in the questionnaire using the ordinal extension", () => {
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
                              "system": "some-system-2"
                            }
                          }
                        ]
                      },{
                        "linkId": "link-1.1.2",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-2",
                              "system": "some-system-1"
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
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-5",
                  "url": "some-value-set-url-5",
                  "expansion": {
                    "contains": [{
                      "code": "some-code-1",
                      "system": "some-system-2",
                      "extension": [
                        {
                          "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                          "valueDecimal": 10
                        }
                      ],
                      "contains": [{
                        "code": "some-code-1",
                        "system": "some-system-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 1
                          }
                        ]
                      }]
                    }, {
                      "code": "some-code-2",
                      "system": "some-system-2",
                      "extension": [
                        {
                          "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                          "valueDecimal": 20
                        }
                      ],
                      "contains": [{
                        "code": "some-code-2",
                        "system": "some-system-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                            "valueDecimal": 2
                          }
                        ]
                      }]
                    }]
                  }
                }
              ],
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
                        "answerValueSet": "#some-value-set-id-5",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-url-5",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true }
        );
        expect(res).toStrictEqual([12]);
      });

      it("should return the correct result when getting scores from an expanded value set using the itemWeight property", (done) => {
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR5';
        mockFetchResults([
          [`${terminologyUrl}/ValueSet/$expand`,
            {
              "resourceType": "ValueSet",
              "id": "some-value-set-id-6",
              "url": "some-value-set-url-6",
              "expansion": {
                "property": [{
                  "code" : "itemWeight",
                  "uri": "http://hl7.org/fhir/concept-properties"
                }],
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-2",
                  "property": [{
                    "code" : "itemWeight",
                    "valueDecimal": 10
                  }],
                  "contains": [{
                    "code": "some-code-1",
                    "system": "some-system-1",
                    "property": [{
                      "code" : "itemWeight",
                      "valueDecimal": 1
                    }]
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-2",
                      "property": [{
                        "code" : "itemWeight",
                        "valueDecimal": 20
                      }],
                  "contains": [{
                    "code": "some-code-2",
                    "system": "some-system-1",
                    "property": [{
                      "code" : "itemWeight",
                      "valueDecimal": 2
                    }]
                  }]
                }]
              }
            }]
        ]);
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
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-6",
                  "url": "some-value-set-url-6"
                }
              ],
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
                        "answerValueSet": "#some-value-set-id-6",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-url-6",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true, terminologyUrl }
        );

        res.then(r => {
          expect(r).toStrictEqual([21]);
          done();
        }, (err) => {
          done(err)
        });
      });

      it("should return the correct result when getting scores from an expanded value set using the ordinal extension", (done) => {
        const terminologyUrl = 'https://lforms-fhir.nlm.nih.gov/baseR4';
        mockFetchResults([
          [`${terminologyUrl}/ValueSet/$expand`,
            {
              "resourceType": "ValueSet",
              "id": "some-value-set-id-6",
              "url": "some-value-set-url-6",
              "expansion": {
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-2",
                  "extension": [
                    {
                      "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                      "valueDecimal": 10
                    }
                  ],
                  "contains": [{
                    "code": "some-code-1",
                    "system": "some-system-1",
                    "extension": [
                      {
                        "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                        "valueDecimal": 1
                      }
                    ]
                  }]
                }, {
                  "code": "some-code-2",
                  "system": "some-system-2",
                  "extension": [
                    {
                      "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                      "valueDecimal": 20
                    }
                  ],
                  "contains": [{
                    "code": "some-code-2",
                    "system": "some-system-1",
                    "extension": [
                      {
                        "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                        "valueDecimal": 2
                      }
                    ]
                  }]
                }]
              }
            }]
        ]);
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
                              "code": "some-code-2",
                              "system": "some-system-1"
                            }
                          }
                        ]
                      },{
                        "linkId": "link-1.1.2",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-1",
                              "system": "some-system-1"
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
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-6",
                  "url": "some-value-set-url-6"
                }
              ],
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
                        "answerValueSet": "#some-value-set-id-6",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-url-6",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r4_model, { async: true, terminologyUrl }
        );

        res.then(r => {
          expect(r).toStrictEqual([3]);
          done();
        }, (err) => {
          done(err)
        });
      });

      it("should return the correct result when getting scores from a contained value set and a code system from terminology server", (done) => {
        mockFetchResults([
          ['/CodeSystem?url=some-system-20&_elements=property',
            {
              "resourceType": "Bundle",
              "entry": [{
                "resource": {
                  "resourceType": "CodeSystem",
                  "property": [{
                    "code" : "itemWeight",
                    "uri": "http://hl7.org/fhir/concept-properties"
                  }],
                }
              }]
            }],
          ['/CodeSystem/$lookup?code=some-code-2&system=some-system-20&property=itemWeight',
            {
              "resourceType": "Parameters",
              "parameter": [ {
                "name": "property",
                "part": [ {
                  "name": "code",
                  "valueCode": "itemWeight"
                }, {
                  "name": "value",
                  "valueDecimal": 30
                } ]
              } ]
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
                              "system": "some-system-20"
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
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-7",
                  "url": "some-value-set-url-7",
                  "expansion": {
                    "property": [{
                      "code" : "itemWeight",
                      "uri": "http://hl7.org/fhir/concept-properties"
                    }],
                    "contains": [{
                      "code": "some-code-1",
                      "system": "some-system-2",
                      "property": [{
                        "code" : "itemWeight",
                        "valueDecimal": 10
                      }],
                      "contains": [{
                        "code": "some-code-1",
                        "system": "some-system-1",
                        "property": [{
                          "code" : "itemWeight",
                          "valueDecimal": 1
                        }]
                      }]
                    }, {
                      "code": "some-code-2",
                      "system": "some-system-20",
                      "contains": [{
                        "code": "some-code-2",
                        "system": "some-system-1",
                        "property": [{
                          "code" : "itemWeight",
                          "valueDecimal": 2
                        }]
                      }]
                    }]
                  }
                }
              ],
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
                        "answerValueSet": "#some-value-set-id-7",
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "answerValueSet": "some-value-set-url-7",
                      }]
                    }
                  ]
                }
              ]
            }
          }, r5_model, { async: true, terminologyUrl }
        );
        res.then(r => {
          expect(r).toStrictEqual([31]);
          done();
        }, (err) => {
          done(err)
        })
      });

      it("should return the correct result when getting scores from an STU3 value set contained in the questionnaire", () => {
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
                              "system": "some-system-2"
                            }
                          }
                        ]
                      },{
                        "linkId": "link-1.1.2",
                        "answer": [
                          {
                            "valueCoding": {
                              "code": "some-code-2",
                              "system": "some-system-1"
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
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-5",
                  "url": "some-value-set-url-5",
                  "expansion": {
                    "contains": [{
                      "code": "some-code-1",
                      "system": "some-system-1",
                      "extension": [
                        {
                          "url": "http://hl7.org/fhir/StructureDefinition/valueset-ordinalValue",
                          "valueDecimal": 1
                        }
                      ]
                    }, {
                      "code": "some-code-1",
                      "system": "some-system-2",
                      "extension": [
                        {
                          "url": "http://hl7.org/fhir/StructureDefinition/valueset-ordinalValue",
                          "valueDecimal": 10
                        }
                      ]
                    },
                      {
                        "code": "some-code-2",
                        "system": "some-system-1",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/valueset-ordinalValue",
                            "valueDecimal": 2
                          }
                        ]
                      }, {
                        "code": "some-code-2",
                        "system": "some-system-2",
                        "extension": [
                          {
                            "url": "http://hl7.org/fhir/StructureDefinition/valueset-ordinalValue",
                            "valueDecimal": 20
                          }
                        ]
                      }]
                  }
                }
              ],
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
                        "options": {
                          "reference": "#some-value-set-id-5"
                        }
                      },{
                        "linkId": "link-1.1.2",
                        "type": "choice",
                        "options": {
                          "reference": "some-value-set-url-5"
                        }
                      }]
                    }
                  ]
                },
                {
                  "type": "decimal",
                  "extension": [
                    {
                      "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
                      "valueExpression": {
                        "description": "Total score calculation",
                        "language": "text/fhirpath",
                        "expression": "%resource.repeat(item).answer.weight().sum()"
                      }
                    }
                  ],
                  "required": false,
                  "linkId": "link-2",
                  "code": [
                    {
                      "system": "totalScoreSystem",
                      "code": "totalScoreCode",
                      "display": "Total score"
                    }
                  ],
                  "text": "Total score"
                }
              ]
            }
          }, stu3_model, { async: true }
        );
        expect(res).toStrictEqual([12]);
      });

    });
  });

});
