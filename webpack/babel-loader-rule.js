const babelOptions = require('./babel-options');
const utils = require('./utils');

module.exports = {
  test: utils.shouldFileBeTranspiled,
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    ...babelOptions,
  },
};
