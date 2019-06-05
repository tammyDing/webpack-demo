`
import avatar from './record-btn.png'
import './index.scss'

import createAvatar from './createAvatar'

createAvatar(avatar)

let img = new Image()
img.src = avatar
img.classList.add('avatar')

let root = document.getElementById('root')
root.append(img)
`
解析说明：
createAvatar 引入到index.js中
import './index.scss'全局引入的样式，所以在调用createAvatar(avatar)时，index.scss的样式也会影响到createAvatar
如果不想互相影响，此时可以使用样式的模块化概念，改写为如下index.js:
`
import avatar from './record-btn.png'
import style from './index.scss'

import createAvatar from './createAvatar'

createAvatar(avatar)

let img = new Image()
img.src = avatar
img.classList.add(style.avatar)

let root = document.getElementById('root')
root.append(img)
`
webpack.config.js样式的loader加上module属性： 
`
options: {
    importLoaders: 2,
    modules: true
}
`
此时，如果想在调用时createAvatar(avatar)也有样式，可以在createAvatar.js中引入样式文件


好处：避免不同模块引用相同样式，引起冲突，维护不方便。所以各自引用各自的样式。