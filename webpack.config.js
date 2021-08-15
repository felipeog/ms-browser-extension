const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const JsonMinimizerPlugin = require('json-minimizer-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/js/index.js'),
    background: path.resolve(__dirname, './src/js/background.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    new HtmlPlugin({
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
          from: path.resolve(__dirname, './src/css/index.css'),
          to: path.resolve(__dirname, './dist'),
        },
        {
          from: path.resolve(__dirname, './src/img'),
          to: path.resolve(__dirname, './dist'),
        },
      ],
    }),
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new JsonMinimizerPlugin(), '...'],
  },
}
