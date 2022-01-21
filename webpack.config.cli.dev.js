// Top level Webpack configuration for running a development environment
// from the command line via devServer.js

const path = require('path');
const webpack = require('webpack');

const { tryResolve } = require('./webpack/module-paths');

const base = require('./webpack.config.base');
const cli = require('./webpack.config.cli');

const useBrowserMocha = () => {
  return tryResolve('mocha/mocha-es2018.js') ? 'mocha/mocha-es2018.js' : 'mocha';
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
devConfig.resolve.alias['mocha'] = useBrowserMocha();

// add the css workflow, handling themes...



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
