const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");
const _ = require("lodash");
const input = {
  get patientExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("../test/resources/patient-example.json"));
  },
};

describe("defineVariable", () => {

  it("simple use of a variable", () => {
    let expr = `defineVariable('fam', name.first()).select(%fam.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter", "James"]);
  });

  it("use of a variable in separate contexts", () => {
    // this example defines the same variable name in 2 different contexts
    let expr = `defineVariable('fam', name.first()).select(%fam.given) | defineVariable('fam', name.skip(1).first()).select(%fam.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter", "James", "Jim"]);
  });

  it("use of different variables in different contexts", () => {
    let expr = `defineVariable('fam', name.first()).select(%fam.given) | defineVariable('fam2', name.skip(1).first()).select(%fam2.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter", "James", "Jim"]);
  });

  it("2 vars, one unused", () => {
    let expr = `defineVariable('fam', name.first()).active | defineVariable('fam2', name.skip(1).first()).select(%fam2.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual([true, "Jim"]);
  });


  it("use of a variable outside context throws error", () => {

    // test with a variable that is not in the context that should throw an error
    let expr = `defineVariable('fam', name.first()).active | defineVariable('fam2', name.skip(1).first()).select(%fam.given)`;
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Attempting to access an undefined environment variable: fam");
  });

  it("use undefined variable throws error", () => {

    // test with a variable that is not in the context that should throw an error
    let expr = `select(%fam.given)`;
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Attempting to access an undefined environment variable: fam");
  });
});
