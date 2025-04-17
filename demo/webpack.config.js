module.exports = {
  entry: './public/app.js',
  output: {
    path: __dirname + '/build',
    filename: 'app.js',
    chunkFormat: 'commonjs'
  },
  devServer: {
    static: './build',
    allowedHosts: 'all'
  },
  target: "es2020",
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|browser-build|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env',
              {
                targets: {
                  browsers: '> 0.5%, last 2 versions, Firefox ESR, not dead'
                }
              }
            ]]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.yaml$/,
        use: ['yaml-loader']
      }

    ]
  }
}
