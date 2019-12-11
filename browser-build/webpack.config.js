const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  node: {
    fs: "empty"
  },
  entry: '../src/fhirpath',
  mode: 'production',
  // mode: 'development',
  devtool: 'source-map',
  output: {
    path: __dirname,
    filename: './fhirpath.min.js',
    library: 'fhirpath' // global variable for the library
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
  },
  plugins: [
    new CopyPlugin([
      { from: '../LICENSE.md', to: '.' }
    ]),
  ],
};
