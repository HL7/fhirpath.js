module.exports = {
  entry: './public/app.js',
  output: {
    path: __dirname + '/build',
    filename: 'app.js'
  },
  devServer: {
    contentBase: './build'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.yaml$/,
        loaders: [ 'yaml-loader']
      }

    ]
  }
}
