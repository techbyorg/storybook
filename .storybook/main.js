// FIXME: no preact support for propTypes -> argTypes...
// hopefully can figure out way to use react version
// https://github.com/storybookjs/storybook/pull/12403?
require('../babel.register.config')
const _ = require('lodash')

const ourWebpackConfig = require('../webpack.config.js')

module.exports = {
  stories: [
    '../src/**/stories.@(js|jsx|ts|tsx)'
    // "../src/stories/*.story.js"
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links'

  ],
  // https://github.com/storybookjs/storybook/issues/11255
  webpackFinal: async config => {
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
