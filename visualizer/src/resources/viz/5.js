var hypnotoad = 'https://i.ibb.co/wrt8mLz/hypnotoad.png'
s0.initImage(hypnotoad)
gradient(0.2)
  .blend(osc().kaleid(100))
  .modulate(noise(3,0.2))
  .contrast(2)
  .mask(src(s0).modulateScale(noise(4), 0.1).rotate(() => Math.sin(time)/6))
  .out(o0)
