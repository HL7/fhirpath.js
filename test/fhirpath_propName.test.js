/* eslint-disable linebreak-style */

const fhirpath = require("../src/fhirpath");
const fhirpath_r4_model = require("../fhir-context/r4");

const testPatient = {
  resourceType: "Patient",
  name: [
    {
      family: "Doe",
      given: ["John", "F"],
    },
    {
      family: "Smith",
      _family: {
        id: "smith-id",
        extension: [
          {
            url: "http://hl7.org/fhir/StructureDefinition/humanname-own-prefix",
            valueString: "VV"
          }
        ]
      },
      given: ["Jeremy"],
    },
  ],
  contact: [
    {
      relationship: [
        {
          text: "Parent",
        },
      ],
      name: {
        family: "Jones",
        given: ["John"],
      },
    },
    {
      relationship: [
        {
          _text: {
            id: "em1",
            "extension": [
              {
                "url": "someUrl",
                "valueString": "someString"
              }
            ]
          },
          text: "Emergency",
        },
      ],
      name: {
        family: "Smith",
        given: ["Jane", "Francis"],
      },
    },
  ],
};

test("traceProcessingHasAccessToPropertyNames", () => {
  let fhirData = testPatient;
  let environment = {
    resource: fhirData,
    rootResource: fhirData,
  };

  let output = [];
  let tracefunction = function (x, label) {
    if (Array.isArray(x)) {
      for (let item of x) {
        output.push(item);
      }
    } else {
      output.push(x);
    }
    return x;
  };

  let options = {
    traceFn: tracefunction,
    async: false,
  };

  // An array containing pairs of expression and the result of calling
  // fullPropertyName() on the ResourceNodes returned by that expression.
  const cases = [
    ["Patient.name.given.where($this = 'F')",
      ["Patient.name[0].given[1]"]],
    ["Patient.name.family",
      ["Patient.name[0].family", "Patient.name[1].family"]],
    ["Patient.contact.skip(1)",
      ["Patient.contact[1]"]],
    ["Patient.contact.relationship.text[1]",
      ["Patient.contact[1].relationship[0].text"]],
    ["'Brian'", [""]],
    ["%factory.decimal(0.3, %factory.Extension('someExt', 'someString')).extension('someExt').value",
      ["decimal.extension[0].value"]],
    ["Patient.contact.relationship.text[1].extension('someUrl').value",
      ["Patient.contact[1].relationship[0].text.extension[0].value"]]
  ];

  cases.forEach(([expression, results]) => {
    output = [];
    fhirpath.evaluate(
      fhirData,
      `${expression}.trace('output')`,
      environment,
      fhirpath_r4_model,
      options
    );

    expect(output.map(o => o?.fullPropertyName?.() || '')).toEqual(results);
  });
});

test("useContextFromExpressionResult", () => {
  // This test will use the result of the expression as the context for the next expression.
  const contextExpr = "contact.where(relationship.text = 'Emergency')"; // will return the name of the contact with the relationship text 'Emergency'.
  const expression = "name.where($this is HumanName).given"; // will return the given name(s) of the contact.

  let fhirData = testPatient;
  let environment = {
    resource: fhirData,
    rootResource: fhirData,
  };

  let output = [];
  let traceFunction = function (x, label) {
    if (label === "output_processing") {
      if (Array.isArray(x)) {
        for (let item of x) {
          output.push(item);
        }
      } else {
        output.push(x);
      }
    }
    return x;
  };

  let options = {
    traceFn: traceFunction,
    async: false,
  };

  let result = fhirpath.evaluate(
    fhirData,
    "select(" + contextExpr + ").trace('output_processing')",
    environment,
    fhirpath_r4_model,
    options
  );

  expect(result).toBeDefined();
  expect(output).toBeDefined();
  expect(output.length).toBe(1);
  expect(output[0].fullPropertyName()).toBe("Patient.contact[1]");
  const contextData = result;

  // Second expression using the "result" of the first expression as context
  output = []; // Reset output for the next expression
  result = fhirpath.evaluate(
    contextData, // Use the result of the first expression as context
    "select("+expression+").trace('output_processing')",
    environment,
    fhirpath_r4_model,
    options
  );

  expect(result).toBeDefined();
  expect(output).toBeDefined();
  expect(output.length).toBe(2);
  expect(output[0].fullPropertyName()).toBe("Patient.contact[1].name.given[0]");
  expect(output[0].convertData()).toBe("Jane");
  expect(output[1].fullPropertyName()).toBe("Patient.contact[1].name.given[1]");
  expect(output[1].convertData()).toBe("Francis");
});

test("traceProcessingHasAccessToPrimitiveExtensionPropertyNames", () => {
  let fhirData = testPatient;
  let environment = {
    resource: fhirData,
    rootResource: fhirData,
  };

  let output = [];
  let tracefunction = function (x, label) {
    if (Array.isArray(x)) {
      for (let item of x) {
        output.push(item);
      }
    } else {
      output.push(x);
    }
    return x;
  };

  let options = {
    traceFn: tracefunction,
    async: false,
  };

  let result = fhirpath.evaluate(
    fhirData,
    "select(Patient.name.skip(1).first().descendants().trace('output'))",
    environment,
    fhirpath_r4_model,
    options
  );

  for (const element of output) {
    let node = element;
    if (node.fullPropertyName)
      console.log(node.fullPropertyName(), JSON.stringify(node.convertData()));
  }

  expect(result).toBeDefined();
  expect(output).toBeDefined();
  expect(output.length).toBe(6);
  expect(output[0].fullPropertyName()).toBe("Patient.name[1].family");
  expect(output[1].fullPropertyName()).toBe("Patient.name[1].given[0]");
  expect(output[2].fullPropertyName()).toBe("Patient.name[1].family.id");
  expect(output[3].fullPropertyName()).toBe("Patient.name[1].family.extension[0]");
  expect(output[4].fullPropertyName()).toBe("Patient.name[1].family.extension[0].url");
  expect(output[5].fullPropertyName()).toBe("Patient.name[1].family.extension[0].value");
});
