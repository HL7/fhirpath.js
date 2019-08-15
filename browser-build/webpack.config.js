//const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
module.exports = {
  node: {
    fs: "empty"
  },
  entry: './fhirpathRequire.js',
  mode: 'production',
  // mode: 'development',
  // devtool: 'source-map',
  output: {
    path: __dirname,
    filename: './fhirpath.min.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
