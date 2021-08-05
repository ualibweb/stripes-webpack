# Change history for stripes-webpack

## 1.3.1 IN PROGRESS

* Add `loose` to `plugin-proposal-private-property-in-object`. Fixes STRWEB-21.

## [1.3.0](https://github.com/folio-org/stripes-webpack/tree/v1.3.0) (2021-06-08)
[Full Changelog](https://github.com/folio-org/stripes-webpack/compare/v1.2.0...v1.3.0)

* Correctly specify peer-dependencies. Refs STRWEB-11.
* Replace unmaintained `awesome-typescript-loader` with `ts-loader`. Refs STRWEB-10.
* Some babel plugins must be configured consistently. Refs STRWEB-12.
* Introduce the STRIPES_TRANSPILE_TOKENS environment variable which includes a space delimited list of strings (typically namespaces) to use in addition to "@folio" to determine if something needs Stripes-flavoured transpilation. Fixes STRWEB-13.
* Depend on `optimize-css-assets-webpack-plugin` `^5.0.6` to avoid (reverted) breaking changes in `5.0.5`. Refs STRWEB-15.

## [1.2.0](https://github.com/folio-org/stripes-webpack/tree/v1.2.0) (2021-04-12)
[Full Changelog](https://github.com/folio-org/stripes-webpack/compare/v1.1.0...v1.2.0)

* Add support for new jsx transform. Refs STRWEB-5.
* If translations exist in a `/compiled` subdirectory, then they will be preferred as the translations to use in the final bundle. Refs STCLI-158.
* Ignore non-file entries when reading the `translations/...` directory. Refs STRWEB-7.
* Add support for loading CSV files. Fixes STRWEB-8.

## [1.1.0](https://github.com/folio-org/stripes-webpack/tree/v1.1.0) (2021-02-03)

* Remove support for `hardsource-webpack-plugin`. Refs STCOR-421, STCOR-510.
* Add `locateCssVariables` to `postcss-loader` loader. Refs STCOR-511.
