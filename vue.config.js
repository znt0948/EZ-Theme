const { defineConfig } = require("@vue/cli-service");

const path = require("path");

const fs = require("fs");

const webpack = require("webpack");

const getSiteName = () => {
  try {
    const baseConfigContent = fs.readFileSync(
      path.resolve(__dirname, "src/utils/baseConfig.js"),
      "utf-8"
    );

    const siteNameMatch = baseConfigContent.match(
      /siteName:\s*['"]([^'"]+)['"]/
    );

    return siteNameMatch ? siteNameMatch[1] : "EZ THEME USER";
  } catch (err) {
    return "EZ THEME USER";
  }
};

const siteName = getSiteName();

module.exports = defineConfig({
  publicPath: "./",

  outputDir: "dist",

  assetsDir: "static",

  lintOnSave: false,

  productionSourceMap: false,

  configureWebpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    config.resolve = {
      ...config.resolve,
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    };

    config.plugins.push(
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      })
    );

    config.ignoreWarnings = [
      {
        module: /sass-loader/,
        message: /The legacy JS API is deprecated/,
      },
    ];

    if (process.env.NODE_ENV === "production") {
      // ✅ 仅添加 splitChunks 分包优化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendors: {
              name: "chunk-vendors",
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              chunks: "initial",
            },
            common: {
              name: "chunk-common",
              minChunks: 2,
              priority: -20,
              chunks: "initial",
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
  },

  css: {
    loaderOptions: {
      sass: {
        implementation: require("sass"),

        sassOptions: {
          outputStyle: "expanded",

          fiber: false,

          indentedSyntax: false,

          includePaths: ["node_modules"],
        },

        additionalData: `

          @use "@/assets/styles/base/variables.scss" as *;

        `,
      },
    },
  },

  pages: {
    index: {
      entry: "src/main.js",

      template: "public/index.html",

      filename: "index.html",

      title: siteName,
    },
  },

  devServer: {
    client: {
      overlay: false,
    },
  },
});
