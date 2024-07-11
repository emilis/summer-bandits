
//Image and letters
var redRidingHood = 'https://i.ibb.co/9Hsq4T0/Gustave-Dore-She-was-astonished-to-see-how-her-grandmother-looked.jpg'
p1 = new P5()
var red = [255, 0, 0];
p1.clear();
p1.textSize(100);
//p1.textStyle(NORMAL);
p1.textAlign(p1.LEFT);
p1.fill(red);
p1.textFont('arial');
p1.text('EVERYTHING', p1.displayWidth/3, p1.displayHeight/4+50);
p1.text('WILL BE', p1.displayWidth/3, p1.displayHeight/4+150);
p1.text('ALL RIGHT', p1.displayWidth/3, p1.displayHeight/4+220);
p1.hide();
s1.init({src:p1.canvas})
s0.initImage(redRidingHood)
A = window.innerHeight/window.innerWidth
src(s0)
.modulate(noise(2,.2))
.layer(
  src(s1).mult(osc(0.1,0.03,0.3).modulate(noise(3,0.3)))
       .modulate(noise(1.5,0.05).brightness(200)))
.modulateScale(shape(300,.2,.0125)
               .scrollX(-.5).rotate(()=>time/5).scale(1.2,A,1.2),-.75)
.modulateScale(shape(30,.2,.0125)
               .scrollX(-.5).rotate(()=>time/15).scale(1,A,1),-.75)
.modulateScale(shape(30,.2,.0125)
               .scrollX(-.5).rotate(()=>time/10).scale(.8,A,.8),-.75)
.blend(src(s0).scrollX(0.01))
.out()


// 'https://pixeldrain.com/u/L3BSAAWM'
// 'https://pixeldrain.com/u/7GLUg9TF GustaveDore_She_was_astonished_to_see_how_her_grandmother_looked.jpg'
// 'https://pixeldrain.com/u/iqVzBN6q hypnotoad.png'
// 'https://pixeldrain.com/u/aCvmAJiw MOV03755.MPG'
