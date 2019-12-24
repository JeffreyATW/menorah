const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './source/javascripts/script.js',
  devServer: {
    contentBase: path.join(__dirname, 'public'),
  },
  plugins: [
    new CopyPlugin([
      { from: 'public' },
    ]),
  ],
}
