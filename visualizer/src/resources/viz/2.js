// use s0.initCam(1) or (2) to get the stream from another camera
s0.initCam()
a.setScale(5)
a.setBins(6)
a.show()
src(s0)
  .luma(0.4, 0.2)
  .add(gradient())
  .modulateScale(noise(() => (a.fft[0]+0.5) *3), 0.2, 0.8).out()
