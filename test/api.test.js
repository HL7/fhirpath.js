const fhirpath = require('../src/fhirpath');
const r4_model = require('../fhir-context/r4');
const r5_model = require('../fhir-context/r5');
const _ = require('lodash');
const {
  FP_DateTime, FP_Quantity, FP_Decimal_Native, ResourceNode
} = require('../src/types');

const observationResource = require('./resources/r4/observation-example.json');
const input = {
  get questionnairePartExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(
      require('../test/resources/r4/questionnaire-part-example.json')
    );
  },

  get questionnaireResponseExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(
      require('../test/resources/r4/questionnaire-response-example.json')
    );
  },

  get quantityExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(
      require('../test/resources/r4/quantity-example.json')
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
      base: 'QuestionnaireResponse.item[0].item[1].item[2].item[4]',
      expression: 'answer.value.toString()'
    }, r4_model);
    expect(f(input.questionnairePartExample))
      .toStrictEqual(["2 'a'"]);
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
    expect(f({})).toStrictEqual(["2.0 'cm'"]);
  });

  it('should not resolve values which have internal data types to strings when options.resolveInternalTypes is false', () => {
    let f = fhirpath.compile(
      '@2018-02-18T12:23:45-05:00',
      null,
      {resolveInternalTypes: false}
    );
    let r = f({});
    expect(r).toStrictEqual([FP_DateTime.checkString(r[0].ctx, '2018-02-18T12:23:45-05:00')]);

    f = fhirpath.compile(
      "2.0 'cm'",
      null,
      {resolveInternalTypes: false}
    );
    r = f({});
    expect(r).toStrictEqual([new FP_Quantity(r[0].ctx, '2.0', "'cm'")]);
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
    ).toStrictEqual(["2.0 'cm'"]);
  });

  it('should not resolve values which have internal data types to strings when options.resolveInternalTypes is false', () => {
    let r = fhirpath.evaluate( {}, '@2018-02-18T12:23:45-05:00', null, null,
      { resolveInternalTypes: false });
    expect(r).toStrictEqual([FP_DateTime.checkString(r[0].ctx, '2018-02-18T12:23:45-05:00')]);

    r = fhirpath.evaluate( {}, "2.0 'cm'", null, null,
      { resolveInternalTypes: false });
    expect(r).toStrictEqual([new FP_Quantity(r[0].ctx, '2.0', "'cm'")]);
  });

  it('should preserve ResourceNode results when options.resolveInternalTypes is false', () => {
    const r = fhirpath.evaluate(
      input.quantityExample,
      "QuestionnaireResponse.item.where(linkId = '2')",
      null,
      r4_model,
      { resolveInternalTypes: false }
    );
    expect(r).toHaveLength(1);
    expect(r[0]).toBeInstanceOf(ResourceNode);
    expect(r[0].fullPropertyName()).toBe('QuestionnaireResponse.item[1]');
  });

  it('should preserve unresolved metadata-only primitive ResourceNodes', () => {
    const patient = {
      resourceType: 'Patient',
      _birthDate: { id: 'bd1' },
      name: [{
        given: ['Ann'],
        _given: [null, { id: 'g2' }]
      }]
    };

    const birthDate = fhirpath.evaluate(
      patient,
      'Patient.birthDate',
      null,
      r4_model,
      { resolveInternalTypes: false }
    );

    expect(birthDate).toHaveLength(1);
    expect(birthDate[0]).toBeInstanceOf(ResourceNode);
    expect(birthDate[0].data).toBeUndefined();
    expect(birthDate[0]._data).toStrictEqual({ id: 'bd1' });
    expect(birthDate[0].fullPropertyName()).toBe('Patient.birthDate');

    const given = fhirpath.evaluate(
      patient,
      'Patient.name.given',
      null,
      r4_model,
      { resolveInternalTypes: false }
    );

    expect(given).toHaveLength(2);
    expect(given[1]).toBeInstanceOf(ResourceNode);
    expect(given[1].data).toBeNull();
    expect(given[1]._data).toStrictEqual({ id: 'g2' });
    expect(given[1].fullPropertyName()).toBe('Patient.name[0].given[1]');
  });

  it('should preserve unresolved metadata-only integer64 ResourceNodes', () => {
    const patient = {
      resourceType: 'Patient',
      extension: [{
        url: 'http://example.org/fhir/StructureDefinition/integer64',
        _valueInteger64: { id: 'v64' }
      }]
    };

    const value = fhirpath.evaluate(
      patient,
      'Patient.extension.value',
      null,
      r5_model,
      { resolveInternalTypes: false }
    );

    expect(value).toHaveLength(1);
    expect(value[0]).toBeInstanceOf(ResourceNode);
    expect(value[0].data).toBeNull();
    expect(value[0]._data).toStrictEqual({ id: 'v64' });
    expect(value[0].fullPropertyName()).toBe('Patient.extension[0].value');

    expect(fhirpath.evaluate(
      patient,
      'Patient.extension.value',
      null,
      r5_model
    )).toStrictEqual([]);
  });

  it('should return [] for extension(url) when url is an empty string', () => {
    const resource = {
      resourceType: 'Patient',
      extension: [
        {
          url: 'http://example.org/StructureDefinition/some-extension',
          valueString: 'some value'
        }
      ]
    };
    const r = fhirpath.evaluate(
      resource,
      "Patient.extension('')",
      null,
      r4_model
    );
    expect(r).toStrictEqual([]);
  });

  it('should serialize ResourceNode string values without double-encoding', () => {
    const r = fhirpath.evaluate(
      input.quantityExample,
      "QuestionnaireResponse.item.where(linkId = '2').linkId",
      null,
      r4_model,
      { resolveInternalTypes: false }
    );
    expect(r[0]).toBeInstanceOf(ResourceNode);
    expect(JSON.stringify(r)).toBe('["2"]');
  });

  it('should serialize ResourceNode object values as JSON objects', () => {
    const r = fhirpath.evaluate(
      input.quantityExample,
      "QuestionnaireResponse.item.where(linkId = '2')",
      null,
      r4_model,
      { resolveInternalTypes: false }
    );
    expect(r[0]).toBeInstanceOf(ResourceNode);
    expect(JSON.stringify(r)).toContain('"linkId":"2"');
    expect(JSON.stringify(r)).not.toContain('\\"linkId\\"');
  });

  it('should serialize ResourceNode integer64 values without throwing', () => {
    const node = new ResourceNode(
      { getDecimal: FP_Decimal_Native.getDecimal, model: null },
      '9007199254740993',
      null,
      'Observation.value',
      null,
      'integer64'
    );
    expect(JSON.stringify([node])).toBe('["9007199254740993"]');
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
        new FP_DateTime(null, '2020-02-18T12:23:45-05:00'),
        new FP_Quantity({getDecimal: FP_Decimal_Native.getDecimal}, 1, "'cm'")
      ])
    ).toStrictEqual([
      '2020-02-18T12:23:45-05:00',
      "1 'cm'"
    ]);
  });

  it('should resolve FP_Type values using toJSON()', () => {
    const raw = fhirpath.evaluate(
      {},
      "1 + 2",
      null,
      r4_model,
      { resolveInternalTypes: false }
    );

    const resolved = fhirpath.resolveInternalTypes(raw);
    expect(resolved[0]).toBe(3);
  });

  it('should resolve BigInt values to strings', () => {
    const raw = [
      1n,
      { value: 9007199254740993n }
    ];

    const resolved = fhirpath.resolveInternalTypes(raw);

    expect(resolved).not.toBe(raw);
    expect(resolved[1]).not.toBe(raw[1]);
    expect(resolved).toStrictEqual([
      '1',
      { value: '9007199254740993' }
    ]);
    expect(raw[0]).toBe(1n);
    expect(raw[1].value).toBe(9007199254740993n);
  });

  it('should preserve direct nullish scalar values while resolving internal types', () => {
    expect(fhirpath.resolveInternalTypes(null)).toBeNull();
    expect(fhirpath.resolveInternalTypes(undefined)).toBeUndefined();
  });

  it('should compact nullish array entries while resolving internal types', () => {
    const nested = {
      a: null,
      b: new FP_DateTime(null, '2020-02-18T12:23:45-05:00')
    };
    const raw = [
      null,
      'x',
      undefined,
      nested
    ];

    const resolved = fhirpath.resolveInternalTypes(raw);

    expect(resolved).not.toBe(raw);
    expect(resolved[1]).not.toBe(nested);
    expect(resolved).toStrictEqual([
      'x',
      {
        a: null,
        b: '2020-02-18T12:23:45-05:00'
      }
    ]);
    expect(raw).toHaveLength(4);
    expect(raw[0]).toBeNull();
    expect(raw[2]).toBeUndefined();
    expect(raw[3]).toBe(nested);
    expect(raw[3].b).toBeInstanceOf(FP_DateTime);
  });

  it('should preserve null placeholders in nested primitive arrays', () => {
    const patient = {
      resourceType: 'Patient',
      name: [{
        // The second "given" has no value, only sibling "_"-metadata; the null
        // placeholder keeps "given" index-aligned with "_given".
        given: ['John', null],
        _given: [null, { id: 'ext-2' }]
      }]
    };

    const raw = fhirpath.evaluate(
      patient,
      'Patient.name',
      null,
      r4_model,
      { resolveInternalTypes: false }
    );
    const resolved = fhirpath.resolveInternalTypes(raw);

    // Nested value/"_"-metadata arrays must stay aligned (the null placeholder
    // is not stripped from arrays nested inside a resolved object).
    expect(resolved).toStrictEqual([{
      given: ['John', null],
      _given: [null, { id: 'ext-2' }]
    }]);
    // The manually resolved output matches the default resolved output.
    expect(JSON.stringify(resolved)).toBe(JSON.stringify(
      fhirpath.evaluate(patient, 'Patient.name', null, r4_model)
    ));
  });

  it('should return dense arrays without custom array properties', () => {
    const raw = [];
    raw[1] = 'x';
    raw[3] = new FP_DateTime(null, '2020-02-18');
    raw.custom = 'ignored';
    Object.defineProperty(raw, '__path__', {
      value: { path: 'Patient.name.given' }
    });

    const resolved = fhirpath.resolveInternalTypes(raw);

    expect(resolved).not.toBe(raw);
    expect(resolved).toStrictEqual(['x', '2020-02-18']);
    expect(resolved).toHaveLength(2);
    expect(resolved.custom).toBeUndefined();
    expect(resolved.__path__).toBe(raw.__path__);
    expect(raw).toHaveLength(4);
    expect(0 in raw).toBe(false);
    expect(raw.custom).toBe('ignored');
  });

  it('should drop metadata-only primitive ResourceNodes while resolving raw arrays', () => {
    const patient = {
      resourceType: 'Patient',
      _birthDate: { id: 'bd1' },
      name: [{
        given: ['Ann'],
        _given: [null, { id: 'g2' }]
      }]
    };
    const birthDateRaw = fhirpath.evaluate(
      patient,
      'Patient.birthDate',
      null,
      r4_model,
      { resolveInternalTypes: false }
    );
    const givenRaw = fhirpath.evaluate(
      patient,
      'Patient.name.given',
      null,
      r4_model,
      { resolveInternalTypes: false }
    );

    const birthDateResolved = fhirpath.resolveInternalTypes(birthDateRaw);
    expect(birthDateResolved).not.toBe(birthDateRaw);
    expect(birthDateResolved).toStrictEqual([]);
    expect(birthDateRaw).toHaveLength(1);
    expect(birthDateRaw[0]).toBeInstanceOf(ResourceNode);
    expect(fhirpath.evaluate(
      patient,
      'Patient.birthDate',
      null,
      r4_model
    )).toStrictEqual([]);

    const givenResolved = fhirpath.resolveInternalTypes(givenRaw);
    expect(givenResolved).not.toBe(givenRaw);
    expect(givenResolved).toStrictEqual(['Ann']);
    expect(givenRaw).toHaveLength(2);
    expect(givenRaw[0]).toBeInstanceOf(ResourceNode);
    expect(givenRaw[1]).toBeInstanceOf(ResourceNode);
    expect(fhirpath.evaluate(
      patient,
      'Patient.name.given',
      null,
      r4_model
    )).toStrictEqual(['Ann']);
  });

  it('should resolve ResourceNode values returned by evaluate when options.resolveInternalTypes is false', () => {
    const raw = fhirpath.evaluate(
      input.quantityExample,
      "QuestionnaireResponse.item.where(linkId = '2')",
      null,
      r4_model,
      { resolveInternalTypes: false }
    );
    expect(raw[0]).toBeInstanceOf(ResourceNode);

    const resolved = fhirpath.resolveInternalTypes(raw);
    expect(resolved).not.toBe(raw);
    expect(raw[0]).toBeInstanceOf(ResourceNode);
    expect(resolved[0]).not.toBe(raw[0].data);
    expect(resolved[0]).not.toBeInstanceOf(ResourceNode);
    expect(resolved[0].linkId).toBe('2');
    expect(resolved[0].__path__.path).toBe('QuestionnaireResponse.item');
  });

  it('should copy objects while resolving internal types', () => {
    const raw = {
      a: null,
      b: new FP_DateTime(null, '2020-02-18T12:23:45-05:00')
    };
    Object.defineProperty(raw, '__path__', {
      value: { path: 'Patient.birthDate' }
    });

    const resolved = fhirpath.resolveInternalTypes(raw);

    expect(resolved).not.toBe(raw);
    expect(resolved.__path__).toBe(raw.__path__);
    expect(resolved).toStrictEqual({
      a: null,
      b: '2020-02-18T12:23:45-05:00'
    });
    expect(raw).toStrictEqual({
      a: null,
      b: raw.b
    });
    expect(raw.b).toBeInstanceOf(FP_DateTime);
  });

  it('should drop an own __proto__ key while resolving internal types', () => {
    // JSON.parse creates an own enumerable "__proto__" data property (unlike
    // an object literal, whose "__proto__" would invoke the prototype setter).
    const raw = JSON.parse('{"a": 1, "__proto__": {"polluted": true}}');
    raw.b = new FP_DateTime(null, '2020-02-18');

    const resolved = fhirpath.resolveInternalTypes(raw);

    // The "__proto__" key is dropped rather than re-pointing the copy's
    // prototype, so the output stays a plain object with an unchanged
    // prototype and no injected members.
    expect(resolved).not.toBe(raw);
    expect(Object.getPrototypeOf(resolved)).toBe(Object.prototype);
    const hasOwnProto =
      Object.prototype.hasOwnProperty.call(resolved, '__proto__');
    expect(hasOwnProto).toBe(false);
    expect(resolved.polluted).toBeUndefined();
    expect(resolved).toStrictEqual({ a: 1, b: '2020-02-18' });
    // No global prototype pollution.
    expect({}.polluted).toBeUndefined();
  });

  it('should let ResourceNode path metadata override wrapped data metadata', () => {
    const wrapped = { value: 'x' };
    Object.defineProperty(wrapped, '__path__', {
      value: { path: 'Original.path' }
    });
    const node = new ResourceNode(
      { getDecimal: FP_Decimal_Native.getDecimal, model: null },
      wrapped,
      null,
      'Wrapper.path',
      null,
      'WrapperType'
    );

    const resolved = fhirpath.resolveInternalTypes(node);

    expect(resolved).not.toBe(wrapped);
    expect(resolved).toStrictEqual({ value: 'x' });
    expect(resolved.__path__.path).toBe('Wrapper.path');
    expect(wrapped.__path__.path).toBe('Original.path');
  });

  it('should not attach path metadata to non-plain object instances', () => {
    class CustomValue {
      constructor() {
        this.value = new FP_DateTime(null, '2020-02-18');
      }
    }
    const wrapped = new CustomValue();
    const node = new ResourceNode(
      { getDecimal: FP_Decimal_Native.getDecimal, model: null },
      wrapped,
      null,
      'Wrapper.path',
      null,
      'WrapperType'
    );

    const resolved = fhirpath.resolveInternalTypes(node);

    expect(resolved).toBe(wrapped);
    expect(resolved.__path__).toBeUndefined();
    expect(resolved.value).toBeInstanceOf(FP_DateTime);
  });

  it('should not attach path metadata to nested objects inside a top-level item', () => {
    const nested = { value: new FP_DateTime(null, '2020-02-18') };
    Object.defineProperty(nested, '__path__', {
      value: { path: 'Nested.path' }
    });
    const raw = { nested };
    Object.defineProperty(raw, '__path__', {
      value: { path: 'Top.path' }
    });

    const resolved = fhirpath.resolveInternalTypes(raw);

    expect(resolved).not.toBe(raw);
    expect(resolved.__path__.path).toBe('Top.path');
    expect(resolved.nested).not.toBe(nested);
    expect(resolved.nested.__path__).toBeUndefined();
    expect(resolved.nested).toStrictEqual({ value: '2020-02-18' });
    expect(nested.__path__.path).toBe('Nested.path');
  });

  it('should not attach path metadata to nested arrays inside a top-level item', () => {
    const nestedArray = [new FP_DateTime(null, '2020-02-18')];
    Object.defineProperty(nestedArray, '__path__', {
      value: { path: 'Nested.array' }
    });
    const raw = [{ items: nestedArray }];

    const resolved = fhirpath.resolveInternalTypes(raw);

    expect(resolved[0].__path__).toBeUndefined();
    expect(resolved[0].items).not.toBe(nestedArray);
    expect(resolved[0].items.__path__).toBeUndefined();
    expect(resolved[0].items).toStrictEqual(['2020-02-18']);
  });
});

describe('types', () => {
  it('should return correct types for simple System primitive data types', () => {
    const value = fhirpath.evaluate(
      {},
      "true.combine(1).combine(2.5).combine('abc')",
      {},
      null,
      { resolveInternalTypes: false }
    );
    expect(
      fhirpath.types(value)
    ).toStrictEqual([
      'System.Boolean', 'System.Integer', 'System.Decimal', 'System.String'
    ]);
  });

  it('should return correct types for simple FHIR primitive data types', () => {
    const value = fhirpath.evaluate(
      observationResource,
      'Observation.status.combine(Observation.effectiveDateTime).combine(Observation.valueQuantity.value)',
      {},
      r4_model,
      { resolveInternalTypes: false }
    );
    expect(
      fhirpath.types(value)
    ).toStrictEqual([
      'FHIR.code', 'FHIR.dateTime', 'FHIR.decimal'
    ]);
  });

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

  it('should allow root type name in expression prefix', () => {
    let partOfResource = fhirpath.evaluate(
      observationResource,
      "Observation.code.coding",
      {},
      r4_model
    );

    expect(fhirpath.evaluate(partOfResource, "code", {}, r4_model)).toStrictEqual(["29463-7", "3141-9", "27113001", "body-weight"]);
    expect(fhirpath.evaluate(partOfResource, "Coding.code", {}, r4_model)).toStrictEqual(["29463-7", "3141-9", "27113001", "body-weight"]);
    expect(fhirpath.evaluate(partOfResource, "select(Coding.code)", {}, r4_model)).toStrictEqual(["29463-7", "3141-9", "27113001", "body-weight"]);
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


describe('FP_Decimal in evaluate', () => {
  const { FP_Decimal } = fhirpath;

  it('should preserve precise decimal values in a resource', () => {
    const resource = {
      resourceType: 'Observation',
      valueQuantity: {
        value: FP_Decimal.getDecimal('12345678901234567890.12345678'),
        system: 'http://unitsofmeasure.org',
        code: 'mg'
      }
    };
    const result = fhirpath.evaluate(
      resource,
      'Observation.value.value',
      null,
      r4_model,
      { preciseMath: true, keepDecimalTypes: true }
    );
    expect(result[0] instanceof FP_Decimal).toBe(true);
    expect(result[0].toString()).toBe('12345678901234567890.12345678');
  });


  it('should correctly handle FP_Decimal in quantity expressions', () => {
    const resource = {
      resourceType: 'Observation',
      valueQuantity: {
        value: FP_Decimal.getDecimal('0.1'),
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      }
    };
    const result = fhirpath.evaluate(
      resource,
      "Observation.value + 0.2 'kg'",
      null,
      r4_model,
      { preciseMath: true }
    );
    expect(result[0].toString()).toBe("0.3 'kg'");
  });

});
