const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './source/javascripts/script.js',
  devServer: {
    contentBase: path.join(__dirname, 'public'),
  },
  devtool: 'source-map',
  plugins: [
    new CopyPlugin([
      { from: 'public' },
      { from: 'source/images', to: 'images' },
    ]),
  ],
}
