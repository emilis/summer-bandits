// licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
//DUNKNOWNUSER


a.show()
voronoi(350,0.15)
  	.modulateScale(osc(50).rotate(Math.sin(time)/4),.5)
  	.thresh(.7)
.scale(()=>a.fft[1]-8)
	.modulateRotate(osc(),.4)
  	.diff(src(o0).scale(1.8))
	.modulateScale(osc(2).modulateRotate(o0,.74))
	.diff(src(o0).rotate([-.012,.01,-.002,0]).scrollY(0,[-1/199800,0].fast(0.7)))
.posterize(10)
	.out()
