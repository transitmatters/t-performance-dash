export default {
  stories: [
    '../@(common|modules|routes)/**/*.stories.mdx',
    '../@(common|modules|routes)/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  addons: ['@storybook/addon-links', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  }
};
