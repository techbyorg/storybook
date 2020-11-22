require('../babel.register.config')
const _ = require('lodash')

const ourWebpackConfig = require('../webpack.config.js')

module.exports = {
  "stories": [
    "../src/**/stories.@(js|jsx|ts|tsx)"
    // "../src/stories/*.story.js"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  // https://github.com/storybookjs/storybook/issues/11255
  webpackFinal: async config => {
    const ourWebpackBabelRuleIndex = _.findIndex(ourWebpackConfig.default.module.rules, ({ loader }) =>
      loader.indexOf('babel-loader') !== -1
    )
    const ourWebpackBabelRule = ourWebpackConfig.default.module.rules[ourWebpackBabelRuleIndex]
    // ourWebpackConfig.default.module.rules.splice(ourWebpackBabelRuleIndex, 1)
    // const storybookWebpackBabelRules = _.filter(config.module.rules, ({ use }) =>
    //   use && use[0].loader && use[0].loader.indexOf('babel-loader') !== -1
    // )
    // _.forEach(storybookWebpackBabelRules, (storybookWebpackBabelRule) => {
    //   if (storybookWebpackBabelRule.include && !storybookWebpackBabelRule.include.concat) {
    //     storybookWebpackBabelRule.include = [storybookWebpackBabelRule.include]
    //   }
    //   storybookWebpackBabelRule.include = (storybookWebpackBabelRule.include || []).concat(babelIgnore)
    //   console.log('go', storybookWebpackBabelRule)
    //   storybookWebpackBabelRule.use[0].options.plugins = ourWebpackBabelRule.options.plugins
    //   if (storybookWebpackBabelRule.use[0].options.plugins.indexOf('@babel/plugin-proposal-optional-chaining') === -1) {
    //     console.log('add')
    //     storybookWebpackBabelRule.use[0].options.plugins.push('@babel/plugin-proposal-optional-chaining')
    //   }
    //   storybookWebpackBabelRule.use[0].options.presets = ourWebpackBabelRule.options.presets
    // })
    config.resolve.alias = _.defaults(ourWebpackConfig.default.resolve.alias, config.resolve.alias)
    console.log(config)
    config.module.rules = config.module.rules.concat(ourWebpackConfig.default.module.rules)
    config.plugins = (config.plugins || []).concat(_.filter(ourWebpackConfig.default.plugins, (plugin) => {
      return [
        'MiniCssExtractPlugin'
      ].indexOf(plugin.constructor.name) !== -1
    }))
    return {
        ...config,
        resolve: {
            alias: {
                'core-js/modules': '@storybook/core/node_modules/core-js/modules',
                'core-js/features': '@storybook/core/node_modules/core-js/features',
            },
        },
    };
  }
}
