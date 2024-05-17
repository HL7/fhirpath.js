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
  get questionnaireResponseWithEmbeddedScores() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("./resources/phq9-response-with-embedded-scores.json"));
  },
  get questionnaireResponseWithUnlinkedAnswers() {
    // Clone input file contents to avoid one test affecting another
    return _.cloneDeep(require("./resources/phq9-response-with-unlinked-answers.json"));
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

    it("should return correct results when getting some scores from the QuestionnaireResponse resource", () => {
      const res = fhirpath.evaluate(
        input.questionnaireResponseWithEmbeddedScores,
        '%context.repeat(item).where(linkId!=\'total\').answer.weight().sum()',
        {
          questionnaire: input.questionnaire
        }, r4_model);
      expect(res).toStrictEqual([17]);
    });

    it("should throw an error when getting scores for answers that doesn't exists in the Questionnaire", () => {
      const res = () => fhirpath.evaluate(
        input.questionnaireResponseWithUnlinkedAnswers,
        '%context.repeat(item).where(linkId!=\'total\').answer.weight().sum()',
        {
          questionnaire: input.questionnaire
        }, r4_model);
      expect(res).toThrow('Questionnaire answerOptions with these linkIds were not found: /44250-9-unlinked-item,/44259-0.');
    });
  });

});
