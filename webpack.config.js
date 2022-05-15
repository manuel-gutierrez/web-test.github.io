"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const optimize_css_assets_webpack_plugin_1 = __importDefault(require("optimize-css-assets-webpack-plugin"));
// tslint:disable
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ClosurePlugin = require('closure-webpack-plugin');
const SassLintPlugin = require('sass-lint-webpack');
const AutoPrefixerPlugin = require('autoprefixer');
// tslint:enable
const devServer = {};
const config = {
    mode: 'development',
    entry: ['./src/index.ts', './src/main.scss'],
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                use: {
                    loader: 'tslint-loader',
                    options: {
                        typeCheck: false,
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
            },
            {
                test: /\.s?css$/,
                use: [
                    mini_css_extract_plugin_1.default.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                AutoPrefixerPlugin()
                            ]
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require("sass"),
                        },
                    }
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        path: path.join(__dirname, 'docs/'),
        filename: '[name][contenthash].min.js',
        clean: true,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'docs/'),
        },
        compress: true,
        port: 3000,
    },
    plugins: [
        new SassLintPlugin({
            files: 'src/**.scss',
        }),
        new mini_css_extract_plugin_1.default({
            filename: '[name][contenthash].min.css',
        }),
        new HtmlWebpackPlugin({
            title: 'HTML APP',
            filename: 'index.html',
            template: './src/index.html'
        }),
    ],
    optimization: {
        runtimeChunk: 'single',
        concatenateModules: false,
        minimizer: [
            new ClosurePlugin({}, {
                // TODO(jbruwer): Investigate options for ADVANCED down the line.
                // Because of the closure advanced compilation renames and mangles
                // properties for size savings you have to provide externs files for
                // each third party lib making it really hard to work with things like
                // glue (and others). Since the benefits of these optimizations for
                // static websites are debatable we are switching to simple opts for
                // now.
                compilation_level: 'SIMPLE_OPTIMIZATIONS',
                language_in: 'ECMASCRIPT_2018',
                language_out: 'ECMASCRIPT5_STRICT',
            }),
            new optimize_css_assets_webpack_plugin_1.default({}),
        ],
    },
};
// tslint:disable-next-line
exports.default = config;
