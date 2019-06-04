import avatar from './record-btn.png'
import './index.css'

let img = new Image()
img.src = avatar
img.classList.add('avatar')

let root = document.getElementById('root')

root.append(img)