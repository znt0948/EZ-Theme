const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

const getBaseConfig = () => {
  try {
    const content = fs.readFileSync(
      path.resolve(__dirname, "src/utils/baseConfig.js"),
      "utf-8"
    );
    
    // 获取 siteName
    const siteNameMatch = content.match(/siteName:\s*['"]([^'"]+)['"]/);
    const siteName = siteNameMatch ? siteNameMatch[1] : "EZ THEME USER";
    
    // 获取 enableAntiDebugging
    const antiDebugMatch = content.match(/enableAntiDebugging\s*:\s*(true|false)/);
    const enableAntiDebugging = antiDebugMatch ? antiDebugMatch[1] === "true" : false;
    
    // 获取 enableConfigJS
    const enableConfigJSMatch = content.match(/enableConfigJS\s*:\s*(true|false)/);
    const enableConfigJS = enableConfigJSMatch ? enableConfigJSMatch[1] === "true" : false;
    
    return { siteName, enableAntiDebugging, enableConfigJS };
  } catch (err) {
    console.warn("读取 baseConfig 失败:", err);
    return { siteName: "EZ THEME USER", enableAntiDebugging: false, enableConfigJS: false };
  }
};

const { siteName, enableAntiDebugging, enableConfigJS } = getBaseConfig();

let extraScriptFileName = '';
const generateRandomFileName = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let name = "";
  for (let i = 0; i < length; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const randowNumber = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `${randowNumber}.${name}.js`;
};

if (isProd && enableConfigJS) {
  extraScriptFileName = generateRandomFileName();
}

module.exports = defineConfig({
  publicPath: "./",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false,
  productionSourceMap: false,
  
  configureWebpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, syncWebAssembly: true };
    config.resolve = { ...config.resolve, alias: { "@": path.resolve(__dirname, "src") } };
    
    config.plugins.push(
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      })
    );
    
    if (isProd && enableConfigJS) {
      // 生产环境生成随机 JS 文件到 dist/
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap("GenerateExtraConfigPlugin", () => {
            const configPath = path.resolve(__dirname, "src/config/index.js");
            const distPath = path.resolve(compiler.options.output.path, extraScriptFileName);
            try {
              const content = fs.readFileSync(configPath, "utf-8");
              fs.writeFileSync(distPath, content, "utf-8");
            } catch (err) {
              console.warn("生成独立 JS 文件失败:", err);
            }
          });
        },
      });
    }
    
    if (isProd) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendors: { name: "chunk-vendors", test: /[\\/]node_modules[\\/]/, priority: -10, chunks: "initial" },
            common: { name: "chunk-common", minChunks: 2, priority: -20, chunks: "initial", reuseExistingChunk: true },
          },
        },
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: { compress: { drop_console: true, drop_debugger: true }, mangle: true, format: { comments: false, ascii_only: true } },
            extractComments: false,
          }),
        ],
      };
    }
  },
  
  chainWebpack: (config) => {
    if (isProd) {
      const pluginName = "html-index";
      config.plugin(pluginName).tap((args) => {
        args[0].templateParameters = {
          ...args[0].templateParameters,
          injectCustomScript: `
            ${enableAntiDebugging ? `<script disable-devtool-auto src="https://cdn.jsdelivr.net/npm/disable-devtool"></script>` : ""}
            ${enableConfigJS ? `<script src="./${extraScriptFileName}"></script>` : ""}
          `,
        };
        return args;
      });
    }
  },
  
  css: {
    loaderOptions: {
      sass: {
        implementation: require("sass"),
        sassOptions: { outputStyle: "expanded", fiber: false, indentedSyntax: false, includePaths: ["node_modules"] },
        additionalData: `@use "@/assets/styles/base/variables.scss" as *;`,
      },
    },
  },
  
  pages: {
    index: { entry: "src/main.js", template: "public/index.html", filename: "index.html", title: siteName },
  },
  
  devServer: { client: { overlay: false } },
});
