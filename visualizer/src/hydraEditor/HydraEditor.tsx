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

// // by ΔNDR0M3DΔ
// // https://www.instagram.com/androm3_da/
// noise(3,0.3,3).thresh(0.3,0.03).diff(o3,0.3).out(o1)
// gradient([0.3,0.3,3]).diff(o0).blend(o1).out(o3)
// voronoi(33,3,30).rotate(3,0.3,0).modulateScale(o2,0.3).color(-3,3,0).brightness(3).out(o0)
// shape(30,0.3,1).invert(({time})=>Math.sin(time)*3).out(o2)
// render(o3)




// // licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// // ameba 
// // @mokitzo
// noise(3,.9)
// .repeat([1,2,3], [1,2], () => Math.sin(time/2), () => Math.sin(time/2))
// .color(2,5,3.5)
// .out(o0)

// // licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// //DANIELA CAÑIZARES
// s0.initCam()
// src(s0).modulate(noise(10,0.3)).diff(o0)
// .out(o1)
// a.setBins(4)
// osc(()=>a.fft[0],-0.0018,0.17).diff(osc(20,0.00008,1).rotate(Math.sin(time)).add(o0,0.8))
// .modulateScale(noise(20,0.18).modulatePixelate(gradient(({time})=>Math.sin(time),2).rotate(()=>Math.sin(time*0.6))),0.2,0.5)
// .posterize(1) .rotate(1, 0.2, 0.01, 0.001)
// .color([5, 3,3],[5, 5,3],[5, 3,3]).diff(o0,0.9).contrast(0.18, 0.3, 0.1, 0.2, 0.03, 1).modulate(osc(13,0,1)
//   .kaleid()
//   .scale(0.7)
//   .rotate(()=>time)) 
//               .out(o0)
// a.show()
// render(o1)


// // licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// // @woshibide

// let ch1 = ()=>a.fft[0]
// let ch2 = ()=>a.fft[1]
// let ch3 = ()=>a.fft[2]
// let ch4 = ()=>a.fft[3]

// a.show()
// a.setSmooth(0.9)
// a.setCutoff(0.3)
// a.setScale(10)

// osc(4, 0.3, 1)
//   .modulate(osc(4,0,0))
//   .modulateScale(voronoi(ch4))
//   .modulateKaleid(noise(Math.cos(Math.cos(time/2))),20,3)
//   .modulateRepeat(osc(Math.tan(time)), 30)
//   .modulateKaleid(noise(Math.cos(Math.sin(time/2))),20,3)
//   .out()


// // licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// // ee_1 . EYE IN THE SKY
// //example of mask and function modulation
// // e_e // @eerie_ear
// noise(18)
//   .colorama(4)
//   .posterize(2)
//   .kaleid(50)
//   .mask(
//     shape(28, 0.25).modulateScale(
//       noise(200.5, 0.5)
//     )
//   )
//   .mask(shape(400, 1, 2.125))
//   .modulateScale(osc(6, 0.125, 0.05).kaleid(60))
//   .mult(osc(20, 0.05, 2.4).kaleid(50), 0.25)
//   .scale(1.75, 0.65, 0.5)
//   .modulate(noise(3.5))
//   .saturate(6)
//   .posterize(7, 0.2)
//   .scale(1.5)
//   .out();


// src(s0).modulate(o0, ()=>a.fft[1]*0.25).pixelate(100,100).diff(o0).color(-2,0.2,-1).modulate(o0).out()




// //clouds of passage
// //by Nesso
// //www.nesso.xyz

// shape([4,5,6].fast(0.1).smooth(1),0.000001,[0.2,0.7].smooth(1))
// .color(0.2,0.4,0.3)
// .scrollX(()=>Math.sin(time*0.27))
// .add(
//   shape([4,5,6].fast(0.1).smooth(1),0.000001,[0.2,0.7,0.5,0.3].smooth(1))
//   .color(0.6,0.2,0.5)
//   .scrollY(0.35)
//   .scrollX(()=>Math.sin(time*0.33)))
// .add(
//   shape([4,5,6].fast(0.1).smooth(1),0.000001,[0.2,0.7,0.3].smooth(1))
//   .color(0.2,0.4,0.6)
//   .scrollY(-0.35)
//   .scrollX(()=>Math.sin(time*0.41)*-1))
// .add(
//       src(o0).shift(0.001,0.01,0.001)
//       .scrollX([0.05,-0.05].fast(0.1).smooth(1))
//       .scale([1.05,0.9].fast(0.3).smooth(1),[1.05,0.9,1].fast(0.29).smooth(1))
//       ,0.85)
// .modulate(voronoi(10,2,2))
// .out()


// // Video usage
// s0.initVideo(trees)
// src(s0).out()

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
