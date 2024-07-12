import {useState} from 'preact/hooks'
import {Button, Monaco} from '../components'
import {useHydraPreview} from './useHydraPreview'

const defaultCode = `
// var stirnos = 'https://video.wixstatic.com/video/2c9010_90f4926836334c988232ab4faef3aaa5/1080p/mp4/file.mp4'
// var jura = 'https://video.wixstatic.com/video/2c9010_4c6de5ad340a49ae8f26e0845413bd2b/1080p/mp4/file.mp4'
// var arkliai = 'https://video.wixstatic.com/video/2c9010_c28a4492132a40fab92f2f4c8637a501/1080p/mp4/file.mp4'
// var trees = 'https://video.wixstatic.com/video/2c9010_1b3af35af9a74b2ea8d5fe7e3840ae5a/1080p/mp4/file.mp4'
// var moon = 'https://video.wixstatic.com/video/2c9010_50940192a2734df088967d51f1123ad3/720p/mp4/file.mp4'

//Example, sound reactive oscilator
a.setScale(10)
a.setBins(6)
a.setSmooth(0.8)
a.show()
osc(10, 0.2, 0.5)
.hue(0.1)
.luma()
.modulate(osc().rotate(30))
.modulateRotate(noise(3))
.layer(
  solid(1, 0, 0.2)
  .mask(shape(5).modulate(noise(10, 0.6), 0.2, 0.1).scale(() => a.fft[0] * 6))
  .rotate(() => Math.sin(time)))
  .out()

// Video usage
s0.initVideo(trees)
src(s0).out()

// Tutorial
// Video generators:

// OSCILLATOR
// osc(freq, speed, color_offset) e.g. 
// osc(20, 0.2, 0.5).out()

// NOISE (perlin noise generator)
// noise(number, speed) e.g. 
// noise(3, 0.5).out()

// VORONOI
// voronoi(number, speed) e.g.
// voronoi(20, 0.5).out()

// SHAPE
// shape(sides,radius,smoothing), e.g.
// shape(3, 0.01)




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
