const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseConf = require("./webpack.config.base.js");

const conf = Object.assign({}, baseConf, {
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin("bundle.css"),
    new CopyWebpackPlugin([{
      from: "index.html",
      to: 'index.html'
    }, {
      from: "static",
      to: 'static'
    }])
  ]
});

conf.module.rules = [{
  test: /\.js$/,
  loader: "babel-loader",
  exclude: /node_modules/,
  include: __dirname
}].concat(conf.module.rules);
module.exports = conf;
