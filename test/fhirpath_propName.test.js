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
          _text: { id: "em1" },
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

  let result = fhirpath.evaluate(
    fhirData,
    "select(Patient.name.given.where($this = 'F') | Patient.name.family | Patient.contact.skip(1) | Patient.contact.relationship.text[1] | 'Brian').trace('output')",
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
  expect(output[0].fullPropertyName()).toBe("Patient.name[0].given[1]");
  expect(output[1].fullPropertyName()).toBe("Patient.name[0].family");
  expect(output[2].fullPropertyName()).toBe("Patient.name[1].family");
  expect(output[3].fullPropertyName()).toBe("Patient.contact[1]");
  expect(output[4].fullPropertyName()).toBe(
    "Patient.contact[1].relationship[0].text"
  );
  expect(output[5]).toBe("Brian"); // which is not a ResourceNode
});

test("useContextFromExpressionResult", () => {
  // This test will use the result of the expression as the context for the next expression.
  const contextExpr = "contact.where(relationship.text = 'Emergency')"; // will return the name of the contact with the relationship text 'Emergency'.
  const expression = "name.given"; // will return the given name(s) of the contact.

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

  for (const element of output) {
    let node = element;
    if (node.fullPropertyName)
      console.log(node.fullPropertyName(), JSON.stringify(node.convertData()));
  }

  expect(result).toBeDefined();
  expect(output).toBeDefined();
  expect(output.length).toBe(1);
  expect(output[0].fullPropertyName()).toBe("Patient.contact[1]");
  const contextNode = output[0];

  // Second expression using the result of the first expression as context
  output = []; // Reset output for the next expression
  result = fhirpath.evaluate(
    contextNode.convertData(), // Use the result of the first expression as context
    {
      base: contextNode.fullPropertyName(),
      expression: "select("+expression+").trace('output_processing')"
    },
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
  expect(output.length).toBe(2);
  expect(output[0].fullPropertyName()).toBe("Patient.contact[1].name.given[0]");
  expect(output[0].convertData()).toBe("Jane");
  expect(output[1].fullPropertyName()).toBe("Patient.contact[1].name.given[1]");
  expect(output[1].convertData()).toBe("Francis");
});
