const path = require('path');
const logger = require('./logger')();
const StripesBuildError = require('./stripes-build-error');

function tryResolve(modulePath, options) {
  try {
    return require.resolve(modulePath, options);
  } catch (e) {
    return false;
  }
}

// Generates a resolvable alias for a module with preference given to the
// workspace's version followed by stripes-core's version followed by the platform's, if available
function generateStripesAlias(moduleName) {
  let alias;
  const workspaceModule = path.join(path.resolve(), '..', 'node_modules', moduleName);
  const platformModule = path.join(path.resolve(), 'node_modules', moduleName);
  const coreModule = path.join(__dirname, '..', 'node_modules', moduleName);

  if (tryResolve(workspaceModule)) {
    alias = workspaceModule;
  } else if (tryResolve(platformModule)) {
    alias = platformModule;
  } else if (tryResolve(coreModule)) {
    alias = coreModule;
  } else {
    throw new StripesBuildError(`generateStripesAlias: Unable to locate a resolvable alias for ${moduleName} module`);
  }
  return alias;
}

// Common logic to locate a stripes module (pass 'package.json') or file within
function locateStripesModule(context, moduleName, alias, ...segments) {
  logger.log(`locating stripes module ${moduleName}...`);
  let foundPath = false;

  const tryPaths = [
    {
      // The place we normally expect to find this module
      request: path.join(context, 'node_modules', moduleName, ...segments),
    }, {
      // The above resolution is overspecific and prevents some use cases eg. yarn workspaces
      request: path.join(moduleName, ...segments),
    }, {
      // This better incorporates the context path but requires nodejs 9+
      request: path.join(moduleName, ...segments),
      options: { paths: [context] },
    }, {
      // Yarn workspaces fallback: Try node_modules of the parent directory
      request: path.join(context, '..', 'node_modules', moduleName, ...segments),
    },
  ];

  // If we are looking for any stripes-* modules, we should also check within the framework's node_modules
  if (moduleName.startsWith('@folio/stripes')) {
    tryPaths.unshift({
      request: path.join(context, 'node_modules', '@folio', 'stripes', 'node_modules', moduleName, ...segments),
    }, {
      // Yarn workspace fallback
      request: path.join(context, '..', 'node_modules', '@folio', 'stripes', 'node_modules', moduleName, ...segments),
    });
  }

  // When available, try for the alias first
  if (alias[moduleName]) {
    tryPaths.unshift({
      request: path.join(alias[moduleName], ...segments),
    });
  }

  for (let i = 0; i < tryPaths.length; i += 1) {
    foundPath = tryResolve(tryPaths[i].request, tryPaths[i].options);
    if (foundPath) {
      break;
    }
  }
  if (foundPath) {
    logger.log('found', foundPath);
  }
  return foundPath;
}

/**
 * Convert dependencies defined in "stripes.stripesDeps" in package.json
 * into their full path representation.
 *
 * For example dependencies defined as:
 *
 * "stripesDeps": [
    "@reshare/stripes-reshare",
  ],
 *
 * will be converted into:
 *
 * [
 *  './node_modules/@reshare/stripes-reshare'
 * ]
 *
*/
function getStripesDepsPaths(stripesDeps) {
  if (!stripesDeps) return null;

  return stripesDeps.map(dep => {
    const path = locateStripesModule(process.cwd(), dep, {}, 'package.json');
    return path ? path.replace('/package.json', '') : null;
  });
}

/**
 * Convert modules defined in stripes config into their full path representation.
 * The conversion will happen for all modules found in a stripes config
 *
 * For example modules defined in stripes config:
 *
 * modules: { '@folio/users': {}, '@reshare/directory': {} }
 *
 * will be converted into:
 *
 * [
 *  './node_modules/@folio/users',
 *  './node_modules/@reshare/directory',
 * ]
 *
*/
function getModulesPaths(modules) {
  return Object
    .keys(modules)
    .flatMap(module => {
      const packageJsonPath = locateStripesModule(process.cwd(), module, {}, 'package.json');

      if (packageJsonPath) {
        const modulePaths = [packageJsonPath.replace('/package.json', '')];
        const packageJson = require(packageJsonPath);
        const stripesDeps = getStripesDepsPaths(packageJson?.stripes?.stripesDeps);

        if (stripesDeps) {
          modulePaths.push(...stripesDeps);
        }

        return modulePaths
      }

      return null;
    })
    .filter(module => !!module);
}

function getSharedStyles(filename) {
  return path.resolve(generateStripesAlias('@folio/stripes-components'), filename + ".css");
}

module.exports = {
  tryResolve,
  generateStripesAlias,
  getSharedStyles,
  locateStripesModule,
  getModulesPaths,
};
