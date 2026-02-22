const fhirpath = require("../src/fhirpath");
const fhirpath_r4_model = require("../fhir-context/r4");

const testPatient = {
  resourceType: "Patient",
  id: "example",
  name: [
    {
      family: "Doe",
      given: ["John", "F"],
    },
    {
      family: "Smith",
      given: ["Jeremy"],
    },
  ],
  contact: [
    {
      relationship: [
        { text: "Parent" },
      ],
      name: {
        family: "Jones",
        given: ["John"],
      },
    },
    {
      relationship: [
        { text: "Emergency" },
      ],
      name: {
        family: "Smith",
        given: ["Jane", "Francis"],
      },
    },
  ],
  birthDate: "1990-01-15",
  active: true,
};

const testObservation = {
  resourceType: "Observation",
  id: "obs1",
  status: "final",
  code: {
    coding: [
      { system: "http://loinc.org", code: "85354-9" },
      { system: "http://snomed.info/sct", code: "75367002" },
    ],
    text: "Blood pressure"
  },
  component: [
    {
      code: {
        coding: [
          { system: "http://loinc.org", code: "8480-6" }
        ]
      },
      valueQuantity: { value: 120, unit: "mmHg" }
    },
    {
      code: {
        coding: [
          { system: "http://loinc.org", code: "8462-4" }
        ]
      },
      valueQuantity: { value: 80, unit: "mmHg" }
    }
  ]
};

const testQuestionnaireResponse = {
  resourceType: "QuestionnaireResponse",
  id: "qr1",
  status: "completed",
  item: [
    {
      linkId: "q1",
      answer: [
        { valueString: "Answer 1" }
      ]
    },
    {
      linkId: "q2",
      item: [
        {
          linkId: "q2.1",
          answer: [
            { valueString: "Nested answer" }
          ]
        }
      ]
    }
  ]
};


describe("pathname()", () => {
  describe("basic pathname without short parameter", () => {
    test("returns path for a simple property", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.id.pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual(["Patient.id[0]"]);
    });

    test("returns path for an array element", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.first().pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual(["Patient.name[0]"]);
    });

    test("returns paths for multiple array elements", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([
        "Patient.name[0]",
        "Patient.name[1]"
      ]);
    });

    test("returns path for nested properties with indexers", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.first().family.pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual(["Patient.name[0].family[0]"]);
    });

    test("returns paths for given names", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.first().given.pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([
        "Patient.name[0].given[0]",
        "Patient.name[0].given[1]"
      ]);
    });

    test("returns path for deeply nested property", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.contact.skip(1).name.given.first().pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual(["Patient.contact[1].name[0].given[0]"]);
    });

    test("returns path for Observation.component codings", () => {
      const result = fhirpath.evaluate(
        testObservation,
        "Observation.component.first().code.coding.first().pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual(["Observation.component[0].code[0].coding[0]"]);
    });
  });

  describe("pathname with short parameter", () => {
    test("short=true removes indexers for singleton elements", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.first().family.pathname(true)",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      // family is a singleton (not an array in JSON), so no indexer with short
      expect(result).toEqual(["Patient.name[0].family"]);
    });

    test("short=true keeps indexers for array elements", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.pathname(true)",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      // name is an array, so indexers are kept
      expect(result).toEqual([
        "Patient.name[0]",
        "Patient.name[1]"
      ]);
    });

    test("short=true on deeply nested path", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.contact.skip(1).name.given.first().pathname(true)",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      // contact = array[1], name = singleton, given = array[0]
      expect(result).toEqual(["Patient.contact[1].name.given[0]"]);
    });

    test("short=false behaves same as default", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.first().family.pathname(false)",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual(["Patient.name[0].family[0]"]);
    });

    test("short=true on Observation.component.code.coding", () => {
      const result = fhirpath.evaluate(
        testObservation,
        "Observation.component.first().code.coding.first().pathname(true)",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      // component = array[0], code = singleton, coding = array[0]
      expect(result).toEqual(["Observation.component[0].code.coding[0]"]);
    });
  });

  describe("computed values are excluded", () => {
    test("string concatenation result is excluded", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "(Patient.name.first().family + ' test').pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([]);
    });

    test("numeric computation result is excluded", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "(1 + 2).pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([]);
    });

    test("string literal is excluded", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "'hello'.pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([]);
    });
  });

  describe("empty collection handling", () => {
    test("returns empty for empty input collection", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.where(family = 'nonexistent').pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([]);
    });
  });

  describe("choice type handling", () => {
    test("handles choice type (value[x]) elements", () => {
      const result = fhirpath.evaluate(
        testObservation,
        "Observation.component.first().value.pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      // value[x] is a choice type — should use the base name 'value'
      expect(result).toEqual(["Observation.component[0].value[0]"]);
    });

    test("handles choice type with short=true", () => {
      const result = fhirpath.evaluate(
        testObservation,
        "Observation.component.first().value.pathname(true)",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      // value[x] is a singleton — short removes the indexer
      expect(result).toEqual(["Observation.component[0].value"]);
    });
  });

  describe("QuestionnaireResponse paths", () => {
    test("returns path for nested QR items", () => {
      const result = fhirpath.evaluate(
        testQuestionnaireResponse,
        "QuestionnaireResponse.item.skip(1).item.first().answer.first().value.pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([
        "QuestionnaireResponse.item[1].item[0].answer[0].value[0]"
      ]);
    });

    test("short form for nested QR items", () => {
      const result = fhirpath.evaluate(
        testQuestionnaireResponse,
        "QuestionnaireResponse.item.skip(1).item.first().answer.first().value.pathname(true)",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual([
        "QuestionnaireResponse.item[1].item[0].answer[0].value"
      ]);
    });
  });

  describe("used with other functions", () => {
    test("pathname inside where clause", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.where(family = 'Smith').pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(result).toEqual(["Patient.name[1]"]);
    });

    test("pathname result is string type", () => {
      const result = fhirpath.evaluate(
        testPatient,
        "Patient.name.first().pathname()",
        {},
        fhirpath_r4_model,
        { resolveInternalTypes: false }
      );
      expect(typeof result[0]).toBe("string");
    });
  });
});
