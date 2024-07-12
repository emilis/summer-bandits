import {useState} from 'preact/hooks'
import {Button, Monaco} from '../components'
import {useHydraPreview} from './useHydraPreview'

const defaultCode = `
// var stirnos = 'https://video.wixstatic.com/video/2c9010_90f4926836334c988232ab4faef3aaa5/1080p/mp4/file.mp4'
// var jura = 'https://video.wixstatic.com/video/2c9010_4c6de5ad340a49ae8f26e0845413bd2b/1080p/mp4/file.mp4'
// var arkliai = 'https://video.wixstatic.com/video/2c9010_c28a4492132a40fab92f2f4c8637a501/1080p/mp4/file.mp4'
// var trees = 'https://video.wixstatic.com/video/2c9010_1b3af35af9a74b2ea8d5fe7e3840ae5a/1080p/mp4/file.mp4'
// var moon = 'https://video.wixstatic.com/video/2c9010_50940192a2734df088967d51f1123ad3/720p/mp4/file.mp4'

// Example 1, sound reactive oscilator
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

// Example 2
// use s0.initCam(1) or (2) to get the stream from another camera
// s0.initCam()
// a.setScale(5)
// a.setBins(6)
// a.show()
// src(s0)
//   .luma(0.4, 0.2)
//   .add(gradient())
//   .modulateScale(noise(() => (a.fft[0]+0.5) *3), 0.2, 0.8).out()

// Example 3
// red cam and sound
//red cam and sound
// s0.initCam()
// src(s0).hue(0.9).modulate(o0, 0.05).blend(o0, 0.8).modulateScale(noise(2, 0.3), 0.2).mult(solid(1, 0, 0.8))
// .layer(solid(0.4, 0.1, 0.8).mask(shape(5).scroll(200).modulate(noise(10, 0.6), 0.2, 0.1).scale(() => a.fft[0]+0.1 * 2)))
//   .out()

// Example 4
// A little bit 3d
// noise(10, 0.2)
// .modulate(o0)
// .blend(gradient(0.5))
// .blend(o0, 0.9)
// .modulateScale(osc(3, 0.2).rotate(() => Math.sin(time) * 4)).out()

// Example 5, image
// var hypnotoad = 'https://i.ibb.co/wrt8mLz/hypnotoad.png'
// s0.initImage(hypnotoad)
// gradient(0.2)
//   .blend(osc().kaleid(100))
//   .modulate(noise(3,0.2))
//   .contrast(2)
//   .mask(src(s0).modulateScale(noise(4), 0.1).rotate(() => Math.sin(time)/6))
//   .out(o0)

// Example 6 with a script
// await loadScript("https://nodegl.glitch.me/function-list.js");
// osc(20, 0.1, 0.5).diff(osc(1, 2, glslAxis("x"))).modulateScale(noise(3))
// .kaleid(6)
// .rotate(() => Math.sin(time)/4)
//   .out()


// Example 7 
// Based on work of DUNKNOWNUSER
// a.show()
// voronoi(350,0.15)
//   	.modulateScale(osc(50).rotate(Math.sin(time)/4),.5)
//   	.thresh(.7)
// .scale(()=>a.fft[1]-8)
// 	.modulateRotate(osc(),.4)
//   	.diff(src(o0).scale(1.8))
// 	.modulateScale(osc(2).modulateRotate(o0,.74))
// 	.diff(src(o0).rotate([-.012,.01,-.002,0]).scrollY(0,[-1/199800,0].fast(0.7)))
// .posterize(10)
// 	.out()

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
// a shape with loads of sides is a circle
// shape(sides,radius,smoothing), e.g.
// shape(3, 0.01)

// GRADIENT
// gradient(speed) the speed determines the speed of color change


// ====Filters===

// HUE
// hue(amount) shifts the colors

// LUMA
// Image mask based on luminosity
// luma(threshold,tolerance)


// COLORAMA
// rather unpredictable color shifter, can be negative
// colorama(amount) 

// ADDERS
// add(function, amount)
// mult(function, amount)
// diff(function, amount)

// ===MODULATION===
// modulate(function, amount)
// modulateScale(function, amount)
// modulateRotate(function, amount)
// modulateHue(function, amount)
// osc(10, 0.2, 0.1).modulate(noise(3, 0)).out()

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
