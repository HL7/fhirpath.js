var path = require('path');
module.exports = {
  node: {
    fs: "empty"
  },
  entry: './src/fhirpath.js',
  mode: 'production',
  output: {
    path: __dirname,
    filename: 'build/fhirpath.js',
    libraryTarget: "umd",
    library: "LaunchableApp"
  }
};
