module.exports = {
  node: {
    fs: "empty"
  },
  entry: './fhirpathRequire.js',
  mode: 'production',
  output: {
    path: __dirname,
    filename: './fhirpath.min.js',
  }
};
