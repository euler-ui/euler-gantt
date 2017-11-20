const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseConf = require("./webpack.config.base.js");

const conf = Object.assign({}, baseConf, {
  devtool: "source-map",
  plugins: [
    new ExtractTextPlugin("bundle.css"),
    new CopyWebpackPlugin([{
      from: "index_prod.html",
      to: 'index.html'
    }, {
      from: "static",
      to: 'static'
    }])
  ]
});

conf.module.rules = [{
  test: /\.js$/,
  use: [
    "babel-loader",
    {
      loader: 'eslint-loader',
      options: {
        formatter: require("eslint/lib/formatters/table"),
      // fix: true
      }
    }
  ],
  exclude: /node_modules/,
  include: __dirname
}].concat(conf.module.rules);

module.exports = conf;
