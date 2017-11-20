const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const conf = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: './src/index'
  },
  output: {
    path: path.join(__dirname, 'build'),
    libraryTarget: "umd",
    library: "gantt",
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.css$/,
      loader: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: "css-loader"
      })
    }, {
      test: /\.(png|jpg|svg)$/,
      loader: 'url-loader?limit=8192'
    }, {
      test: /\.html$/,
      loader: 'html-loader?-attrs'
    }, {
      test: /\.(otf|ttf|eot|woff|woff2)$/i,
      loader: 'url?name=[path][name].[ext]'
    }]
  },
  resolve: {
    modules: [path.join(__dirname, "src"), "node_modules"]
  }
}

module.exports = conf
