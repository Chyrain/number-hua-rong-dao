// webpack.dist.config.js
const webpack = require("webpack");
const path = require("path");
const merge = require("webpack-merge");
const {
  MODULE,
  manifest,
  APP_PATH,
  BUILD_PATH,
  config
} = require("./webpack.base.config.js");

const HtmlwebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin"); //分离CSS和JS文件

const env = "production";
module.exports = merge(config(env), {
  //配置生成Source Maps，选择合适的选项("source-map|cheap-module-source-map|eval-source-map|cheap-module-eval-source-map")
  // devtool: 'source-map',
  plugins: [
    // 定义在生产环境
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(env)
      }
    }),
    new ExtractTextPlugin({
      filename: "[name]_[contenthash:10].css",
      disable: false,
      allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_debugger: true,
        drop_console: true
      },
      sourceMap: false
    }),
    // 将 moduel id 换成具体路径名（使用commonChunkHash时）
    new webpack.HashedModuleIdsPlugin(),
    //在文件开头插入banner
    new webpack.BannerPlugin("Copyright © 2018 by V5KF. All rights reserved."),
    new HtmlwebpackPlugin({
      chunksSortMode: "manual",
      template: path.resolve(APP_PATH, "./index.html"),
      filename: "index.html",
      inject: "body",
      dll: `../lib/${manifest.name}.js`,
      hash: false,
      chunks: ["common", "vendor", "app"],
      minify: {
        // HTML文件压缩
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: false //删除空白符与换行符
      }
    })
  ]
});
