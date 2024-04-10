const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");
const _ = require("lodash");
const input = {
  get patientExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("../test/resources/patient-example.json"));
  },
  get conceptMapExample() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("../test/resources/conceptmap-example.json"));
  },
};

describe("defineVariable", () => {

  it("simplest variable", () => {
    let expr = "defineVariable('v1', 'value1').select(%v1)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["value1"]);
  });

  it("simple use of a variable", () => {
    let expr = "defineVariable('n1', name.first()).select(%n1.given)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter", "James"]);
  });

  it("simple use of a variable 2 selects", () => {
    let expr = "defineVariable('n1', name.first()).select(%n1.given).first()";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter"]);
  });

  it("use of a variable in separate contexts", () => {
    // this example defines the same variable name in 2 different contexts
    // this shouldn't report an issue where the variable is being redefined (as it's not in the same context)
    let expr = "defineVariable('n1', name.first()).select(%n1.given) | defineVariable('n1', name.skip(1).first()).select(%n1.given)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter", "James", "Jim"]);
  });

  it("use of a variable in separate contexts defined in 2 but used in 1", () => {
    // this example defines the same variable name in 2 different contexts, 
    // but only uses it in the second. This ensures that the first context doesn't remain when using it in another context
    let expr = "defineVariable('n1', name.first()).where(active.not()) | defineVariable('n1', name.skip(1).first()).select(%n1.given)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Jim"]);
  });

  it("use of different variables in different contexts", () => {
    let expr = "defineVariable('n1', name.first()).select(id & '-' & %n1.given.join('|')) | defineVariable('n2', name.skip(1).first()).select(%n2.given)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["example-Peter|James", "Jim"]);
  });

  it("2 vars, one unused", () => {
    let expr = "defineVariable('n1', name.first()).active | defineVariable('n2', name.skip(1).first()).select(%n2.given)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual([true, "Jim"]);
  });

  it("composite variable use", () => {
    let expr = "defineVariable('v1', 'value1').select(%v1).trace('data').defineVariable('v2', 'value2').select($this & ':' & %v1 & '-' & %v2) | defineVariable('v3', 'value3').select(%v3)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["value1:value1-value2", "value3"]);
  });


  it("use of a variable outside context throws error", () => {
    // test with a variable that is not in the context that should throw an error
    let expr = "defineVariable('n1', name.first()).active | defineVariable('n2', name.skip(1).first()).select(%n1.given)";
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Attempting to access an undefined environment variable: n1");
  });

  it("use undefined variable throws error", () => {
    // test with a variable that is not in the context that should throw an error
    let expr = "select(%fam.given)";
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Attempting to access an undefined environment variable: fam");
  });

  it("redefining variable throws error", () => {
    let expr = "defineVariable('v1').defineVariable('v1').select(%v1)";
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Variable %v1 already defined");
  });

  // Yury's tests
  it("defineVariable() could not be the first child", () => {
    // test with a variable that is not in the context that should throw an error
    let expr = "Patient.name.defineVariable('n1', first()).active | Patient.name.defineVariable('n2', skip(1).first()).select(%n1.given)";
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Attempting to access an undefined environment variable: n1");
  });

  it("sequence of variable definitions tweak", () => {
    let expr = "Patient.name.defineVariable('n2', skip(1).first()).defineVariable('res', %n2.given+%n2.given).select(%res)";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["JimJim", "JimJim", "JimJim"]);
  });

  it("sequence of variable definitions original", () => {
    // A variable defined based on another variable
    let expr = "Patient.name.defineVariable('n1', first()).exists(%n1) | Patient.name.defineVariable('n2', skip(1).first()).defineVariable('res', %n2.given+%n2.given).select(%res)";
    const result = fhirpath.evaluate(input.patientExample, expr, r4_model);
    // the duplicate JimJim values are removed due to the | operator
    expect(result)
      .toStrictEqual([true, "JimJim"]);
  });

  it("multi-tree vars valid", () => {
    let expr = "defineVariable('root', 'r1-').select(defineVariable('v1', 'v1').defineVariable('v2', 'v2').select(%v1 | %v2)).select(%root & $this)";
    const result = fhirpath.evaluate(input.patientExample, expr, r4_model);
    expect(result)
      .toStrictEqual(["r1-v1", "r1-v2"]);
  });

  it("multi-tree vars exception", () => {
    let expr = "defineVariable('root', 'r1-').select(defineVariable('v1', 'v1').defineVariable('v2', 'v2').select(%v1 | %v2)).select(%root & $this & %v1)";
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Attempting to access an undefined environment variable: v1");
  });

  it('defineVariable with compile success', () => {
    let expr = "defineVariable('root', 'r1-').select(defineVariable('v1', 'v1').defineVariable('v2', 'v2').select(%v1 | %v2)).select(%root & $this)";
    let f = fhirpath.compile(expr, r4_model);
    expect(f(input.patientExample))
      .toStrictEqual(["r1-v1", "r1-v2"]);
  });

  it('defineVariable with compile error', () => {
    let expr = "defineVariable('root', 'r1-').select(defineVariable('v1', 'v1').defineVariable('v2', 'v2').select(%v1 | %v2)).select(%root & $this & %v1)";
    let f = fhirpath.compile(expr, r4_model);
    expect(() => { f(input.patientExample); })
      .toThrowError("Attempting to access an undefined environment variable: v1");
  });

  it('defineVariable cant overwrite an environment var', () => {
    let expr = "defineVariable('context', 'oops')";
    let f = fhirpath.compile(expr, r4_model);
    expect(() => { f(input.patientExample); })
      .toThrowError("Environment Variable %context already defined");
  });

  it("realistic example with conceptmap", () => {
    let expr = `
    group.select(
      defineVariable('grp')
      .element
      .select(
        defineVariable('ele')
        .target
        .select(%grp.source & '|' & %ele.code & ' ' & equivalence &' ' & %grp.target & '|' & code)
      )
     )
     .trace('all')
     .isDistinct()
    `;
    expect(fhirpath.evaluate(input.conceptMapExample, expr, r4_model)
    ).toStrictEqual([
      false
    ]);
  });

  it('defineVariable in function parameters (1)', () => {
    let expr = "defineVariable(defineVariable('param','ppp').select(%param), defineVariable('param','value').select(%param)).select(%ppp)";
    let f = fhirpath.compile(expr, r4_model);
    expect(f(input.patientExample))
      .toStrictEqual(["value"]);
  });

  it('defineVariable in function parameters (2)', () => {
    let expr = "'aaa'.replace(defineVariable('param', 'aaa').select(%param), defineVariable('param','bbb').select(%param))";
    let f = fhirpath.compile(expr, r4_model);
    expect(f(input.patientExample))
      .toStrictEqual(["bbb"]);
  });  

  it('defineVariable in function parameters (3)', () => {
    let expr = "'aaa'.defineVariable('x', 'xxx').union(defineVariable('v', 'bbb').select(%v)).defineVariable('v', 'ccc').union(select(%v))";
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["aaa", "bbb", "ccc"]);
  });
});
