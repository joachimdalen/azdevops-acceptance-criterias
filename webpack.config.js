const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const entries = {};
const roots = {
  control: 'control-container',
  panel: 'panel-container',
  admin: 'admin-container'
};
const samplesDir = path.join(__dirname, 'src');
fs.readdirSync(samplesDir).filter(dir => {
  if (fs.statSync(path.join(samplesDir, dir)).isDirectory()) {
    entries[dir] = './' + path.relative(process.cwd(), path.join(samplesDir, dir, dir));
  }
});
// https://stackoverflow.com/questions/31735584/delete-unused-webpack-chunked-files/43017089
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
        { from: 'dist/admin.html', to: 'admin.html' }
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
    Object.keys(entries)
      .filter(x => x !== 'common')
      .map(key => {
        return new HtmlWebpackPlugin({
          filename: key + '.html',
          inject: false,
          templateContent: ({ htmlWebpackPlugin }) =>
            `<html><head>${htmlWebpackPlugin.tags.headTags}</head><body><div id="${roots[key]}"></div>${htmlWebpackPlugin.tags.bodyTags}</body></html>`,
          chunks: [key]
        });
      })
  )
};
