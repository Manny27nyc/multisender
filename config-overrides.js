// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
// https://github.com/timarney/react-app-rewired/issues/348#issuecomment-452199363
const {
  override,
  fixBabelImports,
  addLessLoader,
  addDecoratorsLegacy,
  disableEsLint,
} = require("customize-cra");

const webpack = require("webpack");

module.exports = override(
  addDecoratorsLegacy(),
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true, // change importing css to less
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { "@primary-color": "#1DA57A" },
  }),
  function override(config) {
    if (process.env.DEV_MODE) {
      config.mode = "development";
      config.optimization.minimize = false;
    }
    config.ignoreWarnings = [/Failed to parse source map/];
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
      zlib: require.resolve("browserify-zlib"),
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ]);
    return config;
  },
  // disable eslint in webpack
  disableEsLint()
);
