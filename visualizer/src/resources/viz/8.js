await loadScript("https://nodegl.glitch.me/function-list.js");
osc(20, 0.1, 0.5).diff(osc(1, 2, glslAxis("x"))).modulateScale(noise(3))
.kaleid(6)
.rotate(() => Math.sin(time)/4)
  .out()
