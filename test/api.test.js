const fhirpath = require('../src/fhirpath');
const r4_model = require('../fhir-context/r4');
const _ = require('lodash');
const {FP_DateTime, FP_Quantity} = require('../src/types');
const input = {
  get questionnairePartExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(
      require('../test/resources/questionnaire-part-example.json')
    );
  },

  get questionnaireResponseExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(
      require('../test/resources/questionnaire-response-example.json')
    );
  },

  get quantityExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(
      require('../test/resources/quantity-example.json')
    );
  }
}

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
    expect(f(input.questionnairePartExample))
      .toStrictEqual(['2 year']);
  });

  it('should accept a resource as a environment variable', () => {
    let f = fhirpath.compile(
      '%resource.descendants().where(linkId = \'answersFromParentQR\').answer.value',
      r4_model
    );
    expect(f({}, {resource: input.questionnaireResponseExample}))
      .toStrictEqual(['Blue', 'Green']);
  });

  it('should evaluate type() on a part of a resource', () => {
    let f = fhirpath.compile({
      base: 'QuestionnaireResponse.item',
      expression: 'type().name'
    }, r4_model);
    expect(f(input.questionnairePartExample))
      .toStrictEqual(['BackboneElement']);
  });

  it('should return a function that accepts a context hash', () => {
    let f = fhirpath.compile('%a + 2');
    expect(f({}, {a: 1})).toStrictEqual([3]);
  });

  it('should apply the FHIR model for a part of the resource placed in the context variable', () => {
    const getPartOfResource = fhirpath.compile(
      "QuestionnaireResponse.item.where(linkId = \'2\')",
      r4_model
    );
    const partOfResource = getPartOfResource(input.quantityExample);
    let execExpression = fhirpath.compile(
      "%partOfResource.answer.value = 3 minutes",
      r4_model
    );
    let result = execExpression({}, {partOfResource});
    expect(result).toStrictEqual([true]);
  });

  it('should resolve values which have internal data types to strings by default', () => {
    let f = fhirpath.compile('@2018-02-18T12:23:45-05:00');
    expect(f({})).toStrictEqual(['2018-02-18T12:23:45-05:00']);

    f = fhirpath.compile("2.0 'cm'");
    expect(f({})).toStrictEqual(["2 'cm'"]);
  });

  it('should not resolve values which have internal data types to strings when options.resolveInternalTypes is false', () => {
    let f = fhirpath.compile(
      '@2018-02-18T12:23:45-05:00',
      null,
      {resolveInternalTypes: false}
    );
    expect(f({})).toStrictEqual([new FP_DateTime('2018-02-18T12:23:45-05:00')]);

    f = fhirpath.compile(
      "2.0 'cm'",
      null,
      {resolveInternalTypes: false}
    );
    expect(f({})).toStrictEqual([new FP_Quantity(2, "'cm'")]);
  });
});

describe('evaluate', () => {
  it('should apply the FHIR model for a part of the resource placed in the context variable (with MemberInvocation)', () => {
    const partOfResource = fhirpath.evaluate(
      input.quantityExample,
      'QuestionnaireResponse.item.where(linkId = \'2\')'
    );
    let result = fhirpath.evaluate(
      {},
      "%partOfResource.answer.value = 3 minutes",
      {partOfResource},
      r4_model
    );
    expect(result).toStrictEqual([true]);
  });

  it('should apply the FHIR model for a part of the resource placed in the context variable (without MemberInvocation)', () => {
    const partOfResource = fhirpath.evaluate(
      input.quantityExample,
      "QuestionnaireResponse.item.where(linkId = '2').answer.value",
      null,
      r4_model
    );
    let result = fhirpath.evaluate(
      {},
      "%partOfResource.toQuantity('s').value",
      {partOfResource},
      r4_model
    );
    expect(result).toStrictEqual([180]);
  });

  it('should not change the context variable during expression evaluation', () => {
    const someVar = fhirpath.evaluate(
      input.quantityExample,
      'QuestionnaireResponse'
    );
    const someVarOrig = _.cloneDeep(someVar);
    let result = fhirpath.evaluate(
      {},
      "%someVar.repeat(item).linkId",
      {someVar},
      r4_model
    );
    expect(result).toEqual(['1', '2', '3', '4']);
    expect(someVar).toStrictEqual(someVarOrig);
  });

  it('should resolve values which have internal data types to strings by default', () => {
    expect(
      fhirpath.evaluate({}, '@2018-02-18T12:23:45-05:00')
    ).toStrictEqual(['2018-02-18T12:23:45-05:00']);

    expect(
      fhirpath.evaluate({}, "2.0 'cm'")
    ).toStrictEqual(["2 'cm'"]);
  });

  it('should not resolve values which have internal data types to strings when options.resolveInternalTypes is false', () => {
    expect(
      fhirpath.evaluate(
        {},
        '@2018-02-18T12:23:45-05:00',
        null,
        null,
        { resolveInternalTypes: false })
    ).toStrictEqual([new FP_DateTime('2018-02-18T12:23:45-05:00')]);

    expect(
      fhirpath.evaluate(
        {},
        "2.0 'cm'",
        null,
        null,
        { resolveInternalTypes: false }
      )
    ).toStrictEqual([new FP_Quantity(2, "'cm'")]);
  });

  it('should support providing a custom function to "trace"', () => {
    var traceobj = null;
    var tracelabel = null;
    const result = fhirpath.evaluate(
      {},
      "'stringdata'.trace('blah')",
      null,
      null,
      { traceFn: (data, label) => { tracelabel = label; traceobj = data;} });
    expect(result).toStrictEqual(['stringdata']);
    expect(tracelabel).toStrictEqual('blah');
    expect(traceobj).toStrictEqual(['stringdata']);
  });
});

describe('resolveInternalTypes', () => {
  it('should resolve values which have internal data types to strings', () => {
    expect(
      fhirpath.resolveInternalTypes([
        new FP_DateTime('2020-02-18T12:23:45-05:00'),
        new FP_Quantity(1, "'cm'")
      ])
    ).toStrictEqual([
      '2020-02-18T12:23:45-05:00',
      "1 'cm'"
    ]);
  });
});

describe('types', () => {
  it('should return the type of each element in FHIRPath result', () => {
    let value = fhirpath.evaluate(
      input.quantityExample,
      'QuestionnaireResponse.item.answer.value.combine(today())',
      {}, r4_model, {resolveInternalTypes: false}
    );
    expect(
      fhirpath.types(value)
    ).toStrictEqual([
      'FHIR.Quantity', 'FHIR.Quantity', 'FHIR.Quantity', 'FHIR.Quantity', 'System.Date'
    ]);
  });
});

describe('evaluate type() on a FHIRPath evaluation result', () => {
  it('should return the type of each element in FHIRPath result', () => {
    let value = fhirpath.evaluate(
      input.quantityExample,
      'QuestionnaireResponse.item.answer.value.combine(today())',
      {}, r4_model, {resolveInternalTypes: false}
    );
    expect(
      fhirpath.evaluate(value, '%context.type().namespace', {}, r4_model)
    ).toStrictEqual([
      'FHIR', 'FHIR', 'FHIR', 'FHIR', 'System'
    ]);
    expect(
      fhirpath.evaluate(value, '%context.type().name', {}, r4_model)
    ).toStrictEqual([
      'Quantity', 'Quantity', 'Quantity', 'Quantity', 'Date'
    ]);
  });

  it('should return the type of sub-items of FHIRPath result', () => {
    let value = fhirpath.evaluate(
      input.quantityExample,
      'QuestionnaireResponse.item.answer.combine(today())',
      {}, r4_model, {resolveInternalTypes: false}
    );
    expect(
      fhirpath.evaluate(value, "%context.select(iif(value.exists(), value.type().namespace, $this.type().namespace))", {}, r4_model)
    ).toStrictEqual([
      'FHIR', 'FHIR', 'FHIR', 'FHIR', 'System'
    ]);
    expect(
      fhirpath.evaluate(value, "%context.select(iif(value.exists(), value.type().name, $this.type().name))", {}, r4_model)
    ).toStrictEqual([
      'Quantity', 'Quantity', 'Quantity', 'Quantity', 'Date'
    ]);
  });

  it('should not change the context input parameter containing environment variables', () => {
    const originalVars = {a: 'abc'};
    const vars = _.cloneDeep(originalVars);
    expect(fhirpath.evaluate(
      {},
      '%a = \'abc\'',
      vars
    )).toStrictEqual([true]);
    expect(originalVars).toStrictEqual(vars);
  })
});

describe('evaluate environment variables', () => {
  it('context can be immutable', () => {
    const vars = Object.freeze({a: 'abc', b: 'def'});
    expect(fhirpath.evaluate(
      {},
      '%a = \'abc\'',
      vars
    )).toStrictEqual([true]);
  })

  it('context can be immutable when new variables are defined', () => {
    const vars = Object.freeze({a: 'abc'});
    expect(fhirpath.evaluate(
      {},
      "%a.defineVariable('b')",
      vars
    )).toStrictEqual(['abc']);
  });
  it('variables are only read when needed', () => {
    const vars = {
      get a() { return 'abc'; },
      get b() { throw new Error('b should not be read'); }
    };
    expect(fhirpath.evaluate(
      {},
      '%a = \'abc\'',
      vars
    )).toStrictEqual([true]);
  })
});
