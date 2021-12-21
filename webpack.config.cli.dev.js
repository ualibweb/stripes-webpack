// Top level Webpack configuration for running a development environment
// from the command line via devServer.js

const path = require('path');
const webpack = require('webpack');
const postCssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const postCssCustomProperties = require('postcss-custom-properties');
const postCssCalc = require('postcss-calc');
const postCssNesting = require('postcss-nesting');
const postCssCustomMedia = require('postcss-custom-media');
const postCssMediaMinMax = require('postcss-media-minmax');
const postCssColorFunction = require('postcss-color-function');
const { generateStripesAlias, tryResolve, getSharedStyles } = require('./webpack/module-paths');

const base = require('./webpack.config.base');
const cli = require('./webpack.config.cli');


const locateCssVariables = () => {
  const variables = 'lib/variables.css';
  const localPath = path.join(path.resolve(), variables);

  // check if variables are present locally (in cases when stripes-components is
  // being built directly) if not look for them via stripes aliases
  return tryResolve(localPath) ?
    localPath :
    path.join(generateStripesAlias('@folio/stripes-components'), variables);
};

const devConfig = Object.assign({}, base, cli, {
  devtool: 'eval-cheap-source-map',
  mode: 'development',
  cache: {
    type: 'filesystem',
  },
  mode: 'development',
  target: 'web',
  infrastructureLogging: {
    appendOnly: true,
    level: 'warn',
  },
});

// Override filename to remove the hash in development due to memory issues (STCOR-296)
devConfig.output.filename = 'bundle.js';

devConfig.entry.unshift('webpack-hot-middleware/client');

devConfig.plugins = devConfig.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
  new webpack.ProvidePlugin({
    process: 'process/browser.js',
  }),
]);

// This alias avoids a console warning for react-dom patch
devConfig.resolve.alias['react-dom'] = '@hot-loader/react-dom';
devConfig.resolve.alias.process = 'process/browser.js';
devConfig.resolve.alias['mocha'] = 'mocha/mocha-es2018.js';
devConfig.module.rules.push({
  test: /\.css$/,
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[local]---[hash:base64:5]',
        },
        sourceMap: true,
        importLoaders: 1,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            postCssImport(),
            autoprefixer(),
            postCssCustomProperties({
              preserve: false,
              importFrom: [locateCssVariables()]
            }),
            postCssCalc(),
            postCssNesting(),
            postCssCustomMedia(),
            postCssMediaMinMax(),
            postCssColorFunction(),
          ],
        },
        sourceMap: true,
      },
    },
  ],
});

// add 'Buffer' global required for tests/reporting tools.
devConfig.plugins.push(
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer']
  })
);

// add resolutions for node utilities required for test suites.
devConfig.resolve.fallback = {
  "crypto": require.resolve('crypto-browserify'),
  "stream": require.resolve('stream-browserify'),
  "util": require.resolve('util-ex'),
};

devConfig.module.rules.push(
  {
    test: /\.svg$/,
    use: [{
      loader: 'file-loader?name=img/[path][name].[contenthash].[ext]',
      options: {
        esModule: false,
      },
    }]
  },
);

module.exports = devConfig;
