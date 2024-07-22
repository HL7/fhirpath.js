// This file contains a class that implements the Terminology Service API.
// See https://build.fhir.org/fhirpath.html#txapi for details.

class Terminologies {
  constructor(terminologyUrl) {
    this.terminologyUrl = terminologyUrl;
    this.invocationTable = Terminologies.invocationTable;
  }

  // Same as fhirpath.invocationTable, but for %terminologies methods
  static invocationTable = {
    validateVS: {fn: Terminologies.validateVS,  arity: { 2: ['String', 'AnySingletonAtRoot'], 3: ['String', 'AnySingletonAtRoot', 'String']} }
  };

  /**
   * This example function calls the Terminology Service $validate-code operation
   * on a value set. See Terminology Service API: https://build.fhir.org/fhirpath.html#txapi
   * The source code of this function is based on this script:
   * https://gist.github.com/brianpos/97e1237470d76835ea9a35bf8e021ca6#file-fhirpath-async-ts
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
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
  static validateVS(self, valueset, coded, params = '') {
    checkParams(params);
    const httpHeaders = {
      "Accept": "application/fhir+json; charset=utf-8",
    };
    const httpPostHeaders = {
      "Accept": "application/fhir+json; charset=utf-8",
      "Content-Type": "application/fhir+json; charset=utf-8",
    };
    let myHeaders = new Headers(httpHeaders);

    const requestUrl = `${self[0].terminologyUrl}/ValueSet/$validate-code`;

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
      const queryParams1 = new URLSearchParams({
        url: valueset,
      });
      //  Workaround for the case where we don't have a system. See discussion here:
      //  https://chat.fhir.org/#narrow/stream/179266-fhirpath/topic/Problem.20with.20the.20.22memberOf.22.20function.20and.20R4.20servers
      response = fetch(
        `${self[0].terminologyUrl}/ValueSet?${queryParams1.toString() + (params ? '&' + params : '')}`,
        {headers: myHeaders}
      )
        .then(r => r.json())
        .then((bundle) => {
          const system = bundle?.entry?.length === 1 && (
            getSystemFromArrayItems(bundle.entry[0].resource.expansion?.contains)
            || getSystemFromArrayItems(bundle.entry[0].resource.compose?.include)
          );
          if (system) {
            const queryParams2 = new URLSearchParams({
              url: valueset,
              code: coded,
              system
            });
            return fetch(
              `${requestUrl}?${queryParams2.toString() + (params ? '&' + params : '')}`,
              { headers: myHeaders }
            );
          } else {
            throw new Error('The valueset does not have a single code system.');
          }
        });
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

    // In Jest unit tests, a promise returned by 'fetch' is not an instance of
    // Promise that we have in our application context, so we use Promise.resolve
    // to do the conversion.
    return Promise.resolve(response)
      .then(r => r.json())
      .then(params => {
        if (params?.parameter) {
          return params;
        }
        throw new Error(params);
      })
      .catch(() => {
        const key = createIndexKeyMemberOf(coded, valueset);
        throw new Error("Failed to check membership: " + key);
      });
  }
}

/**
 * Create and returns an Index Key for the validateVS function
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

/**
 * Throws an exception if the params parameter is not empty and is not a valid
 * URL-encoded string.
 * @param {string|undefined} params - a URL encoded string with parameters
 *  (e.g. 'date=2011-03-04&displayLanguage=en').
 */
function checkParams(params) {
  if (params?.split('&').find(
    p => {
      const v = p.split('=');
      return v.length <= 2 && v.find(x => encodeURIComponent(decodeURIComponent(x)) !== x);
    }
  )) {
    throw new Error(`"${params}" should be a valid URL-encoded string`);
  }
}

/**
 * Returns the "system" property from an array of items if it is the same for all
 * items and equal to the initial value if the initial value is defined.
 * @param {Object[]|undefined} arr - array of items
 * @param {string|undefined} [system] - optional initial value
 * @return {string|undefined}
 */
function getSystemFromArrayItems(arr, system = undefined) {
  if (arr) {
    for (let i = 0; i < arr.length; ++i) {
      if (!system) {
        system = arr[i].system;
      } else if (system !== arr[i].system) {
        system = undefined;
        break;
      }
    }
  }

  return system;
}

module.exports = Terminologies;
