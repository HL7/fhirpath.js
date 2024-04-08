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

  it("simplest variable", () => {
    let expr = `defineVariable('v1', 'value1').select(%v1)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["value1"]);
  });

  it("simple use of a variable", () => {
    let expr = `defineVariable('fam', name.first()).select(%fam.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter", "James"]);
  });

  it("simple use of a variable 2 selects", () => {
    let expr = `defineVariable('fam', name.first()).select(%fam.given).first()`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter"]);
  });

  it("use of a variable in separate contexts", () => {
    // this example defines the same variable name in 2 different contexts
    let expr = `defineVariable('fam', name.first()).select(%fam.given) | defineVariable('fam', name.skip(1).first()).select(%fam.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Peter", "James", "Jim"]);
  });

  it("use of a variable in separate contexts defined in 2 but used in 1", () => {
    // this example defines the same variable name in 2 different contexts, 
    // but only uses it in the second. This ensures that the first context doesn't remain when using it in another context
    let expr = `defineVariable('fam', name.first()).where(active.not()) | defineVariable('fam', name.skip(1).first()).select(%fam.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["Jim"]);
  });

  it("use of different variables in different contexts", () => {
    let expr = `defineVariable('fam', name.first()).select(id & '-' & %fam.given.join('|')) | defineVariable('fam2', name.skip(1).first()).select(%fam2.given)`;
    let ast = fhirpath.parse(expr);
    ast = PruneTree(ast);
    console.log("ast", JSON.stringify(ast, null, 2));
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["example-Peter|James", "Jim"]);
  });

  it("2 vars, one unused", () => {
    let expr = `defineVariable('fam', name.first()).active | defineVariable('fam2', name.skip(1).first()).select(%fam2.given)`;
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual([true, "Jim"]);
  });

  it("composite variable use", () => {
    let expr = `defineVariable('v1', 'value1').select(%v1).trace('data').defineVariable('v2', 'value2').select($this & ':' & %v1 & '-' & %v2) | defineVariable('v3', 'value3').select(%v3)`;
    // let ast = fhirpath.parse(expr);
    // ast = PruneTree(ast);
    // console.log("ast", JSON.stringify(ast, null, 2));
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["value1:value1-value2", "value3"]);
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

  it("redefining variable throws error", () => {
    let expr = `defineVariable('v1').defineVariable('v1').select(%v1)`;
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Variable %v1 already defined");
  });

  // Yury's tests
  it("defineVariable() could not be the first child", () => {
    // test with a variable that is not in the context that should throw an error
    let expr = `Patient.name.defineVariable('fam1', first()).active | Patient.name.defineVariable('fam2', skip(1).first()).select(%fam1.given)`;
    // let ast = fhirpath.parse(expr);
    // ast = PruneTree(ast);
    // console.log("ast", JSON.stringify(ast, null, 2));
    expect(() => {
      fhirpath.evaluate(input.patientExample, expr, r4_model); 
    }).toThrowError("Attempting to access an undefined environment variable: fam1");
  });

  it("sequence of variable definitions tweak", () => {
    let expr = `Patient.name.defineVariable('fam2', skip(1).first()).defineVariable('fam3', %fam2.given+%fam2.given).select(%fam3)`;
    let ast = fhirpath.parse(expr);
    ast = PruneTree(ast);
    console.log("ast", JSON.stringify(ast, null, 2));
    expect(fhirpath.evaluate(input.patientExample, expr, r4_model))
      .toStrictEqual(["JimJim", "JimJim", "JimJim"]);
  });

  it("sequence of variable definitions original", () => {
    let expr = `Patient.name.defineVariable('fam1', first()).exists(%fam1) | Patient.name.defineVariable('fam2', skip(1).first()).defineVariable('fam3', %fam2.given+%fam2.given).select(%fam3)`;
    let ast = fhirpath.parse(expr);
    ast = PruneTree(ast);
    console.log("ast", JSON.stringify(ast, null, 2));
    const result = fhirpath.evaluate(input.patientExample, expr, r4_model);
    console.log(result);
    // the duplicate JimJim values are removed due to the | operator
    expect(result)
      .toStrictEqual([true, "JimJim"]);
  });

  it("multi-tree vars", () => {
    let expr = `defineVariable('root', 'r1-').select(defineVariable('v1', 'v1').defineVariable('v2', 'v2').select(%v1 | %v2)).select(%root & $this & %v1)`;
    let ast = fhirpath.parse(expr);
    ast = PruneTree(ast);
    console.log("ast", JSON.stringify(ast, null, 2));
    const result = fhirpath.evaluate(input.patientExample, expr, r4_model);
    console.log(result);
    // the duplicate JimJim values are removed due to the | operator
    expect(result)
      .toStrictEqual(["r1-v1", "r1-v2"]);
  });
});

function PruneTree(ast){
  if (ast.terminalNodeText)
    delete ast.terminalNodeText;
  if (ast.type === 'ParamList')
    delete ast.children;
  if (ast.type === 'ExternalConstant')
    delete ast.children;

  if (ast.children){
    ast.children.forEach(PruneTree);
  }
  return ast;
}