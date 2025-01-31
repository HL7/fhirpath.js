const fhirpath = require("../src/fhirpath");
const dstu2_model = require("../fhir-context/dstu2");
const stu3_model = require("../fhir-context/stu3");
const r4_model = require("../fhir-context/r4");
const r5_model = require("../fhir-context/r5");
const {mockRestore, mockFetchResults} = require('./mock-fetch-results');

describe("supplements", () => {

  ['weight', 'ordinal'].forEach(fnName => {
    [
      {modelName : 'R5', model: r5_model},
      {modelName : 'R4', model: r4_model}
    ].forEach(({modelName, model}) => {
      describe(`${fnName}() in ${modelName}`, () => {


        afterEach(() => {
          mockRestore();
        });


        it('should return a score from the Observation resource', (done) => {
          let result;
          if (modelName === 'R5') {
            mockFetchResults([
              ['/CodeSystem?url=some-system-1&_elements=property',
                {
                  "resourceType": "Bundle",
                  "entry": [{
                    "resource": {
                      "property": [{
                        "code": "itemWeight",
                        "uri": "http://hl7.org/fhir/concept-properties#itemWeight"
                      }],
                    }
                  }]
                }],
              ['/CodeSystem/$lookup?code=some-code-1&system=some-system-1&property=itemWeight',
                {
                  "resourceType": "Parameters",
                  "parameter": [
                    {
                      "name": "property",
                      "part": [
                        {
                          "name": "code",
                          "valueCode": "itemWeight"
                        },
                        {
                          "name": "value",
                          "valueDecimal": 4
                        }
                      ]
                    }
                  ]
                }]
            ]);
            result = [3, 4];
          } else {
            // for R4
            mockFetchResults([
              ['/CodeSystem?url=some-system-1',
                {
                  "resourceType": "Bundle",
                  "entry": [{
                    "resource": {
                      "url": "some-system-1",
                      "concept": [{
                        "code" : "some-code-1",
                        "extension": [{
                          "url": "http://hl7.org/fhir/StructureDefinition/ordinalValue",
                          "valueDecimal": 5
                        }]
                      }],
                    }
                  }]
                }]
            ]);
            result = [3, 5];
          }

          const res = fhirpath.evaluate({
              "resourceType": "Observation",
              "id": "example",
              "valueCodeableConcept": {
                "coding": [
                  {
                    "system": "some-system-1",
                    "code": "some-code-1",
                    "extension": [
                      {
                        "url": model.score.extensionURI,
                        "valueDecimal": 3
                      }
                    ]
                  }, {
                    "system": "some-system-1",
                    "code": "some-code-1",
                  }
                ]
              }
            },
            `%context.value.coding.${fnName}()`,
            null,
            model,
            {async: true, terminologyUrl: 'https://some-server'}
          );

          Promise.resolve(res).then(r => {
            expect(r).toStrictEqual(result);
            done();
          }, (err) => {
            done(err)
          })
        });


        it('should return scores from the QuestionnaireResponse resource', (done) => {
          mockFetchResults([[
            'R4/CodeSystem?url=some-system-5',
            {
              entry: [{
                resource: {
                  "resourceType": "CodeSystem",
                  "url": "some-system-5",
                  "concept": [{
                    "code": "some-code-1",
                    "extension": [
                      {
                        "url": model.score.extensionURI,
                        "valueDecimal": 400000
                      }
                    ]
                  }]
                }
              }]
            }
          ], [
            'R5/CodeSystem?url=some-system-5&_elements=property',
            {
              "resourceType": "Bundle",
              "entry": [{
                "resource": {
                  "resourceType": "CodeSystem",
                  "property": [{
                    "code" : "itemWeight",
                    "uri":  model.score.propertyURI
                  }],
                }
              }]
            }
          ], [
            'R5/CodeSystem/$lookup?code=some-code-1&system=some-system-5&property=itemWeight',
            {
              "resourceType": "Parameters",
              "parameter": [ {
                "name": "property",
                "part": [ {
                  "name": "code",
                  "valueCode": "itemWeight"
                }, {
                  "name": "value",
                  "valueDecimal": 400000
                } ]
              } ]
            }
          ]]);

          let questionnaireResponse;
          let questionnaire;

          // QuestionnaireResponse for R4/R5
          questionnaireResponse = {
            "resourceType": "QuestionnaireResponse",
            "item": [{
              "linkId": "link-1",
              "item": [{
                "linkId": "link-1.1",
                "item": [{
                  "linkId": "link-1.1.1",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-1",
                      "system": "some-system-1",
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 1
                        }
                      ]
                    }
                  }]
                }, {
                  "linkId": "link-1.1.2",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-2",
                      "system": "some-system-1"
                    }
                  }]
                }, {
                  "linkId": "link-1.1.3",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-1",
                      "system": "some-system-2"
                    }
                  }]
                }, {
                  "linkId": "link-1.1.4",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-1",
                      "system": "some-system-3"
                    }
                  }]
                }, {
                  "linkId": "link-1.1.5",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-1",
                      "system": "some-system-4"
                    }
                  }]
                }, {
                  "linkId": "link-1.1.6",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-1",
                      "system": "some-system-5"
                    }
                  }]
                }, {
                  "linkId": "link-1.1.7",
                  answer: [{
                    "valueInteger": 1,
                    "_valueInteger": {
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 60000000
                        }
                      ]
                    }
                  }]
                }, {
                  "linkId": "link-1.1.8",
                  answer: [{
                    "valueInteger": 2
                  }]
                }]
              }]
            }]
          };

          // Questionnaires for R4/R5 have differences in the "contained" section
          questionnaire = {
            "resourceType": "Questionnaire",
            "contained": [
              modelName === 'R5' ? {
                "resourceType": "ValueSet",
                "id": "some-value-set-id-1",
                "url": "some-value-set-url-1",
                "expansion": {
                  "property": [{
                    "code": "itemWeight",
                    "uri": model.score.propertyURI
                  }],
                  "contains": [{
                    "system": "some-system-1",
                    "code": "some-code-1",
                    "property": [{
                      "code": "itemWeight",
                      "valueDecimal": 2
                    }]
                  }, {
                    "system": "some-system-1",
                    "code": "some-code-2",
                    "property": [{
                      "code": "itemWeight",
                      "valueDecimal": 10
                    }]
                  }]
                }
              } : {
                "resourceType": "ValueSet",
                "id": "some-value-set-id-1",
                "url": "some-value-set-url-1",
                "compose": {
                  "include": [{
                    "system": "some-system-1",
                    "concept": [{
                      "code": "some-code-1",
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 2
                        }
                      ]
                    }, {
                      "code": "some-code-2",
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 10
                        }
                      ]
                    }]
                  }]
                }
              }, modelName === 'R5' ? {
                "resourceType": "CodeSystem",
                "url": "some-system-4",
                "property": [{
                  "code": "itemWeight",
                  "uri": model.score.propertyURI
                }],
                "concept": [{
                  "code": "some-code-1",
                  "property": [{
                    "code": "itemWeight",
                    "valueDecimal": 30000
                  }]
                }]
              } : {
                "resourceType": "CodeSystem",
                "url": "some-system-4",
                "concept": [{
                  "code": "some-code-1",
                  "extension": [{
                    "url": model.score.extensionURI,
                    "valueDecimal": 30000
                  }]
                }]
              }
            ],
            "item": [{
              "linkId": "link-1",
              "type": "group",
              "item": [{
                "linkId": "link-1.1",
                "type": "group",
                "item": [{
                  "linkId": "link-1.1.1",
                  "type": "choice",
                  "answerValueSet": "#some-value-set-id-1"
                }, {
                  "linkId": "link-1.1.2",
                  "type": "choice",
                  "answerValueSet": "#some-value-set-id-1"
                }, {
                  "linkId": "link-1.1.3",
                  "type": "choice",
                  "answerOption": [{
                    "valueCoding": {
                      "system": "some-system-2",
                      "code": "some-code-1",
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 200
                        }
                      ],
                    }
                  }]
                }, {
                  "linkId": "link-1.1.4",
                  "type": "choice",
                  "answerOption": [{
                    "valueCoding": {
                      "system": "some-system-3",
                      "code": "some-code-1",
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 2000
                        }
                      ]
                    }
                  }]
                }, {
                  "linkId": "link-1.1.5",
                  "type": "choice",
                  "answerValueSet": "some-value-set-url-3"
                }, {
                  "linkId": "link-1.1.6",
                  "type": "choice",
                  "answerValueSet": "some-value-set-url-4"
                }, {
                  "linkId": "link-1.1.7",
                  "type": "choice",
                  "answerOption": [{
                    "valueInteger": 1,
                    "_valueInteger": {
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 70000000
                        }
                      ]
                    }
                  }]
                }, {
                  "linkId": "link-1.1.8",
                  "type": "choice",
                  "answerOption": [{
                    "valueInteger": 2,
                    "_valueInteger": {
                      "extension": [
                        {
                          "url": model.score.extensionURI,
                          "valueDecimal": 5000000
                        }
                      ]
                    }
                  }]
                }]
              }]
            }]
          };

          const result1 = calcQuestionnaireResponseWeightSum({
            basePath: '%context.repeat(item).answer',
            modelName, model, questionnaireResponse, questionnaire
          });

          const result2 = calcQuestionnaireResponseWeightSum({
            basePath: '%context.repeat(item).answer.value',
            modelName, model, questionnaireResponse, questionnaire
          });

          Promise.all([result1, result2]).then((r) => {
            expect(r[0]).toStrictEqual([65432211]);
            expect(r[1]).toStrictEqual([65432211]);
            done();
          });

        });


        it('should return scores from the ValueSet resource', (done) => {
          mockFetchResults([[
            'R5/CodeSystem?url=some-system-10&_elements=property',
            {
              "resourceType": "Bundle",
              "entry": [{
                "resource": {
                  "resourceType": "CodeSystem",
                  "property": [{
                    "code" : "itemWeight",
                    "uri":  model.score.propertyURI
                  }],
                }
              }]
            }
          ], [
            'R5/CodeSystem/$lookup?code=some-code-20&system=some-system-10&property=itemWeight',
            {
              "resourceType": "Parameters",
              "parameter": [ {
                "name": "property",
                "part": [ {
                  "name": "code",
                  "valueCode": "itemWeight"
                }, {
                  "name": "value",
                  "valueDecimal": 10
                } ]
              } ]
            }
          ], [
            'R4/CodeSystem?url=some-system-10',
            {
              entry: [{
                resource: {
                  "resourceType": "CodeSystem",
                  "url": "some-system-10",
                  "concept": [{
                    "code": "some-code-20",
                    "extension": [
                      {
                        "url": model.score.extensionURI,
                        "valueDecimal": 10
                      }
                    ]
                  }]
                }
              }]
            }
          ]]);

          const valueSet = modelName === 'R5' ? {
            "resourceType": "ValueSet",
            "id": "some-value-set-id-1",
            "url": "some-value-set-url-1",
            "expansion": {
              "property": [{
                "code": "itemWeight",
                "uri": model.score.propertyURI
              }],
              "contains": [{
                "system": "some-system-10",
                "code": "some-code-10",
                "property": [{
                  "code": "itemWeight",
                  "valueDecimal": 2
                }]
              }, {
                "system": "some-system-10",
                "code": "some-code-20"
              }]
            }
          } : {
            "resourceType": "ValueSet",
            "id": "some-value-set-id-1",
            "url": "some-value-set-url-1",
            "compose": {
              "include": [{
                "system": "some-system-10",
                "concept": [{
                  "code": "some-code-10",
                  "extension": [
                    {
                      "url": model.score.extensionURI,
                      "valueDecimal": 2
                    }
                  ]
                }, {
                  "code": "some-code-20"
                }]
              }]
            }
          };

          const basePath = modelName === 'R5' ? 'ValueSet.expansion.contains'
            : 'ValueSet.compose.include.concept';

          const res = fhirpath.evaluate(valueSet,
            `${basePath}.${fnName}()`,
            null,
            model,
            {async: true, terminologyUrl: `https://some-server-${modelName}`}
          );

          Promise.resolve(res).then(r => {
            expect(r).toStrictEqual([2, 10]);
            done();
          }, (err) => {
            done(err)
          })

        });

        it('should return scores from the CodeSystem resource', () => {
          const codeSystem = modelName === 'R5' ? {
            "resourceType": "CodeSystem",
            "property": [{
              "code" : "itemWeight",
              "uri":  model.score.propertyURI
            }],
            "concept": [{
              "code": "some-code-1",
              "property": [{
                "code": "itemWeight",
                "valueDecimal": 3
              }]
            }, {
              "code": "some-code-2",
              "property": [{
                "code": "itemWeight",
                "valueDecimal": 5
              }]
            }]
          } : {
            "resourceType": "CodeSystem",
            "url": "some-system-20",
            "concept": [{
              "code": "some-code-1",
              "extension": [
                {
                  "url": model.score.extensionURI,
                  "valueDecimal": 3
                }
              ]
            }, {
              "code": "some-code-2",
              "extension": [
                {
                  "url": model.score.extensionURI,
                  "valueDecimal": 5
                }
              ]
            }]
          };

          const basePath = 'CodeSystem.concept';

          const res = fhirpath.evaluate(codeSystem,
            `${basePath}.${fnName}()`,
            null,
            model,
            {async: true, terminologyUrl: `https://some-server-${modelName}`}
          );

          expect(res).toStrictEqual([3, 5]);
        });


        it('should throw an error if a questionnaire item doesn\'t exists', () => {
          const questionnaireResponse = {
            "resourceType": "QuestionnaireResponse",
            "item": [
              {
                "linkId": "non-existent-in-questionnaire-link-id",
                "answer": [
                  {
                    "valueCoding": {
                      "system": "some-system-1",
                      "code": "some-code-1",
                    }
                  }
                ]
              }
            ]
          };

          const questionnaire = {
            "resourceType": "Questionnaire",
            "item": []
          };

          const res = () => calcQuestionnaireResponseWeightSum({
            basePath: '%context.repeat(item).answer',
            modelName, model, questionnaireResponse, questionnaire
          });
          expect(res).toThrow('Questionnaire item with this linkId were not found: non-existent-in-questionnaire-link-id.');
        });


        it('should throw an error when getting scores for answers that doesn\'t exists in the Questionnaire', () => {
          const questionnaireResponse = {
            "resourceType": "QuestionnaireResponse",
            "item": [{
              "linkId": "some-group-id",
              "item": [{
                "linkId": "a-questionnaire-link-id",
                "answer": [{
                  "valueCoding": {
                    "system": "some-system-1",
                    "code": "some-code-1",
                  }
                }]
              }]
            }]
          };

          const questionnaire = {
            "resourceType": "Questionnaire",
            "item": [{
              "linkId": "some-group-id",
              "type": "group",
              "item": [{
                "linkId": "a-questionnaire-link-id",
                "type": "choice"
              }]
            }]
          };

          const res = () => calcQuestionnaireResponseWeightSum({
            basePath: '%context.repeat(item).answer',
            modelName, model, questionnaireResponse, questionnaire
          });
          expect(res).toThrow('Questionnaire answer options (or value set) with this linkId were not found: a-questionnaire-link-id.');
        });


        it( 'should throw an error when questionnaire item has link to a non-existing contained value set', () => {
          const questionnaireResponse = {
            "resourceType": "QuestionnaireResponse",
            "item": [{
              "linkId": "link-1",
              "item": [{
                "linkId": "link-1.1",
                "item": [{
                  "linkId": "link-1.1.1",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-2",
                      "system": "some-system-1"
                    }
                  }]
                }, {
                  "linkId": "link-1.1.2",
                  "answer": [{
                    "valueCoding": {
                      "code": "some-code-1",
                      "system": "some-system-1"
                    }
                  }]
                }]
              }]
            }]
          };

          const questionnaire = {
            "resourceType": "Questionnaire",
            "item": [{
              "linkId": "link-1",
              "type": "group",
              "item": [{
                "linkId": "link-1.1",
                "type": "group",
                "item": [{
                  "linkId": "link-1.1.1",
                  "type": "choice",
                  "answerValueSet": "#non-existent-value-set-id"
                }, {
                  "linkId": "link-1.1.2",
                  "type": "choice",
                  "answerValueSet": "#non-existent-value-set-id"
                }]
              }]
            }]
          };

          const res = () => calcQuestionnaireResponseWeightSum({
            basePath: '%context.repeat(item).answer',
            modelName, model, questionnaireResponse, questionnaire
          });
          expect(res).toThrow('Cannot find a contained value set with id: non-existent-value-set-id.');
        });


      });
    });


    [
      {modelName : 'STU3', model: stu3_model},
      {modelName : 'DSTU2', model: dstu2_model}
    ].forEach(({modelName, model}) => {
      describe(`${fnName}() in ${modelName}`, () => {


        it('should throw an error when getting scores from the QuestionnaireResponse resource', () => {
          let questionnaireResponse;
          let questionnaire;
          const scoreExtensionURI ='http://hl7.org/fhir/StructureDefinition/iso21090-CO-value';

          if (modelName === 'DSTU2') {
            questionnaireResponse = {
              "resourceType": "QuestionnaireResponse",
              "group": [{
                "linkId": "link-1",
                "group": [{
                  "linkId": "link-1.1",
                  "question": [{
                    "linkId": "link-1.1.1",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-1",
                        "extension": [
                          {
                            "url": scoreExtensionURI,
                            "valueDecimal": 1
                          }
                        ]
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.2",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-2",
                        "system": "some-system-1"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.3",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-2"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.4",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-3"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.5",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-4"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.6",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-5"
                      }
                    }]
                  }]
                }]
              }]
            };

            questionnaire = {
              "resourceType": "Questionnaire",
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-1",
                  "url": "some-value-set-url-1",
                  "expansion": {
                    "contains": [{
                      "code": "some-code-1",
                      "system": "some-system-1",
                      "extension": [
                        {
                          "url": scoreExtensionURI,
                          "valueDecimal": 2
                        }
                      ]
                    }, {
                      "code": "some-code-2",
                      "system": "some-system-1",
                      "extension": [
                        {
                          "url": scoreExtensionURI,
                          "valueDecimal": 10
                        }
                      ]
                    }]
                  }
                }, {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-2",
                  "url": "some-value-set-url-2",
                  "compose": {
                    "include": [{
                      "system": "some-system-2",
                      "concept": [{
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": scoreExtensionURI,
                            "valueDecimal": 200
                          }
                        ]
                      }]
                    }]
                  },
                  "codeSystem": {
                    "system": "some-system-3",
                    "concept": [{
                      "code": "some-code-1",
                      "extension": [
                        {
                          "url": scoreExtensionURI,
                          "valueDecimal": 2000
                        }
                      ]
                    }]
                  }
                }, {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-3",
                  "url": "some-value-set-url-3",
                }
              ],
              "group": [{
                "linkId": "link-1",
                "type": "group",
                "group": [{
                  "linkId": "link-1.1",
                  "type": "group",
                  "question": [{
                    "linkId": "link-1.1.1",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-1"
                    }
                  }, {
                    "linkId": "link-1.1.2",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-1"
                    }
                  }, {
                    "linkId": "link-1.1.3",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-2"
                    }
                  }, {
                    "linkId": "link-1.1.4",
                    "type": "choice",
                    "options": {
                      "reference": "some-value-set-url-2"
                    }
                  }, {
                    "linkId": "link-1.1.5",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-3"
                    }
                  }, {
                    "linkId": "link-1.1.6",
                    "type": "choice",
                    "options": {
                      "reference": "some-value-set-url-4"
                    }
                  }]
                }]
              }]
            };
          } else {

            // QuestionnaireResponse for STU3
            questionnaireResponse = {
              "resourceType": "QuestionnaireResponse",
              "item": [{
                "linkId": "link-1",
                "item": [{
                  "linkId": "link-1.1",
                  "item": [{
                    "linkId": "link-1.1.1",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-1",
                        "extension": [
                          {
                            "url": scoreExtensionURI,
                            "valueDecimal": 1
                          }
                        ]
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.2",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-2",
                        "system": "some-system-1"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.3",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-2"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.4",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-3"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.5",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-4"
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.6",
                    "answer": [{
                      "valueCoding": {
                        "code": "some-code-1",
                        "system": "some-system-5"
                      }
                    }]
                  }]
                }]
              }]
            };

            questionnaire = {
              "resourceType": "Questionnaire",
              "contained": [
                {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-1",
                  "url": "some-value-set-url-1",
                  "expansion": {
                    "contains": [{
                      "code": "some-code-1",
                      "system": "some-system-1",
                      "extension": [
                        {
                          "url": scoreExtensionURI,
                          "valueDecimal": 2
                        }
                      ]
                    }, {
                      "code": "some-code-2",
                      "system": "some-system-1",
                      "extension": [
                        {
                          "url": scoreExtensionURI,
                          "valueDecimal": 10
                        }
                      ]
                    }]
                  }
                }, {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-2",
                  "url": "some-value-set-url-2",
                  "compose": {
                    "include": [{
                      "system": "some-system-2",
                      "concept": [{
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": scoreExtensionURI,
                            "valueDecimal": 200
                          }
                        ]
                      }]
                    }]
                  }
                }, {
                  "resourceType": "ValueSet",
                  "id": "some-value-set-id-3",
                  "url": "some-value-set-url-3",
                }
              ],
              "item": [{
                "linkId": "link-1",
                "type": "group",
                "item": [{
                  "linkId": "link-1.1",
                  "type": "group",
                  "item": [{
                    "linkId": "link-1.1.1",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-1"
                    }
                  }, {
                    "linkId": "link-1.1.2",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-1"
                    }
                  }, {
                    "linkId": "link-1.1.3",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-2"
                    }
                  }, {
                    "linkId": "link-1.1.4",
                    "type": "choice",
                    "option": [{
                      "valueCoding": {
                        "system": "some-system-3",
                        "code": "some-code-1",
                        "extension": [
                          {
                            "url": scoreExtensionURI,
                            "valueDecimal": 2000
                          }
                        ]
                      }
                    }]
                  }, {
                    "linkId": "link-1.1.5",
                    "type": "choice",
                    "options": {
                      "reference": "#some-value-set-id-3"
                    }
                  }, {
                    "linkId": "link-1.1.6",
                    "type": "choice",
                    "options": {
                      "reference": "some-value-set-url-4"
                    }
                  }]
                }]
              }]
            };
          }

          const result = () => calcQuestionnaireResponseWeightSum({
            basePath: modelName === 'DSTU2' ? '%context.repeat(group).question.answer' : '%context.repeat(item).answer',
            modelName, model, questionnaireResponse, questionnaire
          });

          expect(result).toThrow('The weight()/ordinal() function is not supported for the current model.');
        });


      });
    });


    /**
     * Calculates the sum of the weights of questionnaire response items for
     * different model versions.
     * @param {'DSTU2'|'STU3'|'R4'|'R5'} basePath - base path for evaluating the
     *  sum of weights.
     * @param {'DSTU2'|'STU3'|'R4'|'R5'} modelName - model name.
     * @param {Object} model - the "model" data object describes the model with
     *  the name specified by the "modelName" parameter.
     * @param {Object} questionnaireResponse - QuestionnaireResponse resource.
     * @param {Object} questionnaire - Questionnaire resource.
     * @returns {number[] | Promise<number[]>}
     */
    function calcQuestionnaireResponseWeightSum({basePath, modelName, model,
        questionnaireResponse, questionnaire}) {
      const terminologyUrl = `https://some-server-${modelName}`;
      const expression = `${basePath}.${fnName}().sum()`;

      return fhirpath.evaluate(
        questionnaireResponse, expression,
        {
          questionnaire
        }, model, {async: true, terminologyUrl}
      );
    }

  });

});
