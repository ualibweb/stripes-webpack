// Base Webpack configuration for building Stripes at the command line,
// including Stripes configuration.

const path = require('path');

module.exports = {
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[name].[contenthash].js',
    chunkFilename: 'chunk[name].[chunkhash].js',
    publicPath: '/',
  },
};
