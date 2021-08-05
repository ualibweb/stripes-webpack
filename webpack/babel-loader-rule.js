const path = require('path');

// a space delimited list of strings (typically namespaces) to use in addition
// to "@folio" to determine if something needs Stripes-flavoured transpilation
const extraTranspile = process.env.STRIPES_TRANSPILE_TOKENS ? process.env.STRIPES_TRANSPILE_TOKENS.split(' ') : [];

// These modules are already transpiled and should be excluded
const folioScopeBlacklist = [
  'react-githubish-mentions',
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
function babelLoaderTest(fileName) {
  const nodeModIdx = fileName.lastIndexOf('node_modules');
  if (fileName.endsWith('.js')
    && (nodeModIdx === -1 || ['@folio', ...extraTranspile].reduce((acc, cur) => (fileName.lastIndexOf(cur) > nodeModIdx) || acc, false))
    && (folioScopeBlacklist.findIndex(ignore => fileName.includes(ignore)) === -1)) {
    return true;
  }
  return false;
}

module.exports = {
  test: babelLoaderTest,
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: [
      ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
      ['@babel/preset-flow', { all: true }],
      ['@babel/preset-react', {
        "runtime": "automatic"
      }],
      ['@babel/preset-typescript'],
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
      // when building a platform directly, i.e. outside a workspace,
      // babel complains loudly and repeatedly that when these modules are enabled:
      // * @babel/plugin-proposal-class-properties,
      // * @babel/plugin-proposal-private-methods and
      // * @babel/plugin-proposal-private-property-in-object
      // the "loose" option must be the same for all three.
      // but @babel/preset-env sets it to false for ...private-methods.
      // overriding it here silences the complaint. STRWEB-12
      ['@babel/plugin-proposal-class-properties', { 'loose': true }],
      ['@babel/plugin-proposal-private-methods', { 'loose': true }],
      ['@babel/plugin-proposal-private-property-in-object', { 'loose': true }],
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-function-sent',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-throw-expressions',
      '@babel/plugin-syntax-import-meta',
      [require.resolve('react-hot-loader/babel')],
    ]
  },
};
