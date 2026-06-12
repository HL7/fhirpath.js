const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");
const _ = require("lodash");

const input = {
  get patientExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("../test/resources/r4/patient-example.json"));
  },
};

/**
 * Evaluates a FHIRPath expression against the given resource using the R4 model.
 * @param {string} expr - the FHIRPath expression.
 * @param {Object} [resource] - the resource to evaluate against (defaults {}).
 * @returns {Array} the evaluation result.
 */
function evalR4(expr, resource = {}) {
  return fhirpath.evaluate(resource, expr, {}, r4_model);
}

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
      { coding: { system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR" } }
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
        coding: {
          system: "http://terminology.hl7.org/CodeSystem/v2-0203",
          code: "MR"
        }
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
