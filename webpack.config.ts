import * as path from 'path';
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import * as webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';


// tslint:disable
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ClosurePlugin = require('closure-webpack-plugin');
const SassLintPlugin = require('sass-lint-webpack');
const AutoPrefixerPlugin = require('autoprefixer');
// tslint:enable
const devServer: DevServerConfiguration = {};
const config: webpack.Configuration = {
  mode: 'development',
  entry: ['./src/index.ts', './src/main.scss'],
  devtool: 'source-map',
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
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
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
    path: path.join(__dirname, 'dist'),
    filename: '[name][contenthash].min.js',
    clean:true, 
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/'),
    },
    compress: true,
    open: true, 
    port: 3000,
  },
  plugins: [
    new SassLintPlugin({
      files: 'src/**.scss',
    }),
    new MiniCssExtractPlugin({
      filename: '[name][contenthash].min.css',
    }),
    new HtmlWebpackPlugin({
      title:'HTML APP',
      filename:'index.html',
      template:'./src/index.html'

    })

  ],
  optimization: {
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
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  
};

// tslint:disable-next-line
export default config;
