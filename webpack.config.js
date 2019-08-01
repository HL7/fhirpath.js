var path = require('path');
module.exports = {
  node: {
    fs: "empty"
  },
  entry: {
    main: [
      '@babel/polyfill',
      './src/fhirpath.js'
    ]
  },
  mode: 'production',
  output: {
    path: __dirname,
    filename: 'build/fhirpath.js',
    libraryTarget: "umd",
    library: "LaunchableApp"
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
