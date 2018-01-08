// webpack.base.config.js
const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin"); //分离CSS和JS文件
const argv = require("yargs").argv;

// 应用模块名（可通过--define传参）
const MODULE = argv.define || "app";

const ROOT_PATH = path.resolve(__dirname, "../");
const SRC_PATH = path.resolve(ROOT_PATH, "src"); // 所有源文件所在top路径
const BUILD_PATH = path.resolve(ROOT_PATH, "dist"); // 编译输出目录
const APP_PATH = path.resolve(SRC_PATH, MODULE); // 具体应用业务源代码目录
const ASYNC_PATH = path.resolve(SRC_PATH, "public/async"); // 通用代码目录
const LIB_PATH = path.resolve(SRC_PATH, "public/lib"); // 通用第三方库目录

// const isDebug = process.env.NODE_ENV !== '"production"';
const manifest = require("./manifest.json");

function isDebug(env) {
  return env === "development";
}

module.exports = {
  MODULE,
  manifest,
  ROOT_PATH,
  SRC_PATH,
  APP_PATH,
  BUILD_PATH
};

module.exports.config = env => {
  return {
    //配置生成Source Maps，选择合适的选项("source-map|cheap-module-source-map|eval-source-map|cheap-module-eval-source-map")
    // devtool: 'source-map',
    entry: {
      // 有时需要更改的自定义公共库放到vendor,不用更改代码的第三方库放到dll,使用率低的大文件需要时异步加载(放到require.ensure)
      // vendor: [
      // 	// path.resolve(ASYNC_PATH, 'lame.js'), // require.ensure 异步加载
      // 	// path.resolve(LIB_PATH, 'md5.js'), // 打包进dll
      // 	path.resolve(LIB_PATH, 'jqlite.js')
      // ],
      app: path.resolve(APP_PATH, "index.js")
    },
    output: {
      path: path.resolve(BUILD_PATH, MODULE), //打包后的文件存放的地方
      chunkFilename: isDebug(env)
        ? "[name].chunk.js"
        : "[name]_[chunkhash:10].chunk.js", // commonChunk名称
      filename: isDebug(env) ? "[name].js" : "[name]_[chunkhash:10].js" //打包后输出文件的文件名
    },
    resolve: {
      extensions: [".js", ".jsx", ".scss", ".css"]
    },
    module: {
      rules: [
        {
          test: /\.js[x]?$/,
          include: [
            SRC_PATH //important for performance!
          ],
          loader: "babel-loader"
        },
        {
          test: /\.(styl|scss|css)$/,
          // include: [ // 去掉，以免引入不了node_modules中的库css
          // 	SRC_PATH //important for performance!
          // ],
          use: isDebug(env)
            ? [
                { loader: "style-loader" },
                { loader: "css-loader" },
                {
                  loader: "postcss-loader",
                  options: {
                    // 如果没有options这个选项将会报错 No PostCSS Config found
                    plugins: loader => [
                      require("autoprefixer")() //CSS浏览器兼容
                    ]
                  }
                },
                {
                  loader: "sass-loader",
                  options: {
                    minimize: !isDebug(env),
                    sourceMap: false
                  }
                }
              ]
            : ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                  {
                    loader: "css-loader",
                    options: {
                      minimize: !isDebug(env),
                      sourceMap: false
                    }
                  },
                  {
                    loader: "postcss-loader",
                    options: {
                      // 如果没有options这个选项将会报错 No PostCSS Config found
                      plugins: loader => [
                        require("autoprefixer")() //CSS浏览器兼容
                      ]
                    }
                  },
                  {
                    loader: "sass-loader",
                    options: {
                      minimize: !isDebug(env),
                      sourceMap: false
                    }
                  }
                ],
                publicPath: "../"
              })
        },
        {
          test: /\.(png|gif|jpe?g|svg)$/i,
          include: [path.resolve(SRC_PATH, "./assets/img")],
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 4000,
                name: "../assets/img/[name]_[hash:10].[ext]"
              }
            },
            {
              loader: "image-webpack-loader",
              options: {
                optipng: {
                  optimizationLevel: 7
                },
                gifsicle: {
                  interlaced: false
                },
                pngquant: {
                  quality: "65-90",
                  speed: 4
                },
                mozjpeg: {
                  progressive: true,
                  quality: 65
                }
                // // Specifying webp here will create a WEBP version of your JPG/PNG images
                // webp: {
                // 	quality: 75
                // }
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|svg|eot|ttf)$/i,
          include: [path.resolve(SRC_PATH, "./assets/fonts")],
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 1,
                name: "../assets/fonts/[name]_[hash:10].[ext]"
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      // 多页面应用抽取出公共模块
      // common.bundle.js -> 包含main1.js和main2.js公共部分的代码文件（不包含第三方库代码）
      // vendor.chunk.js -> 包含第三方库
      new webpack.optimize.CommonsChunkPlugin({
        // ['生成的项目公共模块文件名']
        names: ["common"],
        chunks: ["app"],
        filename: isDebug(env)
          ? "[name].bundle.js"
          : "[name]_[chunkhash:10].bundle.js",
        minChunks: 2 // (在提取common之前需要至少2个子 chunk 共享这个模块)
      }),
      // new webpack.optimize.CommonsChunkPlugin({
      //   names: ["vendor"],
      //   filename: isDebug(env)
      //     ? "[name].chunk.js"
      //     : "[name]_[chunkhash:10].chunk.js",
      //   chunks: ["common"],
      //   minChunks: Infinity
      //   // children: true,
      //   // (选择所有被选 chunks 的子 chunks)
      //   // async: true,
      //   // (创建一个异步 公共chunk)
      //   // minChunks: Infinity,
      //   // (在提取之前需要至少三个子 chunk 共享这个模块)
      // }),
      // new webpack.optimize.CommonsChunkPlugin({
      // 	name: 'manifest',
      // 	chunks: ['vendor'],
      // 	// minChunks: Infinity
      // }),
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: manifest
      })
    ]
  };
};
