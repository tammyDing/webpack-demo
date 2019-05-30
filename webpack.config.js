const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin') // 静态资源输出
const HtmlWebpackPlugin = require('html-webpack-plugin') // html模板
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清除

const ExtractTextPlugin = require("extract-text-webpack-plugin") // 将样式表抽离成专门的单独文件

const glob = require('glob') // glob返回含有匹配文件或目录的数组
const vConsolePlugin = require('vconsole-webpack-plugin') // 在本地开发环境和测试环境中调试

const TerserPlugin = require('terser-webpack-plugin')

// 多个入口文件
function getEntries(globPath) {
    let files = glob.sync(path.resolve(__dirname, globPath)),
        entries = {};
    files.forEach(function(filepath) {
        let split = filepath.split('/');
        let name = split[split.length - 2];
        let entity = [];
        entity.push(filepath);
        entries[name] = entity;
    });
    console.log('||:', entries)
    return entries;
}
const entriesList = getEntries('./src/views/**/*.js');

const htmlArray = [];
Object.keys(entriesList).forEach(element => {
    htmlArray.push({
        _html: element,
        title: '',
        chunks: ['vendor', element]
    })
})
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

const webpackConfig = {
    mode: 'none',
    entry: entriesList,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'static/js/[name][hash:8].js',
        publicPath: '../'
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|ico)$/, // 图片处理 在模板中的引用方式:require(图片地址)
                use: {
                    loader: 'file-loader',
                    options: {
                        limit: 1 * 1024, // 图片压缩
                        name (file) {
                            return '/static/img/[name][hash:8].[ext]'
                        }
                    }
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
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
                from: './src/assets',
                to: './static',
                ignore: ['.*']
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        // new webpack.ProvidePlugin({
        //     $: 'jquery',
		//     jQuery: 'jquery',
		//     'window.jQuqery': 'jquery'
        // })
    ],
    optimization: {
        minimize: true
    },
    stats: {
        children: false // 解决HtmlWebpackPlugin编译中报错Entrypoint undefined = index.html的问题
    },
}

// 生成html模板
htmlArray.forEach(element => {
    webpackConfig.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)))
})

module.exports = env => {
    console.log('env:', env.NODE_ENV)
    // webpack --env.NODE_ENV=local --env.production --progress
    if (env.NODE_ENV === 'development') { // 测试环境
        console.log('aaaaa')
        // 本地和测试环境开启热更新
        webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
        // 测试环境打包加入vconsole调试
        webpackConfig.plugins.push(new vConsolePlugin({enable: true}))


        const extractSass = new ExtractTextPlugin({
            filename: '/static/scss/[name].[hash:8].css'
        })

        webpackConfig.module.rules.push({
            test: /\.scss$/,
            use: extractSass.extract({
                use: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                // 在开发环境使用 style-loader
                fallback: "style-loader"
            })
        })
        webpackConfig.plugins.push(extractSass)
    }

    if (env.NODE_ENV === 'production') {
        // js压缩
        webpackConfig.optimization = {
            minimizer: [new TerserPlugin()],
        }
    }

    return webpackConfig
}

