const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./source/javascripts/script.js",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    }
  },
  devtool: "source-map",
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "public" }, { from: "source/images", to: "images" }],
    }),
  ],
};
