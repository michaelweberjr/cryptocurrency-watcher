const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './client/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [ 
              "@babel/plugin-transform-runtime"
            ]
          },
        },
      },
    ],
  },
  devServer: {
    // host: '0.0.0.0',
    publicPath: '/dist/',
    proxy: {
      '/': 'http://localhost:3000',
    }
  }
};
