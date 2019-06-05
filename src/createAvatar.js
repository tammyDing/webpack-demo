
import style from './index.scss'

function createAvatar(avatar) {
    let img = new Image()
    img.src = avatar
    // img.classList.add(‘avatar’)
    img.classList.add(style.avatar)
    let root = document.getElementById('root')
    root.append(img)
}

export default createAvatar
