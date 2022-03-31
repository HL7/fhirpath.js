const fhirpath = require('../src/fhirpath');
const r4_model = require('../fhir-context/r4');
const _ = require('lodash');

describe('compile', () => {
  it('should accept a model object', () => {
    let f = fhirpath.compile('Observation.value', r4_model);
    expect(f({resourceType: "Observation", valueString: "high"})).toStrictEqual(["high"]);
  });

  it('should accept a part of a resource', () => {
    let f = fhirpath.compile({
      base: 'QuestionnaireResponse.item',
      expression: 'answer.value.toString()'
    }, r4_model);
    expect(f(require('../test/resources/questionnaire-part-example.json')))
      .toStrictEqual(['2 year']);
  });

  it('should return a function that accepts a context hash', () => {
    let f = fhirpath.compile('%a + 2');
    expect(f({}, {a: 1})).toStrictEqual([3]);
  });

  it('should apply the FHIR model for a part of the resource placed in the environment variable', () => {
    const getPartOfResource = fhirpath.compile(
      "QuestionnaireResponse.item.where(linkId = \'2\')",
      r4_model
    );
    const partOfResource = getPartOfResource(
      require('../test/resources/quantity-example.json')
    );
    let execExpression = fhirpath.compile(
      "%partOfResource.answer.value = 3 'min'",
      r4_model
    );
    let result = execExpression({}, {partOfResource});
    expect(result).toStrictEqual([true]);
  });
});

describe('evaluate', () => {
  it('should apply the FHIR model for a part of the resource placed in the environment variable', () => {
    const partOfResource = fhirpath.evaluate(
      require('../test/resources/quantity-example.json'),
      'QuestionnaireResponse.item.where(linkId = \'2\')'
    );
    let result = fhirpath.evaluate(
      {},
      "%partOfResource.answer.value = 3 'min'",
      {partOfResource},
      r4_model
    );
    expect(result).toStrictEqual([true]);
  });

  it('should not change the context variable during expression evaluation', () => {
    const someVar = fhirpath.evaluate(
      require('../test/resources/quantity-example.json'),
      'QuestionnaireResponse'
    );
    const someVarOrig = _.cloneDeep(someVar);
    let result = fhirpath.evaluate(
      {},
      "%someVar.repeat(item).linkId",
      {someVar},
      r4_model
    );
    expect(result).toEqual(['1', '2', '3']);
    expect(someVar).toStrictEqual(someVarOrig);
  })
});
