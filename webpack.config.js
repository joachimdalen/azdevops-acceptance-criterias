const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const modules = [
  {
    name: 'common',
    entry: './src/common/common',
    generate: false
  },
  {
    name: 'control',
    entry: './src/control/module',
    root: 'control-container',
    generate: true
  },
  {
    name: 'panel',
    entry: './src/panel/module',
    root: 'panel-container',
    generate: true
  },
  {
    name: 'admin-hub',
    entry: './src/admin-hub/module',
    root: 'admin-hub-container',
    generate: true
  },
  {
    name: 'work-hub',
    entry: './src/work-hub/module',
    root: 'work-hub-container',
    generate: true
  }
];

const entries = modules.reduce(
  (obj, item) => ({
    ...obj,
    [item.name]: item.entry
  }),
  {}
);

console.log(entries);

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    watchFiles: {
      paths: ['src/**']
    },
    devMiddleware: {
      writeToDisk: false
      // stats: 'errors-only'
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    https: true,
    port: 3000,
    hot: true,
    static: [path.resolve(__dirname, 'dist')],
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /\/static\/.+/, to: '/' },
        { from: 'dist/control.html', to: 'control.html' },
        { from: 'dist/panel.html', to: 'panel.html' },
        { from: 'admin.html', to: 'admin-hub.html' }
      ]
    }
  },
  entry: entries,
  output: {
    //  publicPath: '.',
    publicPath: '/',
    //filename: 'static/[name].[chunkhash:8].js',
    filename: 'static/[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'azure-devops-extension-sdk': path.resolve('node_modules/azure-devops-extension-sdk')
    }
  },
  // stats: 'errors-only',
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'azure-devops-ui/buildScripts/css-variables-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.woff$/,
        use: [
          {
            loader: 'base64-inline-loader'
          }
        ]
      },
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    // new CopyPlugin({
    //   patterns: [
    //     { from: 'modules/control/index.html', to: 'control/index.html' },
    //     { from: 'modules/panel/index.html', to: 'panel/index.html' }
    //   ]
    // })
  ].concat(
    modules
      .filter(x => x.generate)
      .map(entry => {
        return new HtmlWebpackPlugin({
          filename: entry.name + '.html',
          inject: false,
          templateContent: ({ htmlWebpackPlugin }) =>
            `<html><head>${htmlWebpackPlugin.tags.headTags}</head><body><div id="${entry.root}"></div>${htmlWebpackPlugin.tags.bodyTags}</body></html>`,
          chunks: [entry.name]
        });
      })
  )
};
