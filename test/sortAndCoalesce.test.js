const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");

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
    it("coalesce with single parameter", () => {
      const patient = getPatientWithId();
      const expr = "coalesce(id)";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("pat1");
    });

    it("coalesce with two parameters", () => {
      const patient = getPatientWithId();
      const expr = "coalesce(name, id)";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("pat1");
    });

    it("coalesce with multiple parameters including empty collections", () => {
      const patient = getPatientWithId();
      const expr = "coalesce(name, telecom, {}, address, extension, 'five', id, birthDate)";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("five");
    });
  });

  describe("sort function", () => {
    it("basic collection without sort", () => {
      const expr = "(1|2|3)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });

    it("sort already ordered numbers", () => {
      const expr = "(1|2|3).sort()";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });

    it("sort unordered numbers", () => {
      const expr = "(3|2|1).sort()";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });

    it("sort with explicit $this parameter", () => {
      const expr = "(3|2|1).sort($this)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });

    it("sort descending numeric", () => {
      const expr = "(1|2|3).sort($this desc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(3);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(1);
    });

    it("sort descending alphabetic", () => {
      const expr = "('a'|'b'|'c').sort($this desc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("c");
      expect(result[1]).toBe("b");
      expect(result[2]).toBe("a");
    });

    it("sort ascending alphabetic", () => {
      const expr = "('b'|'a'|'c').sort($this asc)";
      const result = fhirpath.evaluate({}, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("a");
      expect(result[1]).toBe("b");
      expect(result[2]).toBe("c");
    });

    it("sort patient given names", () => {
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

    it("sort patient names by family and first given name", () => {
      const patient = getPatientWithNames();
      const expr = "Patient.name.sort(family, given.first()).id";
      const result = fhirpath.evaluate(patient, expr, r4_model);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("3"); // Pos, Belinda
      expect(result[1]).toBe("2"); // Pos, Brian
      expect(result[2]).toBe("1"); // Smith, Peter
    });
  });
});