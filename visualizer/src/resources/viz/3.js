//red cam and sound
s0.initCam()
src(s0).hue(0.9).modulate(o0, 0.05).blend(o0, 0.8).modulateScale(noise(2, 0.3), 0.2).mult(solid(1, 0, 0.8))
.layer(solid(0.4, 0.1, 0.8).mask(shape(5).scroll(200).modulate(noise(10, 0.6), 0.2, 0.1).scale(() => a.fft[0]+0.1 * 2)))
  .out()
