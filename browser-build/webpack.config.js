module.exports = {
  node: {
    fs: "empty"
  },
  entry: './app/scripts/fhirpath/fhirpathRequire.js',
  mode: 'production',
  output: {
    path: __dirname,
    filename: './app/scripts/fhirpath/fhirpath.min.js',
  }
};
