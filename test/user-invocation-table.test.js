const fhirpath = require('../src/fhirpath');

describe('custom fn to square values', () => {

  it('Can apply custom fn', () => {

    const options = {
      userInvocationTable: {
        pow: {fn: (inputs,pow=2)=>inputs.map(i => Math.pow(i, pow)), arity: {0: [], 1: ["Integer"]}},
      }
    };

    let retrieved = fhirpath.evaluate({"a": [5,6,7]}, "a.pow()", null, null, options);
    expect(retrieved).toEqual([25, 36, 49]);

    retrieved = fhirpath.evaluate({}, "(5 | 6 | 7).pow()", null, null, options);
    expect(retrieved).toEqual([25, 36, 49]);

    retrieved = fhirpath.evaluate({"a": [5,6,7]}, "a.pow(3)", null, null, options);
    expect(retrieved).toEqual([125, 216, 343]);

    retrieved = fhirpath.evaluate({"a": [5,6,7], "b": 3}, "a.pow(%context.b)", null, null, options);
    expect(retrieved).toEqual([125, 216, 343]);

  });

  it('Can apply custom fn with internal structures', () => {
    const valData = fhirpath.util.valData;

    const options = {
      userInvocationTable: {
        pow: {fn: (inputs,pow=2)=>inputs.map(i => Math.pow(valData(i), pow)), arity: {0: [], 1: ["Integer"]}, internalStructures: true},
      }
    };

    let retrieved = fhirpath.evaluate({"a": [5,6,7]}, "a.pow()", null, null, options);
    expect(retrieved).toEqual([25, 36, 49]);

    retrieved = fhirpath.evaluate({}, "(5 | 6 | 7).pow()", null, null, options);
    expect(retrieved).toEqual([25, 36, 49]);

    retrieved = fhirpath.evaluate({"a": [5,6,7]}, "a.pow(3)", null, null, options);
    expect(retrieved).toEqual([125, 216, 343]);

    retrieved = fhirpath.evaluate({"a": [5,6,7], "b": 3}, "a.pow(%context.b)", null, null, options);
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

    const options = {
      userInvocationTable: {
        concept: {fn: (input) => [concepts[input[0]]], arity: {0: []}},
      }
    };

    let expr =  "next.concept().display";
    let retrieved = fhirpath.evaluate(concepts.a, expr, null, null, options);
    expect(retrieved).toEqual(["B"]);

    expr = "next.concept().select($this.display)";
    retrieved = fhirpath.evaluate(concepts.a, expr, null, null, options);
    expect(retrieved).toEqual(["B"]);

    expr = "next.concept().select($this | $this.next.concept()).display";
    retrieved = fhirpath.evaluate(concepts.a, expr, null, null, options);
    expect(retrieved).toEqual(["B", "C"]);

  });
});
