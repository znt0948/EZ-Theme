const {defineConfig} = require("@vue/cli-service");

const path = require("path");

const fs = require("fs");
const JavaScriptObfuscator = require('javascript-obfuscator');
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
    chainWebpack: (config) => {
        if (process.env.NODE_ENV === "production") {
            config.plugin("copy").tap((args) => {
                args[0].patterns.forEach((pattern) => {
                    if (pattern.from === path.resolve(__dirname, "public")) {
                        pattern.transform = function (content, absoluteFrom) {
                            if (absoluteFrom.endsWith("config.js")) {
                                const obfuscationResult = JavaScriptObfuscator.obfuscate(
                                    content.toString(),
                                    {
                                        // 在此自定义您的混淆强度
                                        // 压缩代码，移除所有不必要的空白、换行符等。
                                        compact: true,
                                        // 是否启用控制流扁平化。这会极大地改变代码结构，使其难以理解。
                                        // 设置为 false 是因为此选项会显著增加代码大小并降低运行时性能。
                                        controlFlowFlattening: false,
                                        // 应用控制流扁平化的概率。仅当 controlFlowFlattening 为 true 时有效。
                                        controlFlowFlatteningThreshold: 0,
                                        // 是否随机注入无用的死代码块。
                                        // 设置为 false 是因为这会增加代码大小。
                                        deadCodeInjection: false,
                                        // 是否开启调试保护。开启后，如果开发者工具被打开，代码会进入死循环。
                                        debugProtection: false,
                                        // 开启调试保护后，进入死循环的间隔（以毫秒为单位）。仅当 debugProtection 为 true 时有效。
                                        debugProtectionInterval: 0,
                                        // 是否禁用 console.log, console.info, console.error, console.warn 等 console 方法的输出。
                                        disableConsoleOutput: true,
                                        // 设置标识符（变量名、函数名等）的生成方式。
                                        // 可选值：'dictionary', 'hexadecimal', 'mangled', 'mangled-shuffled'
                                        identifierNamesGenerator: 'mangled-shuffled',
                                        // 是否在控制台打印混淆过程的日志信息。
                                        log: false,
                                        // 是否将数字转换为表达式。例如 2023 -> 0x7e7。
                                        // 设置为 false 以避免潜在的性能问题。
                                        numbersToExpressions: false,
                                        // 是否重命名全局作用域下的变量和函数名。
                                        // 建议保持 false，以避免破坏与其他脚本或库的集成。
                                        renameGlobals: false,
                                        // 是否开启自我防御。开启后，任何试图格式化或美化代码的行为都会导致代码无法运行。
                                        // 设置为 false 是因为这会显著增加代码大小和复杂性。
                                        selfDefending: false,
                                        // 是否简化代码。移除多余的括号，将 `var` 转换为 `const` 或 `let` 等。
                                        simplify: true,
                                        // 是否将长的字符串分割成多个部分，并用 `+` 连接。
                                        // 设置为 false 以获得更好的性能。
                                        splitStrings: false,
                                        // 分割字符串的块长度。仅当 splitStrings 为 true 时有效。
                                        splitStringsChunkLength: 0,
                                        // 核心选项：是否创建一个字符串数组，并将所有字面量字符串移动到该数组中。
                                        stringArray: true,
                                        // 是否转换对字符串数组的调用。这使得代码更难理解。
                                        stringArrayCallsTransform: true,
                                        // 字符串数组的编码方式。'rc4' 是一种流式加密算法，安全性较高。
                                        // 可选值：['none'], ['base64'], ['rc4']
                                        stringArrayEncoding: ['rc4'],
                                        // 将字符串移动到字符串数组的概率（0 到 1）。
                                        stringArrayThreshold: 1,
                                        // 是否转换和混淆对象的键名。
                                        transformObjectKeys: false,
                                        // 是否将所有字符串转换为 Unicode 转义序列（例如 'hello' -> '\u0068\u0065\u006c\u006c\u006f'）。
                                        unicodeEscapeSequence: true
                                    }
                                );
                                return obfuscationResult.getObfuscatedCode();
                            }
                            return content;
                        };
                    }
                });
                return args;
            });
        }
    },

});
