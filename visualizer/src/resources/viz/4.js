// A little bit 3d
noise(10, 0.2)
.modulate(o0)
.blend(gradient(0.5))
.blend(o0, 0.9)
.modulateScale(osc(3, 0.2).rotate(() => Math.sin(time) * 4)).out()
