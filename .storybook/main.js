module.exports = {
  stories: [
    '../@(common|modules|pages|src)/**/*.stories.mdx',
    '../@(common|modules|pages|src)/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  // features: {
  //   babelModeV7: true,
  // },
  // core: {
  //   builder: '@storybook/builder-webpack5',
  // },
  docs: {
    autodocs: true,
  },
};
