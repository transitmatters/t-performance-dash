module.exports = {
  "stories": [
    "../@(common|modules|pages|src)/**/*.stories.mdx",
    "../@(common|modules|pages|src)/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  }
}