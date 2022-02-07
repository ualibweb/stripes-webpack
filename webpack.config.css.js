const path = require('path');
const postCssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const postCssCustomProperties = require('postcss-custom-properties');
const postCssCalc = require('postcss-calc');
const postCssNesting = require('postcss-nesting');
const postCssCustomMedia = require('postcss-custom-media');
const postCssMediaMinMax = require('postcss-media-minmax');
const postCssColorFunction = require('postcss-color-function');
const postCssOmitImports = require('./webpack/postcss/postcss-omit-imports');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { generateStripesAlias, tryResolve } = require('./webpack/module-paths');

const locateCssVariables = () => {
  const variables = 'lib/variables.css';
  const localPath = path.join(path.resolve(), variables);

  // check if variables are present locally (in cases when stripes-components is
  // being built directly) if not look for them via stripes aliases
  return tryResolve(localPath) ?
    localPath :
    path.join(generateStripesAlias('@folio/stripes-components'), variables);
};

const locateTheme = (themePath) => {
  return tryResolve(themePath) ?
    themePath : path.join('..', themePath);
}

const getCSSVariableSettings = (stripesConfig) => {
  const settings = {};
  // preserve: false removes css variable entries, leaving only the baked CSS variables.
  if (stripesConfig.legacyCSS) {
    settings.preserve = false;
  }

  settings.importFrom = [];

  // imports a theme from stripes-config.
  if (stripesConfig.theme) {
    settings.importFrom.push(locateTheme(stripesConfig.theme))
  }

  return settings;
}

module.exports = (wpconfig, stripesConfig, context) => {
  let production = false;

  let cssEntries = [
    locateCssVariables(),
    '@folio/stripes-components/lib/global.css',
  ];
  let themeEntry = [];
  if (stripesConfig.theme) {
    themeEntry = [locateTheme(stripesConfig.theme)];
  }

  wpconfig.entry = [
    ...cssEntries,
    ...wpconfig.entry,
    ...themeEntry
  ];

  let postCSSEntries = [postCssOmitImports({ contains: /variables/ })];

// since entries will be stripped out by karma-webpack, we have to import CSS via postcss-import (inline them);
  if (context._.includes('karma')) {
    postCSSEntries = [postCssImport()];
  }

  // default for development... style-loader.
  let loaderEntries = [
    {
      loader: 'style-loader'
    },
  ];

  // use CSS extraction for production instead of style-tag injection.
  if (context._.includes('build')) {
    production = true;
    loaderEntries = [{
      loader: MiniCssExtractPlugin.loader,
    }];

    wpconfig.plugins.push(new MiniCssExtractPlugin({ filename: 'style.[contenthash].css' }));
  }

  wpconfig.module.rules.push({
    test: /\.css$/,
    use: [
      ...loaderEntries,
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[local]---[hash:base64:5]',
          },
          sourceMap: !production,
          importLoaders: 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              ...postCSSEntries,
              autoprefixer(),
              postCssCustomProperties(
                getCSSVariableSettings(stripesConfig)
              ),
              postCssCalc(),
              postCssNesting(),
              postCssCustomMedia(),
              postCssMediaMinMax(),
              postCssColorFunction(),
            ],
          },
          sourceMap: !production,
        },
      },
    ],
  });

  // console.log(JSON.stringify(wpconfig, null, 2));
  return wpconfig;
}
