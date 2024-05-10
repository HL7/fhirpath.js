const fhirpath = require("../src/fhirpath");
const r4_model = require("../fhir-context/r4");
const _ = require("lodash");

const input = {
  get questionnaire() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("../test/resources/phq9.json"));
  },
  get questionnaireResponse() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("../test/resources/phq9-response.json"));
  },
};

describe("supplements", () => {

  describe('weight()', () => {
    it("should return correct results when getting scores from the Questionnaire resource", () => {
      const res = fhirpath.evaluate(
        input.questionnaireResponse,
        '%context.repeat(item).where(linkId!=\'total\').answer.weight().sum()',
        {
          questionnaire: input.questionnaire
        }, r4_model);
      expect(res).toStrictEqual([15]);
    });
  });

});
