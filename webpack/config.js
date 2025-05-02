const path = require('path');

module.exports = {
  entry: {
    'content-script': './src/js/content-script.js',
    background: './src/js/background.js',
    options: './src/js/options.js',
  },
  output: {
    filename: './js/[name].js',
  },
  resolve: {
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
};
