let fetchSpy;

/**
 * Mocks fetch requests.
 * @param {Array} results - an array of fetch response descriptions, each item
 * of which is an array with a RegExp URL or URL substring as the first item and
 * a JSON object of the successful response as the second item or, if the second
 * item is null, a JSON object of the unsuccessful response as the third item.
 */
function mockFetchResults(results) {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(
    (url) => new Promise((resolve, _) => {
      const mockedItem = results?.find(
        r => r[0] instanceof RegExp ? r[0].test(url) : url.indexOf(r[0]) !== -1
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
