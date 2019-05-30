const path = require('path') // 处理路径
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin') // 静态资源输出
const HtmlWebpackPlugin = require('html-webpack-plugin') // html模板
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 提取CSS文件 webpack4
const ExtractTextPlugin = require('extract-text-webpack-plugin') // npm i -D ...@next
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const glob = require('glob') // glob返回含有匹配文件或目录的数组

const vConsolePlugin = require('vconsole-webpack-plugin') // 在本地开发环境和测试环境中调试

// production development
const env = process.env.NODE_ENV

// 多个入口文件
function getEntries(globPath) {
    var files = glob.sync(path.resolve(__dirname, globPath)),
        entries = {};
    files.forEach(function(filepath) {
        var split = filepath.split('/');
        var name = split[split.length - 2];
        var entity = [];
        entity.push('./' + filepath);
        entries[name] = entity;
    });
    return entries;
}

const entriesList = getEntries('./src/views/**/*.js');
// entriesList.vendor = ['jquery', 'lodash'] // 多个页面所需的公共库文件，防止重复打包带入

const htmlArray = [];
Object.keys(entriesList).forEach(element => {
    htmlArray.push({
        _html: element,
        title: '',
        chunks: ['vendor', element]
    })
})

const webpackConfig = {
    entry: entriesList,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/'
    },
    module: { // 规则处理
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/, // 排除范围
                include: path.resolve(__dirname, './src') ,
                loader: 'babel-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.(ttf|woff2?|eot|svg)$/,
                loader: 'url-loader?limit=1000&name=static/font/[name].[ext]', // 解析url路径
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(), // 每次打包之前都删除dist文件
        new CopyWebpackPlugin([ // 静态资源输出
            {
                from: path.resolve(__dirname, '../src/assets'),
                to: './static',
                ignore: ['.*']
            }
        ]),
        new MiniCssExtractPlugin({ // 提取为外部css代码
            filename: 'css/[name].css',
            chunkFilename: '[id].css'
        }),
        new webpack.optimize.SplitChunksPlugin({ // 模块拆分，处理大文件
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '-',
            name: true
        }),
        new webpack.ProvidePlugin({ // 全局引入jquery
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            $: 'jquery',
            'process.env.NODE_ENV': 'development'
        }),
        new vConsolePlugin({ // 测试环境打包加入vconsole调试
            enable: process.env.NODE_ENV !== 'production'
        })
    ],
    // watch: true, // 开启监听文件更改，自动刷新
    // watchOptions: {
    //     ignored: /node_modules/, // 忽略不用监听变更的目录
    //     aggregateTimeout: 500, // 防止重复保存频繁重新编译,500毫米内重复保存不打包
    //     poll: 1000 // 每秒询问的文件变更的次数
    // },
    devServer: {
        // contentBase: path.join(__dirname, 'dist'), // 告诉服务器从哪个目录中提供内容
        // publicPath: '/',
        host: '0.0.0.0',
        port: 8880,
        overlay: false, // 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层
        open: true, // 开启浏览器
        hot: true, // 启用热替换
        proxy: { // 服务器代理配置,解决跨越
            /** 
             * https://www.webpackjs.com/configuration/dev-server/#devserver-host
             * 请求到 /api/users 现在会被代理到请求 http://localhost:3000/api/users
             */
            '/api': {
                target: 'http://localhost:3000',
                pathRewrite: {'^/api' : ''},
                secure: false // 不接受运行在https上
            }
        }
    },
};

const getHtmlConfig = function (name, chunks) { // 获取html-webpack-plugin参数
    return {
        filename: `html/${name}.html`, // 指定生成的文件名称：index-[hash].html
        template: `./src/views/${name}/template.html`, // 指定根目录下的index文件
        inject: true, // 指定js放在html的哪个位置
        minify: {
            removeComments: true, // 移除html中的注释
            collapseWhitespace: true, // 移除空白区域,也就是压缩代码
            removeAttributeQuotes: true, // 去除属性引用
        },
        chunks: chunks
    }
}
// 生成html模板
htmlArray.forEach(element => {
    module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)))
});

if (env !== 'development') {
    webpackConfig.optimization.push({
        minimizer: [new TerserPlugin()],
    })
} else {
    // 本地和测试环境开启热更新
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
}

// 对图片路径的处理
webpackConfig.module.rulesl.push({
    test: /\.(png|jpe?g|gif|ico)$/, // 图片处理 在模板中的引用方式:require(图片地址)
    use: {
        loader: 'file-loader',
        options: {
            limit: 1 * 1024, // 图片压缩
            name (file) {
                console.log(file)
                // if (env === 'development') {
                //     return '[path][name].[ext]'
                // }
                return '[hash].[ext]'
            }
        }
    }
})

module.exports = webpackConfig
