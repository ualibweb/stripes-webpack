module.exports = (opts = { contains: /variables/ }) => {
  return {
    postcssPlugin: 'postcss-omit-imports',
    AtRuleExit: {
      import: atRule => {
        if (opts.contains.test(atRule.params)) {
          atRule.remove();
        }
      }
    }
  }
};

module.exports.postcss = true;