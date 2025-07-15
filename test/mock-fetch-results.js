let fetchSpy;


/**
 * Checks whether a string (in the first parameter) matches a regular expression,
 * contains the substring or satisfies the test function (in the second parameter).
 * If the second parameter is not passed (no condition), returns true.
 * @param {string} str - string to check
 * @param {RegExp|string|Function|undefined} condition - regular expression,
 *  substring, or test function.
 * @param {Object} [options] - apply condition options:
 * @param {Object} [options.fullStringMatch] - whether to perform a full string
 *  comparison on the strings in the "str" and "condition" parameters, defaults
 *  to false.
 * @returns {boolean}
 */
function checkString(str, condition, options= {}) {
  if (condition === undefined) {
    return true;
  } else if (condition instanceof RegExp) {
    return condition.test(str);
  } else if (typeof condition === 'string') {
    return options?.fullStringMatch ?
      str === condition
      : (str !== null && str !== undefined && str.indexOf(condition) !== -1);
  } else if (condition instanceof Function) {
    return condition(str);
  } else {
    reportError(
      `Condition must be a string, RegExp or function, but got ${typeof condition}`
    );
  }
}


/**
 * Mocks fetch requests.
 * @param {Array} results - an array of fetch response descriptions, each item
 * of which is an array with a RegExp for a URL, URL substring, or test function
 * as the first item and a JSON object of the successful response as the second
 * item or, if the second item is null, a JSON object of the unsuccessful
 * response as the third item.
 * For mocking POST requests the first item of a response description with a URL
 * condition could be replaced with an object:
 * {url: string|Regexp, body: string|RegExp, method: string},
 * where "url" is a RegExp for a URL or a URL substring,
 * "body" is a RegExp for the body content or a substring of the body content,
 * and "method" is a RegExp for the HTTP method (e.g. "POST") or a substring of
 * the HTTP method.
 *
 * @param {Object} options - options for the mock.
 * @param {number} [options.timeout=0] - timeout for the mock response.
 */
function mockFetchResults(results, {timeout = 0} = {}) {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(
    (url, options) => new Promise((resolve) => {
      const mockedItem = results?.find(
        (r) => {
          if (typeof r[0] === 'object' && r[0] !== null && (r[0].url ||
            r[0].body || r[0].method)) {
            return checkString(url, r[0]?.url) &&
              checkString(options.body, r[0]?.body) &&
              checkString(options.method ?? 'GET', r[0]?.method,
                {fullStringMatch: true});
          } else {
            return checkString(url, r[0]);
          }
        }
      );
      const optionHeaders = new Headers(options?.headers);
      if (
        optionHeaders.get('Accept') !== 'application/fhir+json; charset=utf-8' ||
        options?.method === 'POST' &&
        optionHeaders.get('Content-Type') !== 'application/fhir+json; charset=utf-8'
      ) {
        reportError('Unexpected request header.');
      }

      const okResult = mockedItem?.[1];
      const badResult = mockedItem?.[2];

      setTimeout(() => {
        if(okResult) {
          resolve({
            json: () => Promise.resolve(okResult),
            headers: {
              get: (name) => name === 'Content-Type' ? 'application/fhir+json' : undefined
            },
            ok: true
          });
        } else if(badResult) {
          resolve({
            json: () => Promise.resolve(badResult),
            headers: {
              get: (name) => name === 'Content-Type' ? 'application/json' : undefined
            },
            ok: false
          });
        } else {
          reportError(`"${url}" is not mocked.`);
        }
      }, timeout);
    })
  );
}

/**
 * Report an error message.
 * @param {string} msg - error message to report.
 */
function reportError(msg) {
  // Show error message in the console:
  console.error(msg);
  // Throw an error so that the test fails:
  throw new Error(msg);
}


/**
 * Restore the spy created with mockFetchResults.
 */
function mockRestore() {
  fetchSpy?.mockRestore();
}


module.exports = {
  mockRestore,
  mockFetchResults
};
