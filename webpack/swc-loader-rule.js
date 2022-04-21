const utils = require('./utils');

module.exports = {
  test: utils.shouldFileBeTranspiled,
  use: {
    loader: 'swc-loader',
    options: {
      parseMap: true,
      jsc: {
        parser: {
          jsx: true,
          decorators: true,
          dynamicImport: true,
          privateMethod: true,
          functionBind: true,
          exportDefaultFrom: true,
          exportNamespaceFrom: true,
          decoratorsBeforeExport: true,
          importMeta: true
        },
        transform: {
          react: {
            runtime: 'automatic',
            development: utils.isDevelopment,
            refresh: utils.isDevelopment,
          },
        },
      }
    }
  }
};
