
webpack构建多页面应用程序总结：
现存在问题：
1.打包后dist里面没有对应到当前的目录，例如 
`   src/views/register/img
    src/views/register/template.html
    src/views/register/main.js
    src/views/register/style.scss`
打包输出后的正确目录层级应为：
`   dist/html/register.html
    dist/static/scss/register/
    dist/static/img/register/
    dist/static/js/register/`
公用的文件
`   src/assets/img
    src/assets/font
    src/assets/js
    src/assets/scss`
打包后的层级正确的应为：
`   dist/static/scss/
    dist/static/img/
    dist/static/js/`

2.单独提取css文件---未完成

3.压缩js文件---未完成

4.测试环境部署上线----未完成

5.生产环境部署上线----未完成



_________________________________________________________


#### 作用:
单页面开发的时候，将入口文件里面的关系网打理好，最后一并打包输出。webpack只认识js文件并不认识其他的文件，需要借助于loader进行解析并打包输出。


#### 常用的Loader:

babel-loader @babel/core @babel/preset-env -> 解析js文件，并输出

没有增加.babelrc文件也能成功解析ES6语法


style-loader css-loader sass-loader node-sass stylus-loader -> 解析css scss文件或内联style样式

file-loader url-loader -> 解析图片(png,jpg,gif,svg)文件

postcss-loader autoprefixer -> 给css添加前缀

vue-loader vue-template-compiler -> 解析vue文件


确保VueLoaderPlugin引入到plugins里面
`Plugins:
new VueLoaderPlugin()`  


html-webpack-plugin 对多个html文件指定同一个模板，生成多个html文件

new HtmlWepbackPlugin()时报错：Entrypoint undefined，处理：stats: { children: false }

extract-text-webpack-plugin 将文件当作文本处理，抽取出来

UglifyJsPlugin/new webpack.optimize.UglifyJsPlugin() 对js进行合并压缩，配置项例如删除空格、删除注释
webpack4已删除webpack.optimize.UglifyJsPlugin，使用 config.optimization.minimize替代：
`optimization:{ minimize: true }`


CommonsChunkPlugin/new webpack.optimize.CommonsChunkPlugin() 抽取公共模块，应用于多页面效果更佳

clean-webpack-plugin 打包之前先将文件给清除掉

copy-webpack-plugin 复制


#### 安装webpack依赖：

npm i —save-dev webpack@^2.0.0 表示安装2.0.0以上版本但不能是3.0.0

npm i —save-dev webpack@2.2.0 表示指定安装的2.2.0版本 

npm i —save-dev extract-text-webpack-plugin@next 表示安装稳定版本之后的测试版，beta版本

npm i -D:  -D = —save-dev => 工程构建时的依赖（开发时，打包时）

npm i -S:  -S = —save  => 项目依赖（运行时，发布到生产环境时）



npm i webpack webpack-cli -g

webpack必须全局安装，否则报错webpack command not found

webpack-cli必须全局安装，否则一直提示安装webpack-cli

npm i --save-dev webpack webpack-cli

npm i --save-dev vue-loader 

npm i --save-dev babel-loader @babel/core @babel@preset-env

npm i --save vue-loader vue vue-template-compiler

npm i --save sass-loader node-sass css-loader style-loader stylus-loader

注意：

vue-loader与vue-template-complier配合使用，升级时必须一起升级

webpack-cli:webpack4时启动的脚本都是通过webpack-cli上操作的



#### npm包管理上传:
package.json -> 通过npm初始化的，npm包通过webpack管理

初始化：

vue-toast for mobile: 插件vue-toast-m

mkdir cd vue-toast-demo 

npm init -y

发布npm包：

npm adduser

npm whoami 查看当前用户

npm publish


参考资料：
vue-loader vue-temmplate-complier: https://vue-loader.vuejs.org/zh/guide
babel-loader babel-core: https://babeljs.io/setup#installation
babel-preset-env: https://babeljs.io/docs/en/babel-preset-env
loaders: https://www.webpackjs.com/loaders/



### webpack多页面应用

加载jQuery
安装jQuery: npm i —save-dev jQuery

##### 第一种方式：src/js/index.js:
`import '../css/index.css'
require(['./common.js', 'jQuery'], function (common, $) {
    common.initIndex()
    $(function () {
        console.log('this is jQuery.')
    })
})`

##### 第二种方式：全局包暴露，不需要在单独在require中加载就可以直接使用
webpack.config.js:
`const webpack = require(‘webpack’);
plugins: [
	new webpack.ProvidePlugin({
		$: ‘jquery’,
		jQuery: ‘jquery’,
		‘window.jQuqery’: ‘jquery’
	})
]`

##### 抽取公共部分：
`new webpack.optimize.CommonsChunkPlugin({
	name: ‘vendor’,
	chunks: [‘index’, ‘cart’, ‘vendor’],
	mikChunks: 3
})`


##### 抽取文件插件：
`const ExtractTextWebpackPlugin = require(‘extract-text-webpack-plugin')
module: {
	rules: [
		{
                test: /\.css$/,
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
                use: ExtractTextWebpackPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
		}
	]
},
plugins: [
	new ExtractTextWebpackPlugin('index.css')
]`
说明：抽取出来后页面会加载文件，不友好，改用直接将样式加载到当前文件中。



### 报错处理与解决：

`sh: webpack-dev-server: command not found
npm install webpack-dev-server -g
`

`
cross-env: command not found
删除：cross-env
`

`
bash: webpack: command not found
npm i webpack webpack-cli -g
`

`
npm ERR! Refusing to install package with name "webpack" under a package
npm ERR! also called "webpack". Did you name your project the same
`
原因:npm init时name不能与webpack相同
