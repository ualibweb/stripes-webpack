const path = require('path');
const babelOptions = require('./babel-options');
const { getModulesPath } = require('./module-paths');

// a space delimited list of strings (typically namespaces) to use in addition
// to "@folio" to determine if something needs Stripes-flavoured transpilation
const extraTranspile = process.env.STRIPES_TRANSPILE_TOKENS ? process.env.STRIPES_TRANSPILE_TOKENS.split(' ') : [];

// These modules are already transpiled and should be excluded
const folioScopeBlacklist = [
].map(segment => path.join('@folio', segment));

// Packages on NPM are typically distributed already transpiled. For historical
// reasons, Stripes modules are not and have their babel config centralised
// here. This ought to have changed by now, but for now the following logic is
// in effect and modules will be transpiled if:
//
// * they are in the @folio namespace
// * their name contains a string from STRIPES_TRANSPILE_TOKENS
//   (typically other namespaces)
// * they aren't in node_modules (typically in a workspace)
//
// You'll see some chicanery here: we are only interested in these strings if
// they occur after the last instance of "node_modules" since, in some
// situations, our dependencies will get their own node_modules directories and
// while we want to transpile "@folio/ui-users/somefile.js" we don't want to
// transpile "@folio/ui-users/node_modules/nightmare/somefile.js"
function babelLoaderTest(fileName, modules) {
  const nodeModIdx = fileName.lastIndexOf('node_modules');

  if (fileName.endsWith('.js')
    && (nodeModIdx === -1
      || ['@folio', ...extraTranspile].reduce((acc, cur) => (fileName.lastIndexOf(cur) > nodeModIdx) || acc, false) // is filename in folio namespace
      || modules.findIndex(moduleName => fileName.includes(moduleName)) !== -1) // if file in stripes config modules
    && (folioScopeBlacklist.findIndex(ignore => fileName.includes(ignore)) === -1)) {
      return true;
  }
  return false;
}

module.exports = (stripesConfig) => {
  const modules = getModulesPath(stripesConfig.modules);

  return {
    test: filename => babelLoaderTest(filename, modules),
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      ...babelOptions,
    },
  };
};
