// Top level default Webpack configuration used for transpiling individual modules
// before publishing
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { EsbuildPlugin } = require('esbuild-loader');

const { processExternals } = require('./webpack/utils');
const { defaultExternals } = require('./consts');

const config = {
  mode: 'production',
  devtool: 'source-map',
  entry: path.resolve('./index.js'),
  output: {
    library: {
      type: 'umd',
    },
    path: path.resolve('./dist'),
    filename: 'index.js',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          jsx: 'automatic',
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
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
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
                config: path.resolve(__dirname, 'postcss.config.js'),
              },
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|gif|png|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: './img/[name].[contenthash].[ext]',
        },
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
      {
        test: /\.js.map$/,
        enforce: "pre",
        use: ['source-map-loader'],
      }
    ]
  },
  // Set default externals. These can be extended by individual modules.
  externals: processExternals(defaultExternals),
};

config.optimization = {
  mangleWasmImports: true,
  minimizer: [
    new EsbuildPlugin({
      css: true,
    }),
  ],
};

config.plugins = [
  new MiniCssExtractPlugin({ filename: 'style.css', ignoreOrder: false }),
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1,
  }),
  new webpack.EnvironmentPlugin(['NODE_ENV']),
];

module.exports = config;
