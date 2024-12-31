let fetchSpy;


/**
 * Checks whether a string (in the first parameter) matches a regular expression
 * or substring (in the second parameter).
 * If the second parameter is not passed (no condition), returns true.
 * @param {string} str - string to check
 * @param {RegExp|string|undefined} condition - regular expression or substring.
 * @returns {boolean}
 */
function checkString(str, condition) {
  if (condition === undefined) {
    return true;
  } else if (condition instanceof RegExp) {
    return condition.test(str);
  } else {
    return str && (str.indexOf(condition) !== -1)
  }
}


/**
 * Mocks fetch requests.
 * @param {Array} results - an array of fetch response descriptions, each item
 * of which is an array with a RegExp for a URL or a URL substring as the first
 * item and a JSON object of the successful response as the second item or, if the second
 * item is null, a JSON object of the unsuccessful response as the third item.
 * For mocking POST requests the first item of a response description with a URL
 * condition could be replaced with an object:
 * {url: string|Regexp, body: string|RegExp},
 * where "url" is a RegExp for a URL or a URL substring,
 * "body" is a RegExp for the body content or a substring of the body content.
 */
function mockFetchResults(results) {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(
    (url, options) => new Promise((resolve) => {
      const mockedItem = results?.find(
        (r) => {
          if (typeof r[0] === 'string' || r[0] instanceof RegExp) {
            return checkString(url, r[0])
          } else {
            return checkString(url, r[0]?.url) && checkString(options.body, r[0]?.body);
          }
        }
      );
      const okResult = mockedItem?.[1];
      const badResult = mockedItem?.[2];

      if(okResult) {
        resolve({ json: () => okResult, ok: true });
      } else if(badResult) {
        resolve({ json: () => badResult, ok: false });
      } else {
        console.error(`"${url}" is not mocked.`)
      }
    })
  );
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
