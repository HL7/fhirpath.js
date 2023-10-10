const fhirpath = require('../src/fhirpath');
const engine = require('../src/misc');

describe('custom fn to square values', () => {

  it('Can apply custom fn', () => {

    const context = {
      userInvocationTable: {
        pow: {fn: (inputs,pow=2)=>inputs.map(i => Math.pow(i?.data ?? i, pow)), arity: {0: [], 1: ["Integer"]}},
      }
    };

    let retrieved = fhirpath.evaluate({"a": [5,6,7]}, "a.pow()", context);
    expect(retrieved).toEqual([25, 36, 49]);

    retrieved = fhirpath.evaluate({}, "(5 | 6 | 7).pow()", context);
    expect(retrieved).toEqual([25, 36, 49]);

    retrieved = fhirpath.evaluate({"a": [5,6,7]}, "a.pow(3)", context);
    expect(retrieved).toEqual([125, 216, 343]);

  });
});


describe('concept', () => {
  it('Can follow concept links', () => {

    const concepts = {
      a: {next: "b", display: "A"},
      b: {next: "c", display: "B"},
      c: {display: "C"}
    };

    const context = {
      userInvocationTable: {
        concept: {fn: ([{data: ref}]) => [concepts[ref]] , arity: {0: []}},
      }
    };

    let expr =  "next.concept().display";
    let retrieved = fhirpath.evaluate(concepts.a, expr, context);
    expect(retrieved).toEqual(["B"]);

    expr = "next.concept().select($this.display)";
    retrieved = fhirpath.evaluate(concepts.a, expr, context);
    expect(retrieved).toEqual(["B"]);

    expr = "next.concept().select($this | $this.next.concept()).display";
    retrieved = fhirpath.evaluate(concepts.a, expr, context);
    expect(retrieved).toEqual(["B", "C"]);

  });
});