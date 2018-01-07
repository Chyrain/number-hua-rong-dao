const webpack = require("webpack");
const path = require("path");

const ROOT_PATH = path.resolve(__dirname, "../");
const CONFIG_PATH = path.resolve(ROOT_PATH, "./build_config"); // 配置文件目录
const BUILD_PATH = path.resolve(ROOT_PATH, "dist"); // 编译输出目录
const SRC_PATH = path.resolve(ROOT_PATH, "src"); // 所有源文件所在top路径
const LIB_PATH = path.resolve(SRC_PATH, "./public/lib"); // 通用第三方库目录

const vendors = ["react", "react-dom", "react-redux", "prop-types", "redux"];

module.exports = {
  output: {
    path: path.resolve(BUILD_PATH, "lib"),
    filename: "[name]_[chunkhash:10].js", //_[chunkhash:10]
    library: "[name]_[chunkhash:10]" //_[chunkhash:10]
  },
  entry: {
    dll: vendors
  },
  module: {
    rules: [
      {
        test: require.resolve("react"),
        use: [
          {
            loader: "expose-loader",
            options: "React"
          }
        ]
      },
      // 除了react外要用路径
      {
        test: /\/node_modules\/react-dom\//, // require.resolve('react-dom'),
        use: [
          {
            loader: "expose-loader",
            options: "ReactDOM"
          }
        ]
      },
      {
        test: /\/node_modules\/redux\//,
        use: [
          {
            loader: "expose-loader",
            options: "Redux"
          }
        ]
      },
      {
        test: /\/node_modules\/react-redux\//,
        use: [
          {
            loader: "expose-loader",
            options: "ReactRedux"
          }
        ]
      },
      {
        test: /\/node_modules\/prop-types\//,
        use: [
          {
            loader: "expose-loader",
            options: "PropTypes"
          }
        ]
      }
    ]
  },
  // externals: { // 该用expose-loader
  //   'react': 'React',
  //   'react-dom': 'ReactDOM',
  //   'redux': 'Redux',
  //   'react-redux': 'ReactRedux', //对require有效
  //   // 'react-bootstrap': 'ReactBootstrap',//对require有效 (部分引入故不采用externals)
  //   // 'react-addons-css-transition-group': { commonjs: 'react-addons-css-transition-group', commonjs2: 'react-addons-css-transition-group', amd: 'react-addons-css-transition-group', root: ['React','addons','CSSTransitionGroup'] }
  // },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.DllPlugin({
      path: path.resolve(CONFIG_PATH, "./manifest.json"),
      name: "[name]_[chunkhash:10]",
      context: __dirname
    }),
    // 压缩代码,命令行的 webpack -p 会默认使用这个插件压缩代码
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      minimize: true,
      sourceMap: true,
      output: { comments: false }
    })
  ]
};
