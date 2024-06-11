// This file contains a class that implements the Terminology Service API.
// See https://build.fhir.org/fhirpath.html#txapi for details.

class Terminologies {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  /**
   * This example function calls the Terminology Service $validate-code operation
   * on a value set. See Terminology Service API: https://build.fhir.org/fhirpath.html#txapi
   * The source code of this function is based on this script:
   * https://gist.github.com/brianpos/97e1237470d76835ea9a35bf8e021ca6#file-fhirpath-async-ts
   * @param {string} valueset - a canonical URL reference to a value set. In the original
   *  specification this could also be an actual ValueSet, but I don't want to
   *  complicate this example.
   * @param {string|Object} coded - either a Coding, a CodeableConcept,
   *  or a resource element that is a code.
   * @param {string} [params] - a URL encoded string with other parameters for the
   *  validate-code operation (e.g. 'date=2011-03-04&displayLanguage=en').
   * @return {Promise<Parameters>} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of the validation
   *  operation.
   */
  validateVS(valueset, coded, params = '') {
    const httpHeaders = {
      "Accept": "application/fhir+json; charset=utf-8",
    };
    const httpPostHeaders = {
      "Accept": "application/fhir+json; charset=utf-8",
      "Content-Type": "application/fhir+json; charset=utf-8",
    };
    let myHeaders = new Headers(httpHeaders);

    const requestUrl = `${this.serverUrl}/ValueSet/$validate-code`;

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
      response = fetch(
        requestUrl + (params ? '?' + params : ''),
        { method: "POST", headers: myHeaders, body: JSON.stringify(parameters) }
      );
    } else if (typeof coded === "string") {
      const queryParams = new URLSearchParams({
        url: valueset,
        code: coded,
        inferSystem: true
      });
      response = fetch(
        `${requestUrl}?${queryParams.toString() + (params ? '&' + params : '')}`,
        { headers: myHeaders }
      );
    } else {
      if (coded.code) {
        const queryParams = new URLSearchParams({
          url: valueset ?? '',
          system: coded.system ?? '',
          code: coded.code
        });
        response = fetch(
          `${requestUrl}?${queryParams.toString() + (params ? '&' + params : '')}`,
          { headers: myHeaders }
        );
      }
    }

    return response
      .then(r => r.json())
      .then(resultJson => {
        if (response) {
          let params = resultJson;
          if (params && params.parameter) {
            return params;
          }
          let outcomeResult = resultJson;
          if (outcomeResult && outcomeResult.issue) {
            throw outcomeResult;
          }
        }
      })
      .catch(() => {
        const key = createIndexKeyMemberOf(coded, valueset);
        throw new Error("Failed to check membership: " + key);
      });
  }
}

/**
 * Create an Index Key for the validateVS function
 * The source code of this function was borrowed from this script:
 * https://gist.github.com/brianpos/97e1237470d76835ea9a35bf8e021ca6#file-fhirpath-async-ts
 * @param {Object|string} value - either a Coding, a CodeableConcept, or
 *  a resource element that is a code.
 * @param {string} valueset - a canonical URL reference to a value set.
 * @returns {string|undefined}
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

module.exports = Terminologies;
