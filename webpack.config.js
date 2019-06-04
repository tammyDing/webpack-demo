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
                loader: 'file-loader'
            }
        ]
    }
}
