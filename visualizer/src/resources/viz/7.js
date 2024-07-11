var stirnos = 'https://video.wixstatic.com/video/2c9010_4c6de5ad340a49ae8f26e0845413bd2b/1080p/mp4/file.mp4'
s0.initVideo(stirnos)
src(s0).invert()
.blend(gradient().hue(0.3))
.modulate(voronoi(10))
.out()
