const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const JsonMinimizerPlugin = require('json-minimizer-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
    background: path.resolve(__dirname, './src/background.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.json$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      inject: 'body',
      chunks: ['main'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/manifest.json'),
          to: path.resolve(__dirname, './dist'),
        },
        {
          from: path.resolve(__dirname, './src/styles.css'),
          to: path.resolve(__dirname, './dist/styles.css'),
        },
        {
          from: path.resolve(__dirname, './src/images'),
          to: path.resolve(__dirname, './dist/images'),
        },
      ],
    }),
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new JsonMinimizerPlugin(), '...'],
  },
}
