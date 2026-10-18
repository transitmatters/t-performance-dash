module.exports = {
  stories: [
    '../@(common|modules|pages|src)/**/*.stories.mdx',
    '../@(common|modules|pages|src)/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  addons: ['@storybook/addon-links', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  }
};
