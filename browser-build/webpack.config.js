//const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
module.exports = {
  node: {
    fs: "empty"
  },
  entry: './fhirpathRequire.js',
  mode: 'production',
//  mode: 'development',
//devtool: 'source-map',
  plugins: [
//    new MomentLocalesPlugin()
  ],
  output: {
    path: __dirname,
    filename: './fhirpath.min.js',
  }
};
