// Common Webpack configuration for building Stripes
const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const { generateStripesAlias } = require('./webpack/module-paths');
const babelLoaderRule = require('./webpack/babel-loader-rule');
const { isProduction } = require('./webpack/utils');
const { getTranspiledCssPaths } = require('./webpack/module-paths');
const { dirname } = require('path');

// React doesn't like being included multiple times as can happen when using
// yarn link. Here we find a more specific path to it by first looking in
// stripes-core (__dirname) before falling back to the platform or simply react
const specificReact = generateStripesAlias('react');

// A few details about stripes-config and entry
//
// Stripes config in Folio is currently assembled via webpack virtual module (https://github.com/sysgears/webpack-virtual-modules).
// This plugin is a clever way to generate virtual (in memory) files dynamically.
// What it means in practice is that it fools webpack to think that it deals with a real module/file
// (like any other real module under node_modules) but in reality that file doesn't really exist.
// Stripes config is "saved" under node_modules/stripes-config.js and it happens here:

// https://github.com/folio-org/stripes-webpack/blob/730ef33ee5a7799521408453b6e75653a21c3bfd/webpack/stripes-config-plugin.js#L87

// Since webpack treats it as a real module we can use it as an entry path and extract it into a separate
// chunk with (when we bundle for production env):

// entry: {
//   stripesConfig: {
//     import: 'stripes-config.js'
//   },
// }

// The important part here is that the name used by the virtual module in https://github.com/folio-org/stripes-webpack/blob/master/webpack/stripes-config-plugin.js#L87
// has to match with the name under import (in our case stripes-config.js).
// Since we are now on the webpack 5 we can make use of dependOn (https://webpack.js.org/configuration/entry-context/#dependencies)
// in order to create a dependency between stripes config and other chunks:

const baseConfig = {
  entry: {
    css: ['@folio/stripes-components/lib/global.css'],
    stripesConfig: {
      import: 'stripes-config.js'
    },
    index: {
      dependOn: 'stripesConfig',
      import: '@folio/stripes-ui'
    },
  },
  resolve: {
    alias: {
      'react': specificReact,
      // TODO: remove this after all UI modules remove reference to react-hot-loader
      'react-hot-loader': path.resolve(__dirname, 'reactHotLoader.js'),
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: fs.existsSync('index.html') ? 'index.html' : `${__dirname}/index.html`,
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new RemoveEmptyScriptsPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'readonly',
        configFile: path.resolve(__dirname, 'webpack', 'tsconfig.json')
      },
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'readonly',
        configFile: path.resolve(__dirname, 'webpack', 'tsconfig.checkJs.json')
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(jpg|jpeg|gif|png|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: './img/[name].[contenthash].[ext]',
        },
      },
      {
        test: /\.(mp3|m4a)$/,
        type: 'asset/resource',
        generator: {
          filename: './sound/[name].[contenthash].[ext]',
        },
      },
      {
        test: /\.(woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: './fonts/[name].[contenthash].[ext]',
        },
      },
      {
        test: /\.handlebars$/,
        use: [{
          loader: 'handlebars-loader',
        }],
      },
      {
        test: /\.csv$/,
        use: [{
          loader: 'csv-loader',
        }],
      },
      {
        test: /\.js.map$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.svg$/,
        use: [{
          loader: 'url-loader',
          options: {
            esModule: false,
          },
        }]
      },
    ],
  },
};


const buildConfig = (modulePaths) => {
  const transpiledCssPaths = getTranspiledCssPaths(modulePaths);
  const cssDistPathRegex = /dist[\/\\]style\.css/;

  baseConfig.module.rules.push(babelLoaderRule(modulePaths));

  // already transpiled css files
  if (transpiledCssPaths.length) {
    transpiledCssPaths.forEach(cssPath => {
      baseConfig.entry.css.push(cssPath);
    });

    baseConfig.module.rules.push({
      test: /\.css$/,
      include: [cssDistPathRegex],
      use: [
        { loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader' },
        {
          loader: 'css-loader',
          options: {
            modules: false
          },
        },
      ],
    });
  }

  // css files not transpiled yet
  baseConfig.module.rules.push({
    test: /\.css$/,
    exclude: [cssDistPathRegex],
    use: [
      { loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader'  },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[local]---[hash:base64:5]',
          },
          importLoaders: 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            config: path.resolve(__dirname, 'postcss.config.js'),
          },
          sourceMap: true,
        },
      },
    ]
  });

  return baseConfig;
}

module.exports = buildConfig;
