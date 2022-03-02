# Change history for stripes-webpack

## 3.1.0 IN PROGRESS

* Update some old dependencies. Refs STRWEB-38.

## [3.0.3](https://github.com/folio-org/stripes-webpack/tree/v3.0.3) (2022-02-10)
[Full Changelog](https://github.com/folio-org/stripes-webpack/compare/v3.0.2...v3.0.3)

* Avoid broken `@cerner/duplicate-package-checker-webpack-plugin` `v2.2.0` which introduces new node version restrictions. Refs STRWEB-35.

## [3.0.2](https://github.com/folio-org/stripes-webpack/tree/v3.0.2) (2022-02-08)
[Full Changelog](https://github.com/folio-org/stripes-webpack/compare/v2.0.0...v3.0.2)

* Update webpack to v5. Refs STRWEB-4.
* Dependency cleanup. Refs STRWEB-31.
* Alias Mocha to reduce console noise. Refs STRWEB-32.
* Fix source maps. Fixes STRWEB-34.

## [2.0.0](https://github.com/folio-org/stripes-webpack/tree/v2.0.0) (2021-09-24)
[Full Changelog](https://github.com/folio-org/stripes-webpack/compare/v1.3.0...v2.0.0)

* Lock onto `optimize-css-assets-webpack-plugin` `5.0.6` to avoid `postcss` `v8`. Fixes STRWEB-19.
* Add `loose` to `plugin-proposal-private-property-in-object`. Fixes STRWEB-21.
* Export babel config options for consumption by other modules. Refs STRWEB-22, STRIPES-742, STRIPES-757.
* Setup babel-plugin-lodash correctly. Fixes STRWEB-20.
* Upgrade PostCSS dependency stack. Refs STRWEB-23.
* Conditionally inject shared style aliases based on development context. Refs STRWEB-23, STCLI-183.
* Include `react` `v17` in the peer-deps. Refs STRWEB-25.

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
