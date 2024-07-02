import './patchGlobal'
import {createCodePreview} from './code'
import {createHydra} from './hydra'
import {isEvalMessage} from './message'
import './main.css'

const container = document.querySelector('#app')!
const canvas = container.appendChild(document.createElement('canvas'))

canvas.className = 'hydra'
canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight

const hydra = createHydra(canvas)
const codePreview = createCodePreview(container)

window.addEventListener('message', (event) => {
  const message = event.data

  if (isEvalMessage(message)) {
    codePreview.setCode(message.code)
    hydra.evalCode(message.code)
  }
})
