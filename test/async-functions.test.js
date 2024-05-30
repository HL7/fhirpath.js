const fhirpath = require('../src/fhirpath');
const model = require('../fhir-context/r4');
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const resource = require('./resources/observation-example.json');

/**
 * This example function calls the Terminology Service $validate-code operation
 * on a value set. See Terminology Service API: https://build.fhir.org/fhirpath.html#txapi
 * The source code of this function is based on this script:
 * https://gist.github.com/brianpos/97e1237470d76835ea9a35bf8e021ca6#file-fhirpath-async-ts
 * @param valueset - a canonical URL reference to a value set. In the original
 *  specification this could also be an actual ValueSet, but I don't want to
 *  complicate this example.
 * @param coded - either a Coding, a CodeableConcept, or a resource element that
 *  is a code.
 * @param [params] - a URL encoded string with other parameters for the
 *  validate-code operation (e.g. 'date=2011-03-04&displayLanguage=en').
 * @return {Promise<Parameters>} - a Parameters resource
 *  (https://build.fhir.org/parameters.html) with the results of the validation
 *  operation.
 */
async function validateVS(valueset, coded, params = '') {
  try {
    const httpHeaders = {
      "Accept": "application/fhir+json; charset=utf-8",
    };
    const httpPostHeaders = {
      "Accept": "application/fhir+json; charset=utf-8",
      "Content-Type": "application/fhir+json; charset=utf-8",
    };
    let myHeaders = new Headers(httpHeaders);

    const requestUrl = "https://lforms-fhir.nlm.nih.gov/baseR4/ValueSet/$validate-code";

    let response;
    if (coded.coding) {
      const parameters = {
        "resourceType": "Parameters",
        "parameter": [
          {
            "name": "url",
            "valueUri": valueset
          },
          {
            "name": "codeableConcept",
            "valueCodeableConcept": coded
          }
        ]
      };
      myHeaders = new Headers(httpPostHeaders);
      response = await fetch(requestUrl, { method: "POST", headers: myHeaders, body: JSON.stringify(parameters) });
    } else if (typeof coded === "string") {
      const queryParams = new URLSearchParams({
        url: valueset,
        code: coded,
      });
      response = await fetch(`${requestUrl}?${queryParams.toString()}`, { headers: myHeaders });
    } else {
      if (coded.code) {
        const queryParams = new URLSearchParams({
          url: valueset ?? '',
          system: coded.system ?? '',
          code: coded.code,
        });
        response = await fetch(`${requestUrl}?${queryParams.toString()}`, { headers: myHeaders });
      }
    }

    if (response) {
      const resultJson = await response.json();
      let params = resultJson;
      if (params && params.parameter) {
        let param = params.parameter.find((p) => p.name === "result");
        if (param) {
          return param.valueBoolean;
        }
      }
      let outcomeResult = resultJson;
      if (outcomeResult && outcomeResult.issue) {
        throw outcomeResult;
      }
    }
  } catch (err) {
    const key = createIndexKeyMemberOf(coded, valueset);
    throw new Error("Failed to check membership: " + key);
  }
}

/**
 * Create an Index Key for the validateVS function
 * The source code of this function was borrowed from this script:
 * https://gist.github.com/brianpos/97e1237470d76835ea9a35bf8e021ca6#file-fhirpath-async-ts
 * @param {Object|string} value - either a Coding, a CodeableConcept, or
 *  a resource element that is a code.
 * @param {string} valueset - a canonical URL reference to a value set.
 * @returns
 */
function createIndexKeyMemberOf(value, valueset) {
  if (typeof value === "string") {
    return value + " - " + valueset;
  }
  if (value.code) {
    return value.system + "|" + value.code + " - " + valueset;
  }
  if (value.coding) {
    // return the same as for coding by joining each of the codings with a comma
    return value.coding.map((c) => c.system + "|" + c.code).join(",") + " - " + valueset;
  }
  return undefined;
}

describe('Async functions', () => {

  describe('memberOf', () => {
    it('should work when async functions are enabled', (done) => {

      let result = fhirpath.evaluate(
        resource,
        "Observation.code.coding.where(memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult'))",
        { terminologies: { validateVS }},
        model,
        { async: true }
      );
      expect(result instanceof Promise).toBe(true);
      result.then((r) => {
        expect(r).toEqual([{"code": "29463-7", "display": "Body Weight", "system": "http://loinc.org"}]);
        done();
      })
    });

    it('should throw an exception when async functions are disabled', () => {

      let result = () => fhirpath.evaluate(
        resource,
        "Observation.code.coding.where(memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult'))",
        { terminologies: { validateVS }},
        model,
        { }
      );
      expect(result).toThrow('The asynchronous function "memberOf" is not allowed. To enable asynchronous functions, use the async=true or async="always" option.');
    });
  });

  it('should be a conversion of the result to a Promise when option async is set to "always"', (done) => {
    let result = fhirpath.evaluate(
      resource,
      "Observation.code.coding[0]",
      {},
      model,
      { async: 'always' }
    );
    expect(result instanceof Promise).toBe(true);
    result.then((r) => {
      expect(r).toEqual([{"code": "29463-7", "display": "Body Weight", "system": "http://loinc.org"}]);
      done();
    })
  });

  it('should not be a conversion of the result to a Promise by default', () => {
    let result = fhirpath.evaluate(
      resource,
      "Observation.code.coding[0]",
      {},
      model,
      {}
    );
    expect(result instanceof Promise).toBe(false);
    expect(result).toEqual([{"code": "29463-7", "display": "Body Weight", "system": "http://loinc.org"}]);
  });
});


