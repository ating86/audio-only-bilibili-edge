const path = require('path');

module.exports = {
  entry: {
    background: './src/js/src/background.js',
    'content-script': './src/js/src/content-script.js',
    options: './src/js/src/options.js'
  },
  output: {
    path: path.resolve(__dirname, 'src/js'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
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