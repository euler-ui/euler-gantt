var path = require("path");
module.exports = function(config) {
  config.set({
    browsers: ["PhantomJS"],
    browserNoActivityTimeout: 30000,
    singleRun: false,
    frameworks: ["mocha", "sinon", "chai-as-promised", "chai"],
    files: [{
      pattern: "static/jquery-ui-1.11.4/external/jquery/jquery.js",
      watched: false
    }, {
      pattern: "static/jquery-ui-1.11.4/jquery-ui.js",
      watched: false
    },
      "tests/GlobalHooks.js",
      "tests/index.js"
    ],
    preprocessors: {
      "tests/index.js": ["webpack", "sourcemap"],
      "tests/GlobalHooks.js": ["webpack", "sourcemap"]
    },
    reporters: ["progress", "coverage-istanbul"],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
      fixWebpackSourcePaths: true
    },
    webpack: {
      devtool: "inline-source-map",
      module: {
        rules: [{
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules|static/,
          include: __dirname
        }, {
          test: /\.js$/,
          loader: "istanbul-instrumenter-loader",
          include: /src|tests\/utility/,
          exclude: /node_modules/,
          options: {
            esModules: true
          }
        }, {
          test: /\.css$/,
          loader: "style-loader!css-loader"
        }, {
          test: /\.(png|jpg|svg)$/,
          loader: "url-loader?limit=8192"
        }, {
          test: /\.json$/,
          loader: "json-loader"
        }]
      },
      watch: true,
      resolve: {
        modules: [path.join(__dirname, "src"), "node_modules"]
      }
    },
    client: {
      captureConsole: true
    },
    webpackMiddleware: {
      stats: {
        colors: true
      }
    }
  });
};
