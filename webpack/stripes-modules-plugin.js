// This webpack plugin generates a virtual module containing a list of modules
// Each module object contains 'getModule' function which is an entry point into each app
// To access this configuration simply import 'stripes-modules' within your JavaScript:
//  import modules from 'stripes-modules';

const _ = require('lodash');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const serialize = require('serialize-javascript');
const StripesBuildError = require('./stripes-build-error');
const stripesSerialize = require('./stripes-serialize');
const logger = require('./logger')('stripesConfigPlugin');
const StripesConfigPlugin = require('./stripes-config-plugin');

module.exports = class StripesModulesPlugin {
  apply(compiler) {
    this.virtualModule = new VirtualModulesPlugin();
    this.virtualModule.apply(compiler);

    // Hook into stripesConfigPlugin to create a stripes-modules config
    StripesConfigPlugin.getPluginHooks(compiler).afterWrite.tap({ name: 'StripesTranslationsPlugin' }, (config) => {
      const { modules } = config;
      const stripesModules = {};

      // One critical aspect of this operation is value of getModule, which is the entry point into each app
      // This will be modified to a webpack-compatible dynamic import when we implement code-splitting.
      for (const type in modules) {
        stripesModules[type] = modules[type].map(module => ({
          ...module,
          getModule: new Function([], `return require('${module.module}').default;`), // eslint-disable-line no-new-func
        }));
      }

      const stripesVirtualModule = `
        const modules = ${serialize(stripesModules, { space: 2 })};
        export default modules;
      `;

      this.virtualModule.writeModule('node_modules/stripes-modules.js', stripesVirtualModule);
    });
  }
};
