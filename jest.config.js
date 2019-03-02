// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
//testRegex: './test/fhirpath.test.js',
  testEnvironment: "node",
  testPathIgnorePatterns: ["/protractor/", "/node_modules/"]
};
