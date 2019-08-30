const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin') // 静态资源输出
const HtmlWebpackPlugin = require('html-webpack-plugin') // html模板
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清除

// extract-text-webpack-plugin 在 webpack 4 中不能用了, 使用 mini-css-extract-plugin代替
// const ExtractTextPlugin = require("extract-text-webpack-plugin") // 将样式表抽离成专门的单独文件

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const glob = require('glob') // glob返回含有匹配文件或目录的数组
const vConsolePlugin = require('vconsole-webpack-plugin') // 在本地开发环境和测试环境中调试

const TerserPlugin = require('terser-webpack-plugin')

console.log('process', process.env.NODE_ENV)

// 多个入口文件
function getEntries(globPath) {
    let files = glob.sync(path.resolve(__dirname, globPath)),
        entries = {}
    files.forEach(function(filepath) {
        let split = filepath.split('/')
        let name = split[split.length - 2]
        let entity = []
        entity.push(filepath)
        entries[name] = entity
    })
    console.log('||:', entries)
    return entries
}
const entriesList = getEntries('./src/views/**/*.js')

const htmlArray = []
Object.keys(entriesList).forEach(element => {
    htmlArray.push({
        _html: element,
        title: '',
        chunks: ['vendor', element]
    })
})
const getHtmlConfig = function (name, chunks) { // 获取html-webpack-plugin参数
    return {
        filename: `html/${name}/${name}.html`, // 指定生成的文件名称：index-[hash].html
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
    mode: 'development',
    entry: entriesList,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'static/js/[name]/[name].js',
        publicPath: '../../'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|ico)$/, // 图片处理 在模板中的引用方式:require(图片地址)
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1 * 1024, // 图片大小
                        name (file) {
                            if (file.indexOf('views') == '-1') {
                                return 'static/img/common/[name].[ext]'
                            }
                            let filePath = file.substring((file.indexOf('views') + 5), file.lastIndexOf('/'))
                            return './static/img' + filePath.replace('/img', '') + '/[name].[ext]'
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
                loader: 'url-loader?limit=1000&name=static/fonts/[name].[ext]', // 解析url路径
            },
            {
                test: /\.(sa|sc|c)ss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                    'sass-loader',
                ],
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(), // 每次打包之前都删除dist文件
        new CopyWebpackPlugin([ // 静态资源输出
            {
                from: path.resolve(__dirname, 'static'),
                to: path.resolve(__dirname, 'dist/static')
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
		    jQuery: 'jquery',
		    'window.jQuqery': 'jquery'
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name]/[name].css',
            chunkFilename: '[id].css',
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        host: 'localhost',
        port: 9000,
        before (app, server) {
            app.engine('.html', require('ejs').__express)
            app.set('views', __dirname + '/src')
            app.set('view engine', 'html')

            app.get('/', function(req, res) {
                var list = []
                for (const key in entriesList) {
                    if (entriesList.hasOwnProperty(key)) {
                        const element = entriesList[key][1]
                        list.push(element)
                        console.log('element:', element)
                    }
                }
                console.log('list', list)
                res.render('index.html', {
                    list
                })
            })
        }
    },
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
    console.log('***:', env)
    const devMode = env.NODE_ENV !== 'production'
    // webpack --env.NODE_ENV=local --env.production --progress
    if (devMode) {
        // 本地和测试环境开启热更新
        webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
        webpackConfig.plugins.push(new vConsolePlugin({enable: true})) // vconsole调试
    }
    
    return webpackConfig
}
