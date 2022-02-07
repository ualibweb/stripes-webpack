/* omit-imports will remove imports that match the supplied 'contains' regex */

module.exports = (opts = { contains: /variables/ }) => {
  return {
    postcssPlugin: 'postcss-omit-imports',
    prepare (result) {
      const removals = {}
      return {
        AtRuleExit: {
          import: atRule => {
            if (opts.contains.test(atRule.params)) {
              atRule.remove();
            }
          }
        },
      }
    }
  }
};

module.exports.postcss = true;