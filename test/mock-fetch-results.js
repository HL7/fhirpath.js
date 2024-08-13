let fetchSpy;

/**
 * Mocks fetch requests.
 * @param {Array} results - an array of fetch response descriptions, each item
 *  of which is an array with the RegExp URL as the first item and the response
 *  JSON object as the second.
 */
function mockFetchResults(results) {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(
    (url) => new Promise((resolve, _) => {
      const mockedResult = results?.find(
        r => r[0] instanceof RegExp ? r[0].test(url) : url.indexOf(r[0]) !== -1
      )?.[1];

      if(mockedResult) {
        resolve({ json: () => mockedResult });
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
