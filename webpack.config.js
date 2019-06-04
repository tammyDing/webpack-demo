const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/index.js', // 项目打包的入口文件
    output: {
        path: path.resolve(__dirname, 'dist'), // 打包出来的文件存放目录
        filename: 'bundle.js' // 打包出来的js
    },
    module: {
        rules: [
            {
                test: /\.jpe?g|png|gif|ico$/,
                use: {
                    loader: 'url-loader',
                    options: { // placeholder => 占位符
                        name: '[name].[ext]',
                        outputPath: 'images/', // 打包到的目录
                        limit: 2048 // 图片超过了2048个字节的话就打包到dist目录下，小于2KB的话就打包成base64字符串形式
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}
