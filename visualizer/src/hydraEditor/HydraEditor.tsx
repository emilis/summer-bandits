import {useState} from 'preact/hooks'
import {Button, Monaco} from '../components'
import {useHydraPreview} from './useHydraPreview'

const defaultCode = `
// licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// by Zach Krall
// http://zachkrall.online/

osc(10, 0.9, 300)
.color(0.9, 0.7, 0.8)
.diff(
  osc(45, 0.3, 100)
  .color(0.9, 0.9, 0.9)
  .rotate(0.18)
  .pixelate(12)
  .kaleid()
)
.scrollX(10)
.colorama()
.luma()
.repeatX(4)
.repeatY(4)
.modulate(
  osc(1, -0.9, 300)
)
.scale(2)
.out()
`.trim()

// FIXME:
const hydraTypedefs = `
declare function osc(freq: number, sync: number, offset: number): unknown
`

export const HydraEditor = () => {
  const [code, setCode] = useState(defaultCode)
  const evalCode = useHydraPreview()

  const handleClick = () => {
    evalCode(code)
  }

  return (
    <div>
      <Button onClick={handleClick}>Run</Button>
      <Monaco value={code} language="typescript" typedefs={hydraTypedefs} onChange={setCode} />
    </div>
  )
}
