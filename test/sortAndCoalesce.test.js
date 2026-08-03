const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");
const { FP_Type } = require("../src/types");


describe("sortAndCoalesce", () => {

  // Test data setup
  const getPatientWithId = () => ({
    resourceType: "Patient",
    id: "pat1",
    birthDate: "1990-10-01",
    active: true
  });

  const getPatientWithNames = () => ({
    resourceType: "Patient",
    id: "pat1",
    name: [
      {
        id: "1",
        family: "Smith",
        given: ["Peter", "James"]
      },
      {
        id: "3",
        family: "Pos",
        given: ["Belinda"]
      },
      {
        id: "2",
        family: "Pos",
        given: ["Brian", "R"]
      }
    ]
  });


  describe("coalesce function", () => {

    it("should coalesce with single parameter", () => {
      const patient = getPatientWithId();
      const expr = "coalesce(id)";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("pat1");
    });


    it("should coalesce with two parameters", () => {
      const patient = getPatientWithId();
      const expr = "coalesce(name, id)";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("pat1");
    });


    it("should coalesce with multiple parameters including empty collections", () => {
      const patient = getPatientWithId();
      const expr = "coalesce(name, telecom, {}, address, extension, 'five', id, birthDate)";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("five");
    });


    it("should coalesce with more than ten parameters", () => {
      const expr =
        "coalesce({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 'x')";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toEqual(["x"]);
    });


    it("should preserve outer $this while evaluating coalesce params on the input collection", () => {
      const patient = getPatientWithNames();
      const outerThisResult = fhirpath.evaluate(
        patient,
        "Patient.name.coalesce($this)",
        r4_model
      );
      const inputCollectionResult = fhirpath.evaluate(
        patient,
        "Patient.name.coalesce(family)",
        r4_model
      );

      expect(outerThisResult).toHaveLength(1);
      expect(outerThisResult[0].resourceType).toBe("Patient");
      expect(outerThisResult[0].id).toBe("pat1");
      expect(inputCollectionResult).toEqual(["Smith", "Pos", "Pos"]);
    });


    it("should coalesce short-circuits later async arguments after first non-empty async result", async () => {
      const callCounts = {
        asyncFirst: 0,
        asyncSecond: 0
      };

      const options = {
        async: true,
        userInvocationTable: {
          asyncFirst: {
            fn: () => {
              callCounts.asyncFirst += 1;
              return Promise.resolve(["first"]);
            },
            arity: {0: []}
          },
          asyncSecond: {
            fn: () => {
              callCounts.asyncSecond += 1;
              return Promise.resolve(["second"]);
            },
            arity: {0: []}
          }
        }
      };

      const result = await fhirpath.evaluate({}, "coalesce(asyncFirst(), asyncSecond())", {}, r4_model, options);
      expect(result).toEqual(["first"]);
      expect(callCounts.asyncFirst).toBe(1);
      expect(callCounts.asyncSecond).toBe(0);
    });


    it("should coalesce continues after empty async result and then short-circuits remaining async arguments", async () => {
      const callCounts = {
        asyncEmpty: 0,
        asyncWinner: 0,
        asyncNever: 0
      };

      const options = {
        async: true,
        userInvocationTable: {
          asyncEmpty: {
            fn: () => {
              callCounts.asyncEmpty += 1;
              return Promise.resolve([]);
            },
            arity: {0: []}
          },
          asyncWinner: {
            fn: () => {
              callCounts.asyncWinner += 1;
              return Promise.resolve(["winner"]);
            },
            arity: {0: []}
          },
          asyncNever: {
            fn: () => {
              callCounts.asyncNever += 1;
              return Promise.resolve(["never"]);
            },
            arity: {0: []}
          }
        }
      };

      const result = await fhirpath.evaluate(
        {},
        "coalesce(asyncEmpty(), asyncWinner(), asyncNever())",
        {},
        r4_model,
        options
      );
      expect(result).toEqual(["winner"]);
      expect(callCounts.asyncEmpty).toBe(1);
      expect(callCounts.asyncWinner).toBe(1);
      expect(callCounts.asyncNever).toBe(0);
    });


    it("should coalesce short-circuits async arguments when a prior sync argument is non-empty", () => {
      const callCounts = {
        syncWinner: 0,
        asyncNever: 0
      };

      const options = {
        async: true,
        userInvocationTable: {
          syncWinner: {
            fn: () => {
              callCounts.syncWinner += 1;
              return ["winner"];
            },
            arity: {0: []}
          },
          asyncNever: {
            fn: () => {
              callCounts.asyncNever += 1;
              return Promise.resolve(["never"]);
            },
            arity: {0: []}
          }
        }
      };

      const result = fhirpath.evaluate({}, "coalesce(syncWinner(), asyncNever())", {}, r4_model, options);
      expect(result).toEqual(["winner"]);
      expect(callCounts.syncWinner).toBe(1);
      expect(callCounts.asyncNever).toBe(0);
    });


    it("should coalesce short-circuits remaining arguments after sync result that follows an empty async argument", async () => {
      const callCounts = {
        asyncEmpty: 0,
        syncWinner: 0,
        asyncNever: 0
      };

      const options = {
        async: true,
        userInvocationTable: {
          asyncEmpty: {
            fn: () => {
              callCounts.asyncEmpty += 1;
              return Promise.resolve([]);
            },
            arity: {0: []}
          },
          syncWinner: {
            fn: () => {
              callCounts.syncWinner += 1;
              return ["winner"];
            },
            arity: {0: []}
          },
          asyncNever: {
            fn: () => {
              callCounts.asyncNever += 1;
              return Promise.resolve(["never"]);
            },
            arity: {0: []}
          }
        }
      };

      const result = await fhirpath.evaluate(
        {},
        "coalesce(asyncEmpty(), syncWinner(), asyncNever())",
        {},
        r4_model,
        options
      );
      expect(result).toEqual(["winner"]);
      expect(callCounts.asyncEmpty).toBe(1);
      expect(callCounts.syncWinner).toBe(1);
      expect(callCounts.asyncNever).toBe(0);
    });

  });


  describe("sort function", () => {

    it("should basic collection without sort", () => {
      const expr = "(1|2|3)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });


    it("should sort already ordered numbers", () => {
      const expr = "(1|2|3).sort()";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });


    it("should sort unordered numbers", () => {
      const expr = "(3|2|1).sort()";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });


    it("should sort collections with several equal numeric values", () => {
      const expr = "(2).combine(1).combine(2).combine(1).combine(2).sort()";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toEqual([1, 1, 2, 2, 2]);
    });


    it("should sort equal Number and Quantity values without dropping duplicates", () => {
      const expr = "(2 '1').combine(2).combine(1).combine(1 '1')." +
        "combine(2).combine(1 '1').combine(1).sort()." +
        "select($this.toString())";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toHaveLength(7);
      expect(result.filter(v => v === "1")).toHaveLength(2);
      expect(result.filter(v => v === "1 '1'")).toHaveLength(2);
      expect(result.filter(v => v === "2")).toHaveLength(2);
      expect(result.filter(v => v === "2 '1'")).toHaveLength(1);
      expect(result.slice(0, 4).every(v => v === "1" || v === "1 '1'"))
        .toBe(true);
      expect(result.slice(4).every(v => v === "2" || v === "2 '1'"))
        .toBe(true);
    });


    it("should sort with explicit $this parameter", () => {
      const expr = "(3|2|1).sort($this)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });


    it("should sort with delimited sort invocation", () => {
      const expr = "(3|2|1).`sort`($this)";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toEqual([1, 2, 3]);
    });


    it("should sort descending with delimited sort invocation", () => {
      const expr = "(3|1|2).`sort`($this desc)";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toEqual([3, 2, 1]);
    });


    it("should sort descending numeric", () => {
      const expr = "(1|2|3|10).sort($this desc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toBe(10);
      expect(result[1]).toBe(3);
      expect(result[2]).toBe(2);
      expect(result[3]).toBe(1);
    });


    it("should sort descending alphabetic", () => {
      const expr = "('a'|'b'|'c').sort($this desc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("c");
      expect(result[1]).toBe("b");
      expect(result[2]).toBe("a");
    });


    it("should sort ascending alphabetic", () => {
      const expr = "('b'|'a'|'c').sort($this asc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("a");
      expect(result[1]).toBe("b");
      expect(result[2]).toBe("c");
    });


    it("should sort with more than ten parameters", () => {
      const expr =
        "(3|2|1).sort({}, {}, {}, {}, {}, {}, " +
        "{}, {}, {}, {}, $this)";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toEqual([1, 2, 3]);
    });


    it("should sort without evaluating later selectors when primary key is sufficient", () => {
      const expr = "(3|2|1).sort($this, iif($this = 2, (1|2), 0))";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toEqual([1, 2, 3]);
    });


    it("should not inherit outer $index in nested sort selector scope", () => {
      const expr =
        "(1).select((3|2|1).sort(iif($index = 0, (1|2), 0)))";
      const result = fhirpath.evaluate({}, expr, r4_model);

      expect(result).toEqual([3, 2, 1]);
    });


    it("should sort skips later selector function calls for unique primary keys", () => {
      const callCounts = {
        neverCalled: 0
      };
      const options = {
        userInvocationTable: {
          neverCalled: {
            fn: () => {
              callCounts.neverCalled += 1;
              return [0];
            },
            arity: {0: []}
          }
        }
      };

      const result = fhirpath.evaluate(
        {},
        "(3|2|1).sort($this, neverCalled())",
        {},
        r4_model,
        options
      );
      expect(result).toEqual([1, 2, 3]);
      expect(callCounts.neverCalled).toBe(0);
    });


    it("should sort patient given names", () => {
      const patient = {
        resourceType: "Patient",
        id: "pat1",
        name: [
          {
            family: "Smith",
            given: ["Peter", "James"]
          }
        ]
      };
      const expr = "Patient.name.given.sort()";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toBe("James");
      expect(result[1]).toBe("Peter");
    });


    it("should sort patient names by family and first given name", () => {
      const patient = getPatientWithNames();
      const expr = "Patient.name.sort(family, given.first()).id";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("3"); // Pos, Belinda
      expect(result[1]).toBe("2"); // Pos, Brian
      expect(result[2]).toBe("1"); // Smith, Peter
    });


    it("should sort descending dates", () => {
      const expr = "(@2024|@2025|@2026).sort($this desc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("2026");
      expect(result[1]).toBe("2025");
      expect(result[2]).toBe("2024");
    });


    it("should sort descending times", () => {
      const expr = "(@T10:45|@T12:30|@T08:15|@T13:30).sort($this desc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toBe("13:30");
      expect(result[1]).toBe("12:30");
      expect(result[2]).toBe("10:45");
      expect(result[3]).toBe("08:15");
    });


    it("should sort quantity ResourceNodes using converted quantity values", () => {
      const obs = {
        resourceType: "Observation",
        component: [
          {
            id: "a",
            valueQuantity: {
              value: 1,
              unit: "g",
              system: "http://unitsofmeasure.org",
              code: "g"
            }
          },
          {
            id: "b",
            valueQuantity: {
              value: 500,
              unit: "mg",
              system: "http://unitsofmeasure.org",
              code: "mg"
            }
          }
        ]
      };

      const result = fhirpath.evaluate(obs, "Observation.component.sort(valueQuantity).id", {}, r4_model);
      expect(result).toEqual(["b", "a"]);
    });


    it("should sort mixed Number and Quantity values consistently regardless of input order", () => {
      const variables = { n: 10 };
      const sortNumberThenQuantity = fhirpath.evaluate(
        {},
        "(%n).combine(2 '1').sort().select($this.toString())",
        variables,
        r4_model
      );
      const sortQuantityThenNumber = fhirpath.evaluate(
        {},
        "(2 '1').combine(%n).sort().select($this.toString())",
        variables,
        r4_model
      );

      expect(sortNumberThenQuantity).toEqual(["2 '1'", "10"]);
      expect(sortQuantityThenNumber).toEqual(["2 '1'", "10"]);
    });


    it("should sort throws for incomparable Number and FP_Type regardless of input order", () => {
      class IncomparableType extends FP_Type {
        compare() {
          return null;
        }
      }

      const variables = {
        a: new IncomparableType(),
        b: 1
      };
      const evaluateAThenB = () => {
        fhirpath.evaluate({}, "%a.combine(%b).sort()", variables, r4_model);
      };
      const evaluateBThenA = () => {
        fhirpath.evaluate({}, "%b.combine(%a).sort()", variables, r4_model);
      };

      expect(evaluateAThenB).toThrow("Cannot sort incomparable values");
      expect(evaluateBThenA).toThrow("Cannot sort incomparable values");
    });


    it("should sort throws when key expression returns more than one item", () => {
      const patient = getPatientWithNames();
      const evaluate = () => {
        fhirpath.evaluate(patient, "Patient.name.sort(given).id", {}, r4_model);
      };
      expect(evaluate).toThrow("Sort expression evaluation error");
    });


    it("should sort throws for incomparable values", () => {
      const evaluate = () => {
        fhirpath.evaluate({}, "(1 month | 30 'd').sort()", {}, r4_model);
      };
      expect(evaluate).toThrow("Cannot sort incomparable values");
    });


    it("should sort throws for non-primitive object values", () => {
      const evaluate = () => {
        fhirpath.evaluate({ values: [{ id: "a" }, { id: "b" }] }, "values.sort()", {}, r4_model);
      };
      expect(evaluate).toThrow("Cannot sort by non-primitive type: Object");
    });


    it("should sort throws when right side sort key is a boxed primitive", () => {
      const options = {
        userInvocationTable: {
          boxedKey: {
            fn: (inputs) => {
              const n = Number(fhirpath.util.valData(inputs[0]));
              return [n === 2 ? new Number(n) : n];
            },
            arity: {0: []},
            internalStructures: true
          }
        }
      };
      const evaluate = () => {
        fhirpath.evaluate({}, "(2|1).sort(boxedKey())", {}, r4_model, options);
      };
      expect(evaluate).toThrow("Cannot sort by non-primitive type: Number");
    });


    it("should sort supports async key expressions when async mode is enabled", async () => {
      const options = {
        async: true,
        userInvocationTable: {
          asyncIdentity: {
            fn: (inputs) => Promise.resolve(inputs[0]),
            arity: {0: []}
          }
        }
      };
      const result = await fhirpath.evaluate({}, "(3|2|1).sort(asyncIdentity())", {}, r4_model, options);
      expect(result).toEqual([1, 2, 3]);
    });


    it("should sort async key expression errors are wrapped once", async () => {
      const options = {
        async: true,
        userInvocationTable: {
          asyncDup: {
            fn: (inputs) => Promise.resolve([inputs[0], inputs[0]]),
            arity: {0: []}
          }
        }
      };
      await expect(
        fhirpath.evaluate({}, "(3|2|1).sort(asyncDup())", {}, r4_model, options)
      ).rejects.toThrow("Sort expression evaluation error: expected a singleton value, but got [3,3]");
    });

  });


});
