// Modules
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
const isTest = ENV === 'test' || ENV === 'test-watch';
const isProd = ENV === 'build' || ENV === 'webpack';

module.exports = (function makeWebpackConfig() {
  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  const config = {};

  /**
   * Context
   * Reference: https://webpack.github.io/docs/context.html
   * Defines the parent directory of all other filepaths
   */
  config.context = path.resolve(__dirname, './src');

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   * Should be an empty object if it's generating a test build
   * Karma will set this when it's a test build
   */
  config.entry = isTest ? {} : {
    app: './app/app.js',
    babel_polyfill: 'babel-polyfill',
  };

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   * Should be an empty object if it's generating a test build
   * Karma will handle setting it up for you when it's a test build
   */
  config.output = isTest ? {} : {
    // Absolute output directory
    path: 'dist',

    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: isProd ? '/' : 'http://localhost:8080/',

    // Filename for entry points
    // Only adds hash in build mode
    filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js',
  };

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  if (isTest) {
    config.devtool = 'inline-source-map';
  } else if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'cheap-module-source-map';
  }

  // loaders
  config.module = {
    preLoaders: [],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.css$/,
        loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css?sourceMap!postcss'),
      },
      {
        test: /\.scss$/,
        loaders: [
          'style',
          'css',
          'sass',
        ],
      },
      {
        test: /.(woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        loader: 'url-loader?limit=100000',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'file?name=[path][name].[ext]',
      },
      {
        test: /\.html$/,
        loader: 'raw',
      },
    ],
  };

  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version'],
    }),
  ];

  config.plugins = [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
  ];

  // Skip rendering index.html in test mode
  if (!isTest) {
    // Reference: https://github.com/ampedandwired/html-webpack-plugin
    // Render index.html
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './app/index.html',
        inject: 'body',
      }),

      // Reference: https://github.com/webpack/extract-text-webpack-plugin
      // Extract css files
      // Disabled when in test mode or not in build mode
      new ExtractTextPlugin('[name].[hash].css', { disable: !isProd })
    );
  }

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      // Reference: https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
      // Assigns more predictable module and chunk ids
      new webpack.optimize.OccurenceOrderPlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      // Only emit files when there are no errors
      new webpack.NoErrorsPlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      // Dedupe modules in the output
      new webpack.optimize.DedupePlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
      // Minify all javascript, switch loaders to minimizing mode
      new webpack.optimize.UglifyJsPlugin(),

      // Copy assets from the public folder
      // Reference: https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([{
        from: './assets',
      }])
    );
  }

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {
    contentBase: './',
    stats: 'minimal',
    proxy: {
      '/api/*': {
        target: 'http://localhost:5000',
        rewrite: req => {
          req.url = req.url.replace(/^\/api/, '');
        },
      },
    },
  };

  return config;
})();
