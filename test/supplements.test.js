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
      {modelName : 'R4', model: r4_model},
      {modelName : 'STU3', model: stu3_model},
      {modelName : 'DSTU2', model: dstu2_model}
    ].forEach(({modelName, model}) => {

      describe(`${fnName}() in ${modelName}`, () => {


        afterEach(() => {
          mockRestore();
        });


        it('should return a score from the Observation resource', (done) => {
          let result;
          switch (modelName) {
            case 'R5':
              mockFetchResults([
                ['/CodeSystem?url=some-system-1&_elements=property',
                  {
                    "resourceType": "Bundle",
                    "entry": [{
                      "resource": {
                        "property": [{
                          "code" : "itemWeight",
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
              break;
            case 'R4':
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
              break;
            default:
              result = [3];
              break;
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
                        "url": model.score.extension.coding,
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
            {url: /(DSTU2|STU3)\/ValueSet\/\$expand/, body: /"url":"some-value-set-url-3".*"name":"offset","valueInteger":1/},
            {
              "resourceType": "ValueSet",
              "id": "some-value-set-id-3",
              "url": "some-value-set-url-3",
              "expansion": {
                "offset": 1,
                "total": 2,
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-4",
                  "extension": [
                    {
                      "url": model.score.extension.valueSetExpansion,
                      "valueDecimal": 30000
                    }
                  ]
                }]
              }
            }
          ],[
            {url: /(DSTU2|STU3)\/ValueSet\/\$expand/, body: /"url":"some-value-set-url-3"/},
            {
              "resourceType": "ValueSet",
              "id": "some-value-set-id-3",
              "url": "some-value-set-url-3",
              "expansion": {
                "offset": 0,
                "total": 2,
                "contains": [{
                  "code": "some-code-0",
                  "system": "some-system-4"
                }]
              }
            }
          ],[
            /(DSTU2\/ValueSet\/\$expand\?identifier|STU3\/ValueSet\/\$expand\?url)=some-value-set-url-4&offset=1/,
            {
              "resourceType": "ValueSet",
              "id": "some-value-set-id-4",
              "url": "some-value-set-url-4",
              "expansion": {
                "offset": 1,
                "total": 2,
                "contains": [{
                  "code": "some-code-1",
                  "system": "some-system-5",
                  "extension": [
                    {
                      "url": model.score.extension.valueSetExpansion,
                      "valueDecimal": 400000
                    }
                  ]
                }]
              }
            }
          ],[
            /(DSTU2\/ValueSet\/\$expand\?identifier|STU3\/ValueSet\/\$expand\?url)=some-value-set-url-4/,
            {
              "resourceType": "ValueSet",
              "id": "some-value-set-id-4",
              "url": "some-value-set-url-4",
              "expansion": {
                "offset": 0,
                "total": 2,
                "contains": [{
                  "code": "some-code-0",
                  "system": "some-system-5"
                }]
              }
            }
          ],[
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
                        "url": model.score.extension.codeSystem,
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
                    "uri":  model.score.property?.uri
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
                            "url": model.score.extension.coding,
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
                          "url": model.score.extension.valueSetExpansion,
                          "valueDecimal": 2
                        }
                      ]
                    }, {
                      "code": "some-code-2",
                      "system": "some-system-1",
                      "extension": [
                        {
                          "url": model.score.extension.valueSetExpansion,
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
                            "url": model.score.extension.valueSetInclude,
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
                          "url": model.score.extension.valueSetCodeSystem,
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

            // QuestionnaireResponse for STU3/R4/R5
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
                            "url": model.score.extension.coding,
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

            if (modelName === 'STU3') {
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
                            "url": model.score.extension.valueSetExpansion,
                            "valueDecimal": 2
                          }
                        ]
                      }, {
                        "code": "some-code-2",
                        "system": "some-system-1",
                        "extension": [
                          {
                            "url": model.score.extension.valueSetExpansion,
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
                              "url": model.score.extension.valueSetInclude,
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
                              "url": model.score.extension.questionnaire,
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
            } else {
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
                        "uri": model.score.property?.uri
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
                              "url": model.score.extension.valueSetInclude,
                              "valueDecimal": 2
                            }
                          ]
                        }, {
                          "code": "some-code-2",
                          "extension": [
                            {
                              "url": model.score.extension.valueSetInclude,
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
                      "uri": model.score.property?.uri
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
                        "url": model.score.extension.codeSystem,
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
                              "url": model.score.extension.coding,
                              "valueDecimal": 200
                            }
                          ],
                        }
                      }]
                    }, {
                      "linkId": "link-1.1.4",
                      "type": "choice",
                      "answerOption": [{
                        "extension": [
                          {
                            "url": model.score.extension.questionnaire,
                            "valueDecimal": 2000
                          }
                        ],
                        "valueCoding": {
                          "system": "some-system-3",
                          "code": "some-code-1"
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
                    }]
                  }]
                }]
              };
            }

          }

          const result = calcQuestionnaireResponseWeightSum({
            modelName, model, questionnaireResponse, questionnaire
          });

          Promise.resolve(result).then((r) => {
            expect(r).toStrictEqual([432211]);
            done();
          });

        });


        it('should throw an error if a questionnaire item doesn\'t exists', () => {
          const questionnaireResponse = modelName === 'DSTU2' ? {
            "resourceType": "QuestionnaireResponse",
            "group": [{
              "linkId": "some-group-id",
              "question": [
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
            }]
          } : {
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

          const questionnaire = modelName === 'DSTU2' ? {
            "resourceType": "Questionnaire",
            "group": [{
              "linkId": "some-group-id",
              "question":[]
            }]
          } : {
            // STU3/R4/R5
            "resourceType": "Questionnaire",
            "item": []
          };

          const res = () => calcQuestionnaireResponseWeightSum({
            modelName, model, questionnaireResponse, questionnaire
          });
          expect(res).toThrow('Questionnaire item with this linkId were not found: non-existent-in-questionnaire-link-id.');
        });


        it('should throw an error when getting scores for answers that doesn\'t exists in the Questionnaire', () => {
          const questionnaireResponse = modelName === 'DSTU2' ? {
            "resourceType": "QuestionnaireResponse",
            "group": [{
              "linkId": "some-group-id",
              "question": [{
                "linkId": "a-questionnaire-link-id",
                "answer": [{
                  "valueCoding": {
                    "system": "some-system-1",
                    "code": "some-code-1",
                  }
                }]
              }]
            }]
          } : {
            // STU3/R4/R5
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

          const questionnaire = modelName === 'DSTU2' ? {
            "resourceType": "Questionnaire",
            "group": [{
              "linkId": "some-group-id",
              "question": [{
                "linkId": "a-questionnaire-link-id",
                "type": "choice"
              }]
            }]
          } : {
            // STU3/R4/R5
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
            modelName, model, questionnaireResponse, questionnaire
          });
          expect(res).toThrow('Questionnaire answer options (or value set) with this linkId were not found: a-questionnaire-link-id.');
        });


        it( 'should throw an error when questionnaire item has link to a non-existing contained value set', () => {
          const questionnaireResponse = modelName === 'DSTU2' ? {
            "resourceType": "QuestionnaireResponse",
            "group": [{
              "linkId": "link-1",
              "group": [{
                "linkId": "link-1.1",
                "question": [{
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
          } : {
            // STU3/R4/R5
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

          const questionnaire = modelName === 'DSTU2' ? {
            "resourceType": "Questionnaire",
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
                    "reference": "#non-existent-value-set-id"
                  }
                }, {
                  "linkId": "link-1.1.2",
                  "type": "choice",
                  "options": {
                    "reference": "#non-existent-value-set-id"
                  }
                }]
              }]
            }]
          } : modelName === 'STU3' ? {
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
                  "options": {
                    "reference": "#non-existent-value-set-id"
                  }
                }, {
                  "linkId": "link-1.1.2",
                  "type": "choice",
                  "options": {
                    "reference": "#non-existent-value-set-id"
                  }
                }]
              }]
            }]
          } : {
            // R4/R5
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
            modelName, model, questionnaireResponse, questionnaire
          });
          expect(res).toThrow('Cannot find a contained value set with id: non-existent-value-set-id.');
        });


      });

    });


    /**
     * Calculates the sum of the weights of questionnaire response items for
     * different model versions.
     * @param {'DSTU2'|'STU3'|'R4'|'R5'} modelName - model name.
     * @param {Object} model - the "model" data object describes the model with
     *  the name specified by the "modelName" parameter.
     * @param {Object} questionnaireResponse - QuestionnaireResponse resource.
     * @param {Object} questionnaire - Questionnaire resource.
     * @returns {number[] | Promise<number[]>}
     */
    function calcQuestionnaireResponseWeightSum({modelName, model,
        questionnaireResponse, questionnaire}) {
      const terminologyUrl = `https://some-server-${modelName}`;
      let expression;

      if (modelName === 'DSTU2') {
        expression = `%context.repeat(group).question.answer.${fnName}().sum()`;
      } else {
        expression = `%context.repeat(item).answer.${fnName}().sum()`;
      }


      return fhirpath.evaluate(
        questionnaireResponse, expression,
        {
          questionnaire
        }, model, {async: true, terminologyUrl}
      );
    }

  });

});
