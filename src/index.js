import avatar from './record-btn.png'
import style from './index.scss'

import createAvatar from './createAvatar'

createAvatar(avatar)

let img = new Image()
img.src = avatar
img.classList.add(style.avatar)

let root = document.getElementById('root')
root.append(img)