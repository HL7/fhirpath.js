module.exports = {
  node: {
    fs: "empty"
  },
  entry: './fhirpathRequire.js',
  mode: 'production',
//  mode: 'development',
//devtool: 'source-map',
  output: {
    path: __dirname,
    filename: './fhirpath.min.js',
  }
};
