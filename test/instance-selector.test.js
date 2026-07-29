const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");
const r5_model = require("../fhir-context/r5");
const _ = require("lodash");

const input = {
  get patientExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("../test/resources/r4/patient-example.json"));
  },

  get observationWithComponent() {
    return _.cloneDeep({
      resourceType: "Observation",
      status: "final",
      code: { text: "Panel" },
      component: [{
        code: { text: "Systolic" },
        valueString: "120",
        _valueString: { id: "vs1" }
      }]
    });
  },
};

/**
 * Evaluates a FHIRPath expression against the given resource using the R4 model.
 * @param {string} expr - the FHIRPath expression.
 * @param {Object} [resource] - the resource to evaluate against (defaults {}).
 * @param {Object} [options] - evaluation options.
 * @returns {Array|Promise<Array>} the evaluation result.
 */
function evalR4(expr, resource = {}, options) {
  return fhirpath.evaluate(resource, expr, {}, r4_model, options);
}


/**
 * Evaluates a FHIRPath expression against the given resource using the R5 model.
 * @param {string} expr - the FHIRPath expression.
 * @param {Object} [resource] - the resource to evaluate against (defaults {}).
 * @param {Object} [options] - evaluation options.
 * @returns {Array|Promise<Array>} the evaluation result.
 */
function evalR5(expr, resource = {}, options) {
  return fhirpath.evaluate(resource, expr, {}, r5_model, options);
}


/**
 * Evaluates a FHIRPath expression with environment variables using the R4 model.
 * @param {string} expr - the FHIRPath expression.
 * @param {Object} envVars - environment variables.
 * @param {Object} [resource] - the resource to evaluate against.
 * @param {Object} [options] - evaluation options.
 * @returns {Array|Promise<Array>} the evaluation result.
 */
function evalR4WithEnv(expr, envVars, resource = {}, options) {
  return fhirpath.evaluate(resource, expr, envVars, r4_model, options);
}


const numericChoiceExpression =
  "Coding { code: 'x', system: 'y', extension: " +
  "Extension { value: 1L } | " +
  "Extension { value: 99999999999999999999.9999 } }";
const integer64ValueExpression =
  "Coding { code: 'x', system: 'y', extension: " +
  "Extension { value: 1L } }.extension.value";


describe("Instance Selector / Object Creation", () => {

  it("creates a static Coding", () => {
    expect(evalR4("Coding { system : 'http://example.org/demo', code : 'c1' }"))
      .toStrictEqual([
        { system: "http://example.org/demo", code: "c1" }
      ]);
  });


  it("creates an Identifier with an explicit FHIR namespace", () => {
    expect(evalR4(
      "FHIR.Identifier { system : 'http://example.org/demo', value : 'N0001231' }"
    )).toStrictEqual([
      { system: "http://example.org/demo", value: "N0001231" }
    ]);
  });


  it("creates an empty object with the { : } syntax", () => {
    expect(evalR4("Period {:}")).toStrictEqual([{}]);
  });


  it("omits an element whose value evaluates to an empty collection", () => {
    expect(evalR4("Coding { system : 'http://x', code : {} }"))
      .toStrictEqual([{ system: "http://x" }]);
  });


  it("omits an element whose value is a missing path", () => {
    expect(evalR4(
      "Coding { system : 'http://x', code : missingProperty }", { resourceType: "Patient" }
    )).toStrictEqual([{ system: "http://x" }]);
  });


  it("creates a nested object", () => {
    expect(evalR4(
      "CodeableConcept { coding: Coding { " +
      "system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' } }"
    )).toStrictEqual([
      {
        coding: [
          { system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR" }
        ]
      }
    ]);
  });


  it("creates a deeply nested Identifier with a Date element", () => {
    expect(evalR4(
      "Identifier { " +
      "  type : CodeableConcept { coding: Coding { " +
      "    system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' } }, " +
      "  system : 'urn:oid:1.2.36.146.595.217.0.1', " +
      "  value : '12345', " +
      "  period : Period { start: @2001-05-06 } }"
    )).toStrictEqual([{
      type: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/v2-0203",
          code: "MR"
        }]
      },
      system: "urn:oid:1.2.36.146.595.217.0.1",
      value: "12345",
      period: { start: "2001-05-06" }
    }]);
  });


  it("supports navigation into a created object", () => {
    expect(evalR4(
      "Identifier { system : 'urn:oid:1.2', value : 'N1' }.value"
    )).toStrictEqual(["N1"]);
  });


  it("creates a primitive using the special 'value' element", () => {
    expect(evalR4("code { value: 'final' }")).toStrictEqual(["final"]);
  });


  it("serializes metadata-only primitive scalar elements", () => {
    expect(evalR4(
      "Patient { birthDate: date { id: 'bd1' } }"
    )).toStrictEqual([{
      resourceType: "Patient",
      _birthDate: { id: "bd1" }
    }]);
  });


  it("serializes metadata-only repeating primitive elements", () => {
    expect(evalR4(
      "HumanName { given: string { id: 'g1' } }"
    )).toStrictEqual([{
      _given: [{ id: "g1" }]
    }]);
  });


  it("keeps raw metadata-only primitive nodes", () => {
    const result = evalR4("date { id: 'bd1' }", {}, {
      resolveInternalTypes: false
    });

    expect(result).toHaveLength(1);
    expect(result[0].data).toBeNull();
    expect(result[0]._data).toStrictEqual({ id: "bd1" });
  });


  it("uses concrete FHIR JSON keys for choice-type elements", () => {
    expect(evalR4(
      "Extension { " +
      "url: 'http://example.org/fhir/StructureDefinition/demo', " +
      "value: Coding { system: 'http://example.org/system', code: 'c1' } }"
    )).toStrictEqual([{
      url: "http://example.org/fhir/StructureDefinition/demo",
      valueCoding: { system: "http://example.org/system", code: "c1" }
    }]);

    expect(evalR4(
      "Extension { value: Reference { reference: 'Patient/example' } }"
    )).toStrictEqual([{
      valueReference: { reference: "Patient/example" }
    }]);
  });


  it("returns JSON-safe values for numeric choice elements by default", () => {
    const result = evalR5(numericChoiceExpression, {}, { preciseMath: true });

    expect(result).toStrictEqual([{
      code: "x",
      system: "y",
      extension: [
        { valueInteger64: "1" },
        { valueDecimal: 100000000000000000000 }
      ]
    }]);
    expect(JSON.stringify(result)).toBe(
      '[{"code":"x","system":"y","extension":' +
      '[{"valueInteger64":"1"},{"valueDecimal":100000000000000000000}]}]'
    );
  });


  it("preserves numeric choice values when keepDecimalTypes is true", () => {
    const result = evalR5(numericChoiceExpression, {}, {
      preciseMath: true,
      keepDecimalTypes: true
    });
    const coding = result[0];

    expect(typeof coding.extension[0].valueInteger64).toBe("bigint");
    expect(coding.extension[0].valueInteger64).toBe(1n);
    expect(coding.extension[1].valueDecimal)
      .toBeInstanceOf(fhirpath.FP_Decimal);
    expect(coding.extension[1].valueDecimal.toString())
      .toBe("99999999999999999999.9999");
  });


  it("preserves numeric choice values in raw internal output", () => {
    const result = evalR5(numericChoiceExpression, {}, {
      preciseMath: true,
      resolveInternalTypes: false
    });
    const coding = result[0].data;

    expect(typeof coding.extension[0].valueInteger64).toBe("bigint");
    expect(coding.extension[0].valueInteger64).toBe(1n);
    expect(coding.extension[1].valueDecimal)
      .toBeInstanceOf(fhirpath.FP_Decimal);
    expect(coding.extension[1].valueDecimal.toString())
      .toBe("99999999999999999999.9999");
  });


  it("returns JSON-safe values when navigating to created integer64 elements", () => {
    const result = evalR5(integer64ValueExpression, {}, { preciseMath: true });

    expect(result).toStrictEqual(["1"]);
    expect(JSON.stringify(result)).toBe('["1"]');
  });


  it("preserves created integer64 values when keepDecimalTypes is true", () => {
    const result = evalR5(integer64ValueExpression, {}, {
      preciseMath: true,
      keepDecimalTypes: true
    });

    expect(typeof result[0]).toBe("bigint");
    expect(result[0]).toBe(1n);
  });


  it("preserves created integer64 values in raw internal output", () => {
    const result = evalR5(integer64ValueExpression, {}, {
      preciseMath: true,
      resolveInternalTypes: false
    });

    expect(typeof result[0].data).toBe("bigint");
    expect(result[0].data).toBe(1n);
  });


  it("does not reuse remembered types across evaluations", () => {
    const coding = { system: "http://example.org/system", code: "c1" };
    evalR4({
      base: "Coding",
      expression: "CodeableConcept { coding: $this }"
    }, coding);

    expect(() => evalR4WithEnv(
      "Extension { value: %coding }", { coding }
    )).toThrow(/cannot be resolved to a concrete choice type/);
  });


  it("supports navigation through created choice-type elements", () => {
    expect(evalR4(
      "Extension { " +
      "url: 'http://example.org/fhir/StructureDefinition/demo', " +
      "value: Coding { system: 'http://example.org/system', code: 'c1' } " +
      "}.value.code"
    )).toStrictEqual(["c1"]);
  });


  it("uses FHIR primitive constructors for choice-type elements", () => {
    expect(evalR4(
      "Extension { value: string { value: 'abc' } }"
    )).toStrictEqual([{ valueString: "abc" }]);

    expect(evalR4(
      "Extension { value: integer { value: 3 } }"
    )).toStrictEqual([{ valueInteger: 3 }]);

    expect(evalR4(
      "Extension { value: date { value: @2020 } }"
    )).toStrictEqual([{ valueDate: "2020" }]);
  });


  it("serializes xhtml elements as strings", () => {
    const div = '<div xmlns="http://www.w3.org/1999/xhtml">x</div>';

    expect(evalR4(
      "Narrative { status: 'generated', `div`: '" + div + "' }"
    )).toStrictEqual([{
      status: "generated",
      div
    }]);

    expect(evalR4(
      "Narrative { status: 'generated', `div`: xhtml { value: '" +
      div + "' } }"
    )).toStrictEqual([{
      status: "generated",
      div
    }]);
  });


  it("rejects non-FHIR namespaces in instance selectors", () => {
    expect(() => evalR4("System.Quantity { value: 3 'mg' }"))
      .toThrow(/only supports the FHIR namespace/);
  });


  it("keeps unqualified Quantity constructors in the FHIR namespace", () => {
    expect(evalR4("Quantity { value: 3, unit: 'mg' }.type().namespace"))
      .toStrictEqual(["FHIR"]);
  });


  it("creates a FHIR Quantity from decimal quantity fields", () => {
    expect(evalR4("Quantity { value: 3, unit: 'mg' }")).toStrictEqual([{
      value: 3,
      unit: "mg"
    }]);
  });


  it("rejects quantity literals for FHIR Quantity.value", () => {
    expect(() => evalR4("Quantity { value: 3 'mg' }"))
      .toThrow(/expects type "decimal"/);
  });


  it("rejects non-finite JavaScript numbers for decimal assignments", () => {
    [NaN, Infinity, -Infinity].forEach(value => {
      expect(() => evalR4WithEnv(
        "Quantity { value: %value }", { value }
      )).toThrow(/expects type "decimal"/);
      expect(() => evalR4WithEnv(
        "Extension { value: %value }", { value }
      )).toThrow(/expects type "decimal"/);
    });
  });


  it("rejects primitive scalar assignments with incompatible types", () => {
    [
      ["Coding { code: 3 }", /expects type "code"/],
      ["Patient { active: 'true' }", /expects type "boolean"/],
      ["integer { value: '3' }", /expects type "integer"/],
      ["integer { value: 3.1 }", /expects type "integer"/],
      ["date { value: 3 }", /expects type "date"/],
      ["dateTime { value: 3 }", /expects type "dateTime"/],
      ["time { value: 3 }", /expects type "time"/],
      ["Coding { system: 3 }", /expects type "uri"/],
      ["Attachment { url: 3 }", /expects type "url"/],
      ["id { value: 3 }", /expects type "id"/]
    ].forEach(([expr, error]) => {
      expect(() => evalR4(expr)).toThrow(error);
    });
  });


  it("rejects complex assignments with incompatible scalar types", () => {
    [
      ["Observation { subject: 'Patient/1' }", /expects type "Reference"/],
      ["Observation { code: 'abc' }", /expects type "CodeableConcept"/],
      ["Patient { managingOrganization: 'Organization/1' }",
        /expects type "Reference"/],
      ["Identifier { type: 'MR' }", /expects type "CodeableConcept"/]
    ].forEach(([expr, error]) => {
      expect(() => evalR4(expr)).toThrow(error);
    });
  });


  it("accepts compatible complex assignments", () => {
    expect(evalR4(
      "Observation { " +
      "code: CodeableConcept { text: 'Body weight' }, " +
      "subject: Reference { reference: 'Patient/example' } }"
    )).toStrictEqual([{
      resourceType: "Observation",
      code: { text: "Body weight" },
      subject: { reference: "Patient/example" }
    }]);
  });


  it("rejects untyped plain objects assigned to complex elements", () => {
    expect(() => evalR4WithEnv(
      "Observation { code: %code }",
      {
        code: {
          text: "Body weight",
          coding: [{ system: "http://loinc.org", code: "29463-7" }]
        }
      }
    )).toThrow(/expects type "CodeableConcept"/);

    expect(() => evalR4WithEnv(
      "Observation { code: CodeableConcept { coding: %coding } }",
      { coding: { system: "http://loinc.org", code: "29463-7" } }
    )).toThrow(/expects type "Coding"/);
  });


  it("uses FHIR Quantity JSON for quantity choice-type elements", () => {
    expect(evalR4("Extension { value: 3 'mg' }")).toStrictEqual([{
      valueQuantity: {
        value: 3,
        unit: "mg",
        system: "http://unitsofmeasure.org",
        code: "mg"
      }
    }]);
  });


  it("populates a collection element using the union operator", () => {
    expect(evalR4(
      "CodeableConcept { coding: " +
      "Coding { system: 'http://a', code: 'MR' } | " +
      "Coding { system: 'http://b', code: 'mr' } }"
    )).toStrictEqual([{
      coding: [
        { system: "http://a", code: "MR" },
        { system: "http://b", code: "mr" }
      ]
    }]);
  });


  it("serializes single-item repeating elements as arrays", () => {
    expect(evalR4("HumanName { given: code { value: 'a' } }"))
      .toStrictEqual([{ given: ["a"] }]);
  });


  it("uses repeating path data to serialize arrays", () => {
    const model = Object.create(r4_model);
    model.path2Repeating = { "HumanName.given": true };

    expect(fhirpath.evaluate(
      {},
      "HumanName { given: code { value: 'a' } }",
      {},
      model
    )).toStrictEqual([{ given: ["a"] }]);
  });


  it("rejects multiple values for scalar elements", () => {
    expect(() => evalR4("Coding { code: 'a' | 'b' }"))
      .toThrow(/not repeating/);
  });


  it("rejects multiple values for primitive value element", () => {
    expect(() => evalR4("code { value: 'a' | 'b' }"))
      .toThrow(/not repeating/);
  });


  it("rejects duplicate scalar element selectors", () => {
    expect(() => evalR4("Coding { code: 'a', code: 'b' }"))
      .toThrow(/already assigned/);
  });


  it("rejects duplicate element selectors when a value is empty", () => {
    [
      "Coding { code: {}, code: 'x' }",
      "Coding { code: 'x', code: {} }",
      "Extension { value: {}, value: 'x' }",
      "HumanName { given: {}, given: 'x' }"
    ].forEach(expr => {
      expect(() => evalR4(expr)).toThrow(/already assigned/);
    });
  });


  it("rejects duplicate repeating element selectors", () => {
    expect(() => evalR4("HumanName { given: 'a', given: 'b' }"))
      .toThrow(/already assigned/);
  });


  it("rejects duplicate choice-type element selectors", () => {
    [
      "Extension { value: 'a', value: 1 }",
      "Extension { valueString: 'a', value: 'b' }",
      "Extension { valueString: 'a', valueInteger: 1 }"
    ].forEach(expr => {
      expect(() => evalR4(expr)).toThrow(/already assigned/);
    });
  });


  it("sets resourceType when constructing a FHIR resource", () => {
    expect(evalR4("Observation { status: 'final' }"))
      .toStrictEqual([{ resourceType: "Observation", status: "final" }]);
  });


  it("rejects path-qualified types as non-FHIR namespaces", () => {
    expect(() => evalR4(
      "Observation.component { code: CodeableConcept { text: 'x' } }"
    )).toThrow(/only supports the FHIR namespace/);
  });


  it("validates BackboneElement fields against the assigned target element", () => {
    expect(evalR4(
      "Observation { component: BackboneElement { " +
      "code: CodeableConcept { text: 'Systolic' }, value: 120 'mm[Hg]' } }"
    )).toStrictEqual([{
      resourceType: "Observation",
      component: [{
        code: { text: "Systolic" },
        valueQuantity: {
          value: 120,
          unit: "mm[Hg]",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]"
        }
      }]
    }]);
  });


  it("supports FHIR.BackboneElement for assigned backbone elements", () => {
    expect(evalR4(
      "Patient { contact: FHIR.BackboneElement { " +
      "name: HumanName { family: 'Doe' } } }"
    )).toStrictEqual([{
      resourceType: "Patient",
      contact: [{
        name: { family: "Doe" }
      }]
    }]);
  });


  it("normalizes recursive BackboneElement paths when assigned", () => {
    expect(evalR4(
      "Questionnaire { item: BackboneElement { " +
      "linkId: 'a', item: BackboneElement { linkId: 'b' } } }"
    )).toStrictEqual([{
      resourceType: "Questionnaire",
      item: [{
        linkId: "a",
        item: [{
          linkId: "b"
        }]
      }]
    }]);
  });


  it("rejects BackboneElement fields that are invalid for the target", () => {
    expect(() => evalR4(
      "Observation { component: BackboneElement { notAField: 'x' } }"
    )).toThrow(/not a valid element for "Observation.component"/);
  });


  it("rejects BackboneElement child values with incompatible types", () => {
    [
      [
        "Observation { component: BackboneElement { code: 'x' } }",
        /expects type "CodeableConcept"/
      ],
      [
        "Observation { component: BackboneElement { value: 2147483648 } }",
        /expects type "integer"/
      ]
    ].forEach(([expr, error]) => {
      expect(() => evalR4(expr)).toThrow(error);
    });
  });


  it("rejects duplicate BackboneElement choice-type children", () => {
    [
      "Observation { component: BackboneElement { " +
        "valueString: 'a', valueInteger: 1 } }",
      "Observation { component: BackboneElement { " +
        "value: 'a', valueString: 'b' } }"
    ].forEach(expr => {
      expect(() => evalR4(expr)).toThrow(/already assigned/);
    });
  });


  it("preserves primitive types for BackboneElement choice children", () => {
    expect(evalR4(
      "CodeSystem { concept: BackboneElement { " +
      "code: 'c', property: BackboneElement { " +
      "code: 'p', value: code { value: 'status' } } } }"
    )).toStrictEqual([{
      resourceType: "CodeSystem",
      concept: [{
        code: "c",
        property: [{
          code: "p",
          valueCode: "status"
        }]
      }]
    }]);
  });


  it("preserves primitive metadata for BackboneElement choice children", () => {
    expect(evalR4(
      "CodeSystem { concept: BackboneElement { " +
      "code: 'c', property: BackboneElement { " +
      "code: 'p', value: code { id: 'v1' } } } }"
    )).toStrictEqual([{
      resourceType: "CodeSystem",
      concept: [{
        code: "c",
        property: [{
          code: "p",
          _valueCode: { id: "v1" }
        }]
      }]
    }]);
  });


  it("preserves primitive metadata for collection elements", () => {
    expect(evalR4(
      "HumanName { given: " +
      "code { value: 'a', id: 'one' } | " +
      "code { value: 'b', id: 'two' } }"
    )).toStrictEqual([{
      given: ["a", "b"],
      _given: [{ id: "one" }, { id: "two" }]
    }]);
  });


  it("drops __proto__ while preparing primitive metadata", () => {
    const patient = JSON.parse(
      '{"resourceType":"Patient","name":[{"given":["Ann"],"_given":[' +
      '{"__proto__":{"polluted":true},"id":"g1"}]}]}'
    );

    const result = evalR4(
      "HumanName { given: Patient.name.given }",
      patient
    );
    const givenMetadata = result[0]._given[0];

    expect(Object.prototype.hasOwnProperty.call(givenMetadata, "__proto__"))
      .toBe(false);
    expect(givenMetadata.id).toBe("g1");
    expect(Object.getPrototypeOf(givenMetadata)).toBe(Object.prototype);
    expect({}.polluted).toBeUndefined();
  });


  it("resolves asynchronous element selectors", async () => {
    const options = {
      async: true,
      userInvocationTable: {
        asyncCode: {
          arity: { 0: [] },
          internalStructures: true,
          fn() {
            fhirpath.util.checkAllowAsync(this, "asyncCode");
            return Promise.resolve(["c1"]);
          }
        }
      }
    };

    await expect(evalR4("Coding { code: asyncCode() }", {}, options))
      .resolves.toStrictEqual([{ code: "c1" }]);
  });


  it("converts an element using select()", () => {
    expect(evalR4(
      "Patient.select( Coding { " +
      "system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: gender } )",
      { resourceType: "Patient", gender: "male" }
    )).toStrictEqual([
      { system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "male" }
    ]);
  });


  it("uses %resource within element selectors", () => {
    expect(fhirpath.evaluate(
      { resourceType: "Patient", gender: "male" },
      "Patient.select( Coding { system: %resource.gender, code: gender } )",
      { resource: { resourceType: "Patient", gender: "male" } },
      r4_model
    )).toStrictEqual([{ system: "male", code: "male" }]);
  });


  it("returns empty when the input collection is empty", () => {
    expect(fhirpath.evaluate([], "Coding { code : 'c1' }", {}, r4_model))
      .toStrictEqual([]);
  });


  it("signals an error for an unknown type", () => {
    expect(() => evalR4("NotARealType { a: 1 }")).toThrow(
      /cannot be resolved to a valid type identifier/
    );
  });


  it("signals an error for an unknown element", () => {
    expect(() => evalR4("Coding { notAField: 'x' }")).toThrow(
      /not a valid element/
    );
  });


  it("signals an error for an unknown element with an empty value", () => {
    expect(() => evalR4("Coding { notAField: {} }")).toThrow(
      /not a valid element/
    );
  });


  it("validates element names before evaluating element values", () => {
    let called = false;
    const options = {
      userInvocationTable: {
        touch: {
          arity: { 0: [] },
          fn() {
            called = true;
            return ["x"];
          }
        }
      }
    };

    expect(() => evalR4("Coding { notAField: touch() }", {}, options))
      .toThrow(/not a valid element/);
    expect(called).toBe(false);
  });


  it("pre-validates duplicate element names before evaluating values", () => {
    let called = false;
    const options = {
      userInvocationTable: {
        touch: {
          arity: { 0: [] },
          fn() {
            called = true;
            return ["x"];
          }
        }
      }
    };

    expect(() => evalR4("Coding { code: touch(), code: 'b' }", {}, options))
      .toThrow(/already assigned/);
    expect(called).toBe(false);
  });


  it("pre-validates all element names before async values start", async () => {
    let called = false;
    const unhandled = [];
    const onUnhandledRejection = reason => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onUnhandledRejection);

    const options = {
      async: true,
      userInvocationTable: {
        rejectAsync: {
          arity: { 0: [] },
          internalStructures: true,
          fn() {
            called = true;
            fhirpath.util.checkAllowAsync(this, "rejectAsync");
            return Promise.reject(new Error("async boom"));
          }
        }
      }
    };

    try {
      expect(() => evalR4(
        "Coding { code: rejectAsync(), notAField: 'x' }", {}, options
      )).toThrow(/not a valid element/);
      await new Promise(resolve => setImmediate(resolve));

      expect(called).toBe(false);
      expect(unhandled).toStrictEqual([]);
    } finally {
      process.removeListener("unhandledRejection", onUnhandledRejection);
    }
  });


  it("pre-validates duplicate element names before async values start", async () => {
    let called = false;
    const unhandled = [];
    const onUnhandledRejection = reason => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onUnhandledRejection);

    const options = {
      async: true,
      userInvocationTable: {
        rejectAsync: {
          arity: { 0: [] },
          internalStructures: true,
          fn() {
            called = true;
            fhirpath.util.checkAllowAsync(this, "rejectAsync");
            return Promise.reject(new Error("async boom"));
          }
        }
      }
    };

    try {
      expect(() => evalR4(
        "Coding { code: rejectAsync(), code: 'b' }", {}, options
      )).toThrow(/already assigned/);
      await new Promise(resolve => setImmediate(resolve));

      expect(called).toBe(false);
      expect(unhandled).toStrictEqual([]);
    } finally {
      process.removeListener("unhandledRejection", onUnhandledRejection);
    }
  });


  it("consumes async value rejections when a later value throws", async () => {
    const unhandled = [];
    const onUnhandledRejection = reason => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onUnhandledRejection);

    const options = {
      async: true,
      userInvocationTable: {
        rejectAsync: {
          arity: { 0: [] },
          internalStructures: true,
          fn() {
            fhirpath.util.checkAllowAsync(this, "rejectAsync");
            return Promise.reject(new Error("async boom"));
          }
        },
        explode: {
          arity: { 0: [] },
          fn() {
            throw new Error("sync boom");
          }
        }
      }
    };

    try {
      expect(() => evalR4(
        "Coding { code: rejectAsync(), system: explode() }", {}, options
      )).toThrow(/sync boom/);
      await new Promise(resolve => setImmediate(resolve));

      expect(unhandled).toStrictEqual([]);
    } finally {
      process.removeListener("unhandledRejection", onUnhandledRejection);
    }
  });


  it("rejects direct primitive metadata selectors", () => {
    const meta = { id: "m1" };
    [
      "Patient { _birthDate: %meta }",
      "BackboneElement { _valueString: %meta }",
      "Observation { component: BackboneElement { " +
        "valueString: 'a', _valueInteger: %meta } }"
    ].forEach(expr => {
      expect(() => evalR4WithEnv(expr, { meta })).toThrow(/not allowed/);
    });
  });


  it("rejects untyped plain BackboneElement variables before inspecting children", () => {
    [
      { valueString: "a", _valueString: { id: "v1" } },
      { value: "a", _value: { id: "v1" } },
      { valueString: ["a"] }
    ].forEach(component => {
      expect(() => evalR4WithEnv(
        "Observation { component: %component }",
        { component }
      )).toThrow(
        /BackboneElement values must come from a typed FHIRPath result/
      );
    });
  });


  it("accepts BackboneElement ResourceNodes from prior unresolved evaluation", () => {
    const component = fhirpath.evaluate(
      input.observationWithComponent,
      "Observation.component",
      {},
      r4_model,
      { resolveInternalTypes: false }
    )[0];

    expect(evalR4WithEnv(
      "Observation { component: %component }",
      { component }
    )).toStrictEqual([{
      resourceType: "Observation",
      component: [{
        code: { text: "Systolic" },
        valueString: "120",
        _valueString: { id: "vs1" }
      }]
    }]);
  });


  it("accepts resolved BackboneElement values with hidden path metadata", () => {
    const component = fhirpath.evaluate(
      input.observationWithComponent,
      "Observation.component",
      {},
      r4_model,
      { resolveInternalTypes: true }
    )[0];

    expect(evalR4WithEnv(
      "Observation { component: %component }",
      { component }
    )).toStrictEqual([{
      resourceType: "Observation",
      component: [{
        code: { text: "Systolic" },
        valueString: "120",
        _valueString: { id: "vs1" }
      }]
    }]);
  });


  it("rejects unsafe property names as instance selector elements", () => {
    [
      "Coding { __proto__: Coding { code: 'x' }, system: 's' }",
      "Coding { constructor: 'x', system: 's' }",
      "Coding { prototype: 'x', system: 's' }"
    ].forEach(expr => {
      expect(() => evalR4(expr)).toThrow(/not allowed/);
    });
  });


  it("rejects unsafe names in standalone BackboneElement selectors", () => {
    [
      "BackboneElement { __proto__: BackboneElement { value: 1 } }",
      "BackboneElement { constructor: 'x' }",
      "BackboneElement { prototype: 'x' }"
    ].forEach(expr => {
      expect(() => evalR4(expr)).toThrow(/not allowed/);
    });
    expect({}.polluted).toBeUndefined();
  });


  it("rejects unsafe names in assigned BackboneElement selectors", () => {
    [
      "Observation { component: BackboneElement { " +
        "__proto__: BackboneElement { value: 1 } } }",
      "Observation { component: BackboneElement { constructor: 'x' } }",
      "Observation { component: BackboneElement { prototype: 'x' } }"
    ].forEach(expr => {
      expect(() => evalR4(expr)).toThrow(/not allowed/);
    });
    expect({}.polluted).toBeUndefined();
  });


  it("rejects prototype properties in untyped plain objects", () => {
    const code = JSON.parse(
      '{"__proto__":{"polluted":true},"text":"Body weight"}'
    );

    expect(() => evalR4WithEnv(
      "Observation { code: %code }", { code }
    )).toThrow(/expects type "CodeableConcept"/);
    expect({}.polluted).toBeUndefined();
  });


  it("rejects out-of-range FHIR integer primitive values", () => {
    expect(evalR4("integer { value: 2147483647 }"))
      .toStrictEqual([2147483647]);
    expect(evalR5("integer64 { value: 9223372036854775807L }"))
      .toStrictEqual(["9223372036854775807"]);

    [
      ["integer { value: 2147483648 }", /expects type "integer"/],
      ["integer { value: -2147483649 }", /expects type "integer"/],
      ["unsignedInt { value: -1 }", /expects type "unsignedInt"/],
      ["positiveInt { value: 0 }", /expects type "positiveInt"/],
      ["Extension { value: 2147483648 }", /expects type "integer"/]
    ].forEach(([expr, error]) => {
      expect(() => evalR4(expr)).toThrow(error);
    });

    expect(() => evalR5(
      "integer64 { value: 9223372036854775808L }"
    )).toThrow(/expects type "integer64"/);
  });


  it("rejects unsafe JavaScript numbers for integer64 assignments", () => {
    expect(() => fhirpath.evaluate(
      {},
      "integer64 { value: %value }",
      { value: Number.MAX_SAFE_INTEGER + 1 },
      r5_model
    )).toThrow(/expects type "integer64"/);
  });


  it("requires a FHIR model context for instance selectors", () => {
    expect(() => fhirpath.evaluate({}, "Coding { code: 'x' }"))
      .toThrow(/requires a FHIR model context/);
  });


  it("signals an error when the input collection has multiple items", () => {
    expect(() => fhirpath.evaluate(
      [{ resourceType: "Patient" }, { resourceType: "Patient" }],
      "Coding { code : 'c1' }", {}, r4_model
    )).toThrow(/at most one item/);
  });


  it("builds objects from the patient example via select()", () => {
    expect(evalR4(
      "Patient.identifier.select( " +
      "Identifier { system: 'urn:system', value: value } )",
      input.patientExample
    )).toStrictEqual([
      { system: "urn:system", value: "12345" }
    ]);
  });

});
