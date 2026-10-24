const fhirpath = require('../src/fhirpath');
const r4 = require('../fhir-context/r4');
const r5 = require('../fhir-context/r5');
const {mockRestore, mockFetchResults} = require('./mock-fetch-results');

const SYSTEM = 'http://example.org/CodeSystem/weight';
const SCORE = 'http://hl7.org/fhir/StructureDefinition/ordinalValue';
const PROPERTY = 'http://hl7.org/fhir/concept-properties#itemWeight';
const BACKPORT = 'http://hl7.org/fhir/5.0/StructureDefinition/' +
  'extension-ValueSet.expansion.';


function declaration(uri = PROPERTY) {
  return {
    url: BACKPORT + 'property',
    extension: [
      {url: 'code', valueCode: 'points'},
      {url: 'uri', valueUri: uri}
    ]
  };
}


function concept(weight, code = 'yes', system = SYSTEM, property = 'points') {
  return {
    system, code,
    extension: [{
      url: BACKPORT + 'contains.property',
      extension: [
        {url: 'code', valueCode: property},
        {url: 'value', valueDecimal: weight}
      ]
    }]
  };
}


function evaluate(valueSet, model = r4, fallback, hasCodeSystem = true) {
  const questionnaire = {
    resourceType: 'Questionnaire',
    url: 'http://example.org/Questionnaire/weight',
    status: 'active',
    contained: [{
      resourceType: 'ValueSet', id: 'answers', status: 'active', ...valueSet
    }],
    item: [{
      linkId: 'answer', type: model.version === 'r5' ? 'coding' : 'choice',
      answerValueSet: '#answers'
    }]
  };
  if (hasCodeSystem) {
    questionnaire.extension = [{
      url: 'http://example.org/StructureDefinition/contained-code-system',
      valueReference: {reference: '#codes'}
    }];
    questionnaire.contained.push({
      resourceType: 'CodeSystem', id: 'codes', url: SYSTEM,
      status: 'active', content: 'complete',
      concept: [{
        code: 'yes',
        ...(fallback === undefined ? {} : {
          extension: [{url: SCORE, valueDecimal: fallback}]
        })
      }]
    });
  }
  return fhirpath.evaluate({
    resourceType: 'QuestionnaireResponse', status: 'completed',
    questionnaire: questionnaire.url,
    item: [{
      linkId: 'answer', answer: [{valueCoding: {system: SYSTEM, code: 'yes'}}]
    }]
  }, 'item.answer.value.weight()', {questionnaire}, model, {async: true});
}


function expansion(contains, extension = [declaration()]) {
  return {expansion: {
    timestamp: '2026-01-01T00:00:00Z', contains,
    ...(extension.length ? {extension} : {})
  }};
}


// R4 carries R5 expansion properties through cross-version extensions.
// The canonical URI declares the meaning; the local code can be an alias.
describe('weight() from ValueSet expansion properties', () => {

  beforeEach(() => {
    mockFetchResults([]);
  });

  afterEach(() => {
    expect(global.fetch).not.toHaveBeenCalled();
    mockRestore();
  });


  it.each([3, 0, 1.25, -2])('reads declared R4 decimal weight %s', async weight => {
    expect(await evaluate(expansion([concept(weight)]))).toEqual([weight]);
  });


  it('matches system and code through nested R4 expansion entries', async () => {
    expect(await evaluate(expansion([
      concept(90, 'yes', 'http://example.org/CodeSystem/other'),
      concept(80, 'other'),
      {display: 'Outer group', abstract: true, contains: [{
        display: 'Inner group', abstract: true, contains: [concept(2)]
      }]}
    ]))).toEqual([2]);
  });


  it.each([
    ['undeclared', []],
    ['unrelated', [declaration('http://example.org/unrelated-property')]]
  ])('does not infer a weight from %s properties', async (_name, extension) => {
    expect(await evaluate(expansion([concept(9)], extension))).toEqual([]);
  });


  it('requires the concept property code to match the declaration', async () => {
    expect(await evaluate(expansion([
      concept(9, 'yes', SYSTEM, 'other')
    ]))).toEqual([]);
  });


  it('returns empty when the matching concept and CodeSystem lack weights',
    async () => {
      expect(await evaluate(expansion([
        {system: SYSTEM, code: 'yes'}, concept(9, 'other')
      ]))).toEqual([]);
    });


  it.each([
    ['present', concept(3), 3],
    ['zero', concept(0), 0],
    ['absent', {system: SYSTEM, code: 'yes'}, 4]
  ])('uses the R4 expansion weight when %s, with compose fallback',
    async (_name, entry, expected) => {
      expect(await evaluate({
        ...expansion([entry]),
        compose: {include: [{
          system: SYSTEM,
          concept: [{
            code: 'yes', extension: [{url: SCORE, valueDecimal: 4}]
          }]
        }]}
      })).toEqual([expected]);
    });


  it('preserves CodeSystem fallback when the R4 expansion weight is absent',
    async () => {
      expect(await evaluate(
        expansion([{system: SYSTEM, code: 'yes'}]), r4, 6
      )).toEqual([6]);
    });


  it('preserves the error when fallback terminology cannot be resolved', () => {
    expect(() => evaluate({}, r4, undefined, false)).toThrow(
      'Option "terminologyUrl" is not specified.'
    );
  });


  it.each([0, 1.25])('preserves native R5 expansion weight %s', async weight => {
    expect(await evaluate({expansion: {
      timestamp: '2026-01-01T00:00:00Z',
      property: [{code: 'points', uri: PROPERTY}],
      contains: [{display: 'Group', abstract: true, contains: [{
        system: SYSTEM, code: 'yes',
        property: [{code: 'points', valueDecimal: weight}]
      }]}]
    }}, r5)).toEqual([weight]);
  });

});
