var stirnos = 'https://video.wixstatic.com/video/2c9010_90f4926836334c988232ab4faef3aaa5/1080p/mp4/file.mp4'
var jura = 'https://video.wixstatic.com/video/2c9010_4c6de5ad340a49ae8f26e0845413bd2b/1080p/mp4/file.mp4'
var arkliai = 'https://video.wixstatic.com/video/2c9010_c28a4492132a40fab92f2f4c8637a501/1080p/mp4/file.mp4'
var trees = 'https://video.wixstatic.com/video/2c9010_1b3af35af9a74b2ea8d5fe7e3840ae5a/1080p/mp4/file.mp4'
s0.initVideo(trees)
src(s0).invert().add(gradient()).hue([0.1, 0.3, 0.5, 0.7, 0]).modulateScale(noise(3), 0.5)
  .blend(src(o0).scrollX(-1)).luma()
.kaleid(6)
.out()
